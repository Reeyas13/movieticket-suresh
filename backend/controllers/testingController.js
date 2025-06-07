import prisma from "../prisma/prisma.js";

export default {
  onConnection: (socket, io) => {
    console.log("A user connected:", socket.id);

    socket.on("selected_seat", async (seatData) => {
      const { userId, showtimeId, seatId } = seatData;

      console.log("Seat selection received:", seatData);

      if (!userId || !showtimeId || !seatId) {
        return socket.emit("seat_selected_error", {
          message: "Missing required fields (userId, showtimeId, seatId)",
        });
      }

      try {
        const selectedSeat = await prisma.seat.findUnique({
          where: { id: Number(seatId) },
        });
        console.log({ selectedSeat });

        const showtime = await prisma.showTime.findUnique({
          where: { id: Number(showtimeId) },
        });
        console.log({ showtime });

        if (!showtime) {
          return socket.emit("seat_selected_error", {
            message: "Showtime not found",
          });
        }

        const seat = await prisma.seat.findUnique({
          where: { id: Number(seatId) },
        });
        console.log({ seat });

        if (!seat) {
          return socket.emit("seat_selected_error", {
            message: "Seat not found",
          });
        }

        const existingTicket = await prisma.ticket.findFirst({
          where: {
            showTimeId: Number(showtimeId),
            seatId: Number(seatId),
          },
        });
        console.log({ existingTicket });

        if (existingTicket) {
          return socket.emit("seat_selected_error", {
            message: "Seat already selected or booked",
            seatId,
          });
        }

        // Create payment with 0 amount (can be updated later)
        const payment = await prisma.payment.create({
          data: {
            amount: 0,
            status: "PENDING",
            paymentMethod: "DEBIT_CARD",
            userId: Number(userId),
          },
        });

        // Create ticket
        const ticket = await prisma.ticket.create({
          data: {
            showTimeId: Number(showtimeId),
            userId: Number(userId),
            seatId: Number(seatId),
            price: 0,
            paymentId: payment.id,
            selectionStatus: "SELECTED",
          },
        });

        console.log("Ticket created (SELECTED):", ticket.id);

        // Broadcast to others
        socket.broadcast.emit("selected_seat", {
          seatId,
          userId,
          showtimeId,
        });

        // Respond to sender
        socket.emit("seat_selected_success", {
          message: "Seat successfully selected",
          ticketId: ticket.id,
          seatId,
        });

        // 🔁 Auto-reset ticket after 1 minute
        setTimeout(async () => {
          try {
            const stillExists = await prisma.ticket.findUnique({
              where: { id: ticket.id },
            });

            if (stillExists && stillExists.selectionStatus === "SELECTED") {
              await prisma.ticket.delete({ where: { id: ticket.id } });
              console.log(`Ticket ${ticket.id} auto-deleted after timeout.`);

              await prisma.payment.delete({ where: { id: payment.id } });
              console.log(`Payment ${payment.id} also deleted.`);

              // Notify all clients that the seat is free again
              io.emit("seat_released", {
                seatId: ticket.seatId,
                showtimeId: ticket.showTimeId,
              });
            }
          } catch (err) {
            console.error(`Auto-delete error for ticket ${ticket.id}:`, err.message);
          }
        }, 60_000);

      } catch (error) {
        console.error("Error selecting seat:", error);
        socket.emit("seat_selected_error", {
          message: "Something went wrong while selecting seat",
          error: error.message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  },
};
