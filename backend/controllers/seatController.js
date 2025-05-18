import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all seats
const getSeats = async (req, res) => {
  try {
    const seats = await prisma.seat.findMany({
      include: {
        hall: true,
        seatType: true
      }
    });
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get seats by hall ID
const getSeatsByHallId = async (req, res) => {
  try {
    const hallId = req.user.filmhallId;
    const seats = await prisma.seat.findMany({
      where: { hallId: Number(hallId) },
      include: {
        seatType: true
      },
      orderBy: [
        { row: 'asc' },
        { number: 'asc' }
      ]
    });
    
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get seat by ID
const getSeatById = async (req, res) => {
  try {
    const { id } = req.params;
    const seat = await prisma.seat.findUnique({
      where: { id: Number(id) },
      include: {
        hall: true,
        seatType: true,
        tickets: {
          include: {
            showTime: true
          }
        }
      }
    });
    
    if (!seat) {
      return res.status(404).json({ error: 'Seat not found' });
    }
    
    res.json(seat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new seat
const createSeat = async (req, res) => {
  try {
    const { row, number, seatTypeId } = req.body;
    const hallId = req.user.filmhallId;
    // Check if hall exists
    const hall = await prisma.hall.findUnique({
      where: { id: Number(hallId) }
    });
    
    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }
    
    // Check if seat type exists
    const seatType = await prisma.seatType.findUnique({
      where: { id: Number(seatTypeId) }
    });
    
    if (!seatType) {
      return res.status(404).json({ error: 'Seat type not found' });
    }
    
    // Check if seat with same row and number already exists in the hall
    const existingSeat = await prisma.seat.findFirst({
      where: {
        hallId: Number(hallId),
        row: row,
        number: Number(number)
      }
    });
    
    if (existingSeat) {
      return res.status(400).json({ error: 'Seat with this row and number already exists in this hall' });
    }
    
    const newSeat = await prisma.seat.create({
      data: {
        row,
        number: Number(number),
        seatTypeId: Number(seatTypeId),
        hallId: Number(hallId)
      }
    });
    
    res.status(201).json(newSeat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create multiple seats at once
const createMultipleSeats = async (req, res) => {
  try {
    const { seats, hallId } = req.body;
    
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'Invalid seats data' });
    }
    
    // Check if hall exists
    const hall = await prisma.hall.findUnique({
      where: { id: Number(hallId) }
    });
    
    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }
    
    // Create all seats in a transaction
    const createdSeats = await prisma.$transaction(
      seats.map(seat => {
        return prisma.seat.create({
          data: {
            row: seat.row,
            number: Number(seat.number),
            seatTypeId: Number(seat.seatTypeId),
            hallId: Number(hallId)
          }
        });
      })
    );
    
    res.status(201).json(createdSeats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update seat
const updateSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const { row, number, seatTypeId, hallId } = req.body;
    
    // Check if seat exists
    const existingSeat = await prisma.seat.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingSeat) {
      return res.status(404).json({ error: 'Seat not found' });
    }
    
    // If changing hall or row/number, check for uniqueness
    if ((hallId && hallId !== existingSeat.hallId) || 
        (row && row !== existingSeat.row) || 
        (number && number !== existingSeat.number)) {
      
      const duplicateSeat = await prisma.seat.findFirst({
        where: {
          hallId: Number(hallId || existingSeat.hallId),
          row: row || existingSeat.row,
          number: Number(number || existingSeat.number),
          NOT: {
            id: Number(id)
          }
        }
      });
      
      if (duplicateSeat) {
        return res.status(400).json({ error: 'Seat with this row and number already exists in this hall' });
      }
    }
    
    // If seatTypeId is provided, check if it exists
    if (seatTypeId) {
      const seatType = await prisma.seatType.findUnique({
        where: { id: Number(seatTypeId) }
      });
      
      if (!seatType) {
        return res.status(404).json({ error: 'Seat type not found' });
      }
    }
    
    // If hallId is provided, check if it exists
    if (hallId) {
      const hall = await prisma.hall.findUnique({
        where: { id: Number(hallId) }
      });
      
      if (!hall) {
        return res.status(404).json({ error: 'Hall not found' });
      }
    }
    
    const updatedSeat = await prisma.seat.update({
      where: { id: Number(id) },
      data: {
        ...(row && { row }),
        ...(number && { number: Number(number) }),
        ...(seatTypeId && { seatTypeId: Number(seatTypeId) }),
        ...(hallId && { hallId: Number(hallId) })
      }
    });
    
    res.json(updatedSeat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete seat
const deleteSeat = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if seat exists
    const existingSeat = await prisma.seat.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingSeat) {
      return res.status(404).json({ error: 'Seat not found' });
    }
    
    // Check if seat is being used in any tickets
    const ticketsUsingSeat = await prisma.ticket.findFirst({
      where: { seatId: Number(id) }
    });
    
    if (ticketsUsingSeat) {
      return res.status(400).json({ error: 'Cannot delete seat that is used in tickets' });
    }
    
    await prisma.seat.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Seat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getSeats,
  getSeatsByHallId,
  getSeatById,
  createSeat,
  createMultipleSeats,
  updateSeat,
  deleteSeat
};