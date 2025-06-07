import prisma from "../prisma/prisma.js";

const bookTicket = async (req, res) => {
  try {
    const { showTimeId, seatId, userId, price } = req.body;

    // 1. Check if the seat is already booked for this showtime
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        showTimeId: Number(showTimeId),
        seatId: Number(seatId),
      },
    });

    if (existingTicket) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    // 2. Create a ticket
    const ticket = await prisma.ticket.create({
      data: {
        showTimeId: Number(showTimeId),
        seatId: Number(seatId),
        userId: Number(userId),  // assuming you track user who booked
        price: Number(price),
        selectionStatus: "BOOKED", // or whatever your status field expects
      },
    });
/**
 * selectionStatus  await prisma.ticket.create({
    data: {
      showTimeId: sampleShowtime.id,
      userId: regularUser.id,
      seatId: vipSeat.id,
      price: sampleShowtime.basePrice * 1.5,
      paymentId: payment.id,
      qrCode: `TICKET-${sampleShowtime.id}-${vipSeat.id}-${regularUser.id}`,
      selectionStatus: 'BOOKED',
      isUsed: false
    }
  });
 */
    res.status(201).json({ message: "Ticket booked successfully", ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const bookMultipleTickets = async (req, res) => {
  try {
    const { showTimeId, seatIds, userId, price } = req.body;
    // seatIds is expected to be an array of seat IDs

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ message: "seatIds must be a non-empty array" });
    }

    // 1. Check if any seat is already booked
    const bookedSeats = await prisma.ticket.findMany({
      where: {
        showTimeId: Number(showTimeId),
        seatId: { in: seatIds.map(id => Number(id)) },
      },
      select: { seatId: true }
    });

    if (bookedSeats.length > 0) {
      const bookedSeatIds = bookedSeats.map(s => s.seatId);
      return res.status(400).json({ 
        message: "Some seats are already booked", 
        bookedSeats: bookedSeatIds 
      });
    }

    // 2. Create tickets for all selected seats
    const ticketsData = seatIds.map(seatId => ({
      showTimeId: Number(showTimeId),
      seatId: Number(seatId),
      userId: Number(userId),
      price: Number(price),
      status: "BOOKED"
    }));

    const tickets = await prisma.ticket.createMany({
      data: ticketsData,
      skipDuplicates: true, // just in case, though we already checked above
    });

    res.status(201).json({ message: "Tickets booked successfully", count: tickets.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export default {
  bookTicket,
  bookMultipleTickets
};
