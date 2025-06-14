import prisma from "../prisma/prisma.js";

// Create a new payment
 async function createPayment(req, res) {
  try {
    const {
      amount,
      paymentMethod,
      tickets, // Array of {showTimeId, seatId, price}
      transactionId,
      signature,
    } = req.body;

    const userId = req.user.id;

    // Check for already booked seats
    const seatChecks = await Promise.all(
      tickets.map((ticket) =>
        prisma.ticket.findFirst({
          where: {
            showTimeId: ticket.showTimeId,
            seatId: ticket.seatId,
            selectionStatus: "BOOKED",
          },
        })
      )
    );

    const unavailableSeats = seatChecks.filter((seat) => seat !== null);
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some seats are already booked",
      });
    }

    // Create payment and tickets in transaction
    const result = await prisma.$transaction(async (prisma) => {
      const payment = await prisma.payment.create({
        data: {
          amount: parseFloat(amount),
          status: "PENDING",
          paymentMethod,
          transactionId,
          signature,
          userId,
          transaction_code: `TXN_${Date.now()}_${userId}`,
        },
      });

      const createdTickets = await Promise.all(
        tickets.map((ticket) =>
          prisma.ticket.create({
            data: {
              showTimeId: ticket.showTimeId,
              userId,
              seatId: ticket.seatId,
              price: parseFloat(ticket.price),
              paymentId: payment.id,
              qrCode: `QR_${payment.id}_${ticket.seatId}_${Date.now()}`,
              selectionStatus: "SELECTED",
            },
          })
        )
      );

      return { payment, tickets: createdTickets };
    });

    res.status(201).json({
      success: true,
      data: result,
      message: "Payment created successfully",
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message,
    });
  }
}

// Update payment status
 async function updatePaymentStatus(req, res) {
  try {
    const { paymentId } = req.params;
    const { status, transactionId } = req.body;
    const userId = req.user.id;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          transactionId: transactionId || payment.transactionId,
          updatedAt: new Date(),
        },
      });

      if (status === "SUCCESS" || status === "COMPLETED") {
        await prisma.ticket.updateMany({
          where: { paymentId },
          data: { selectionStatus: "BOOKED" },
        });
      }

      return updatedPayment;
    });

    res.json({
      success: true,
      data: result,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
}

// Get all payments of the user
async function getUserPayments(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = { userId}; // Only fetch zero-amount payments
    if (status) whereClause.status = status;
    console.log( whereClause)

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          tickets: {
            include: {
              seat: {
                include: {
                  hall: {
                    include: {
                      filmHall: true,
                    },
                  },
                },
              },
              showTime: {
                include: {
                  movie: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.payment.count({ where: whereClause }),
    ]);

    // Delete payments (if any) and their related tickets
    if (payments.length > 0) {
      const paymentIds = payments.map(payment => payment.id);
      
      await prisma.$transaction(async (tx) => {
        // Fetch payments that are still zero-amount (to prevent mid-operation changes)
        const deletablePayments = await tx.payment.findMany({
          where: {
            id: { in: paymentIds },
            amount: 0 // Ensure amount hasn't changed
          },
          select: { id: true }
        });
        
        const deletablePaymentIds = deletablePayments.map(p => p.id);
        if (deletablePaymentIds.length === 0) return;

        // Delete related tickets first
        await tx.ticket.deleteMany({
          where: { paymentId: { in: deletablePaymentIds } }
        });
        
        // Delete the payments
        await tx.payment.deleteMany({
          where: { id: { in: deletablePaymentIds } }
        });
      });
    }

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get user payments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
}

// Get payment details by ID
 async function getPaymentById(req, res) {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: {
        tickets: {
          include: {
            seat: {
              include: {
                seatType: true,
                hall: {
                  include: {
                    filmHall: true,
                  },
                },
              },
            },
            showTime: {
              include: {
                movie: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
}

// Get ticket details by ID
 async function getTicketById(req, res) {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: parseInt(ticketId),
        userId,
      },
      include: {
        seat: {
          include: {
            seatType: true,
            hall: {
              include: {
                filmHall: true,
              },
            },
          },
        },
        showTime: {
          include: {
            movie: true,
          },
        },
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Get ticket by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
}

// Cancel a payment
async function cancelPayment(req, res) {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
        status: "PENDING",
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found or cannot be cancelled",
      });
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.ticket.deleteMany({ where: { paymentId } });
      await prisma.payment.delete({ where: { id: paymentId } });
    });

    res.json({
      success: true,
      message: "Payment cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel payment",
      error: error.message,
    });
  }
}
export default {
    cancelPayment,
    createPayment,
    getPaymentById,
  updatePaymentStatus,
    getTicketById,
    getUserPayments
}