import prisma from "../prisma/prisma.js";

// Store active selections with user info for cleanup
const activeSelections = new Map();

export default {
  onConnection: (socket, io) => {
    console.log("A user connected:", socket.id);

    // Handle seat selection
    socket.on("selected_seat", async (seatData) => {
      const { userId, showtimeId, seatId } = seatData;

      console.log("Seat selection received:", seatData);

      if (!userId || !showtimeId || !seatId) {
        return socket.emit("seat_selection_error", {
          message: "Missing required fields (userId, showtimeId, seatId)",
        });
      }

      try {
        // Validate showtime exists
        const showtime = await prisma.showTime.findUnique({
          where: { id: Number(showtimeId) },
        });

        if (!showtime) {
          return socket.emit("seat_selection_error", {
            message: "Showtime not found",
          });
        }

        // Validate seat exists
        const seat = await prisma.seat.findUnique({
          where: { id: Number(seatId) },
          include: { seatType: true }
        });

        if (!seat) {
          return socket.emit("seat_selection_error", {
            message: "Seat not found",
          });
        }

        // Check if seat is already booked or selected
        const existingTicket = await prisma.ticket.findFirst({
          where: {
            showTimeId: Number(showtimeId),
            seatId: Number(seatId),
          },
        });

        if (existingTicket) {
          return socket.emit("seat_selection_error", {
            message: existingTicket.selectionStatus === 'BOOKED' 
              ? "Seat is already booked" 
              : "Seat is already selected by another user",
            seatId,
            status: existingTicket.selectionStatus
          });
        }

        // Create temporary selection
        const payment = await prisma.payment.create({
          data: {
            amount: 0, // Will be updated during actual booking
            status: "PENDING",
            paymentMethod: "DEBIT_CARD",
            userId: Number(userId),
          },
        });

        const ticket = await prisma.ticket.create({
          data: {
            showTimeId: Number(showtimeId),
            userId: Number(userId),
            seatId: Number(seatId),
            price: 0, // Will be updated during actual booking
            paymentId: payment.id,
            selectionStatus: "SELECTED",
          },
        });

        console.log("Ticket created (SELECTED):", ticket.id);

        // Store selection info for cleanup
        const selectionKey = `${showtimeId}-${seatId}`;
        activeSelections.set(selectionKey, {
          ticketId: ticket.id,
          paymentId: payment.id,
          userId: Number(userId),
          timeoutId: null
        });

        // Broadcast to ALL clients (including sender for confirmation)
        io.emit("selected_seat", {
          seatId: Number(seatId),
          userId: Number(userId),
          showtimeId: Number(showtimeId),
          status: 'SELECTED'
        });

        // Set auto-cleanup timeout
        const timeoutId = setTimeout(async () => {
          await cleanupSelection(selectionKey, io);
        }, 60000); // 60 seconds

        // Update timeout ID
        activeSelections.get(selectionKey).timeoutId = timeoutId;

        console.log(`Seat ${seatId} selected by user ${userId}, auto-cleanup in 60s`);

      } catch (error) {
        console.error("Error selecting seat:", error);
        socket.emit("seat_selection_error", {
          message: "Something went wrong while selecting seat",
          error: error.message,
        });
      }
    });

    // Handle seat deselection
    socket.on("deselect_seat", async (seatData) => {
      const { userId, showtimeId, seatId } = seatData;

      try {
        const selectionKey = `${showtimeId}-${seatId}`;
        const selection = activeSelections.get(selectionKey);

        if (!selection || selection.userId !== Number(userId)) {
          return socket.emit("seat_deselection_error", {
            message: "Cannot deselect seat - not selected by you",
            seatId
          });
        }

        await cleanupSelection(selectionKey, io);
        
        console.log(`Seat ${seatId} deselected by user ${userId}`);

      } catch (error) {
        console.error("Error deselecting seat:", error);
        socket.emit("seat_deselection_error", {
          message: "Something went wrong while deselecting seat",
          error: error.message,
        });
      }
    });

    // Handle user joining a showtime room
    socket.on("join_showtime", (data) => {
      const { showtimeId, userId } = data;
      const roomName = `showtime_${showtimeId}`;
      
      socket.join(roomName);
      socket.userId = userId;
      socket.currentShowtime = showtimeId;
      
      console.log(`User ${userId} joined showtime ${showtimeId} room`);
    });

    // Handle disconnect - cleanup user's selections
    socket.on("disconnect", async () => {
      console.log("A user disconnected:", socket.id);
      
      if (socket.userId && socket.currentShowtime) {
        await cleanupUserSelections(socket.userId, socket.currentShowtime, io);
      }
    });
  },
};

// Helper function to cleanup a specific selection
async function cleanupSelection(selectionKey, io) {
  try {
    const selection = activeSelections.get(selectionKey);
    if (!selection) return;

    // Clear timeout if it exists
    if (selection.timeoutId) {
      clearTimeout(selection.timeoutId);
    }

    // Delete ticket and payment from database
    const ticketExists = await prisma.ticket.findUnique({
      where: { id: selection.ticketId },
    });

    if (ticketExists && ticketExists.selectionStatus === "SELECTED") {
      await prisma.ticket.delete({ 
        where: { id: selection.ticketId } 
      });
      
      await prisma.payment.delete({ 
        where: { id: selection.paymentId } 
      });

      console.log(`Selection cleaned up - Ticket: ${selection.ticketId}, Payment: ${selection.paymentId}`);

      // Extract seat and showtime info from key
      const [showtimeId, seatId] = selectionKey.split('-');
      
      // Notify all clients that seat is available again
      io.emit("seat_released", {
        seatId: Number(seatId),
        showtimeId: Number(showtimeId),
        userId: selection.userId
      });
    }

    // Remove from active selections
    activeSelections.delete(selectionKey);

  } catch (error) {
    console.error(`Error cleaning up selection ${selectionKey}:`, error);
  }
}

// Helper function to cleanup all selections for a user in a showtime
async function cleanupUserSelections(userId, showtimeId, io) {
  try {
    const userSelections = Array.from(activeSelections.entries())
      .filter(([key, selection]) => 
        selection.userId === userId && key.startsWith(`${showtimeId}-`)
      );

    for (const [key] of userSelections) {
      await cleanupSelection(key, io);
    }

    console.log(`Cleaned up ${userSelections.length} selections for user ${userId} in showtime ${showtimeId}`);
    
  } catch (error) {
    console.error(`Error cleaning up user selections:`, error);
  }
}