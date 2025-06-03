import prisma from "../prisma/prisma.js";

const getHalls = async (req, res) => {
  try {
    let halls;
    
    if (req.user.role === 'ADMIN') {
      // Admin users can see all halls
      halls = await prisma.hall.findMany({
        include: {
          filmHall: true,
          seats: true,
        }
      });
    } else if (req.user.role === 'CINEMA' && req.user.filmhallId) {
      // Cinema users only see their own halls
      halls = await prisma.hall.findMany({
        include: {
          filmHall: true,
          seats: true,
        },
        where: {
          filmHallId: req.user.filmhallId
        }
      });
    } else {
      // Regular users or cinema users without filmhallId get empty array
      halls = [];
    }
    
    res.json(halls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get hall by ID
const getHallById = async (req, res) => {
  try {
    const { id } = req.params;
    let whereClause = { id: Number(id) };
    
    // Add filmHallId condition only for CINEMA users with a valid filmhallId
    if (req.user.role === 'CINEMA' && req.user.filmhallId) {
      whereClause.filmHallId = req.user.filmhallId;
    }
    
    const hall = await prisma.hall.findUnique({
      where: whereClause,
      include: {
        filmHall: true,
        seats: {
          include: {
            seatType: true
          }
        },
        showTimes: {
          include: {
            movie: true
          }
        }
      }
    });
    
    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }
    
    // For CINEMA users, verify they have access to this hall
    if (req.user.role === 'CINEMA' && req.user.filmhallId && hall.filmHallId !== req.user.filmhallId) {
      return res.status(403).json({ error: 'Access denied to this hall' });
    }
    
    res.json(hall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new hall
const createHall = async (req, res) => {
  try {
    const { name, capacity } = req.body;
    const filmHallId = req.user.filmhallId;
    console.log(req.user,req.user.role)
    // Only CINEMA users with filmhallId or ADMIN can create halls
    if (req.user.role === 'CINEMA' && !req.user.filmhallId) {
      return res.status(403).json({ error: 'Access denied to create hall' });
    }
    
    if (req.user.role === 'CINEMA' && req.user.filmhallId) {
      const filmHall = await prisma.filmHall.findUnique({
        where: { id: Number(filmHallId) }
      });
      
      if (!filmHall) {
        return res.status(404).json({ error: 'Film hall not found' });
      }
    }
    
    const newHall = await prisma.hall.create({
      data: {
        name,
        capacity,
        filmHallId: req.user.role === 'CINEMA' ? Number(filmHallId) : null
      }
    });
    
    res.status(201).json(newHall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update hall
const updateHall = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, filmHallId } = req.body;
    
    // Check if hall exists with appropriate conditions based on role
    let whereClause = { id: Number(id) };
    if (req.user.role === 'CINEMA' && req.user.filmhallId) {
      whereClause.filmHallId = req.user.filmhallId;
    }
    
    const existingHall = await prisma.hall.findUnique({
      where: whereClause
    });
    
    if (!existingHall) {
      return res.status(404).json({ error: 'Hall not found' });
    }
    
    // For CINEMA users, verify they have access to this hall
    if (req.user.role === 'CINEMA' && req.user.filmhallId && existingHall.filmHallId !== req.user.filmhallId) {
      return res.status(403).json({ error: 'Access denied to this hall' });
    }
    
    // If filmHallId is provided, check if it exists
    if (filmHallId) {
      const filmHall = await prisma.filmHall.findUnique({
        where: { id: Number(filmHallId) }
      });
      
      if (!filmHall) {
        return res.status(404).json({ error: 'Film hall not found' });
      }
    }
    
    const updatedHall = await prisma.hall.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(capacity && { capacity: Number(capacity) }),
        ...(filmHallId && { filmHallId: Number(filmHallId) })
      }
    });
    
    res.json(updatedHall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete hall
const deleteHall = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Build where clause based on user role
    let whereClause = { id: Number(id) };
    if (req.user.role === 'CINEMA' && req.user.filmhallId) {
      whereClause.filmHallId = req.user.filmhallId;
    }
    
    // Check if hall exists
    const existingHall = await prisma.hall.findUnique({
      where: whereClause,
      include: {
        showTimes: true,
        seats: true
      }
    });
    
    if (!existingHall) {
      return res.status(404).json({ error: 'Hall not found' });
    }
    
    // Check if hall has associated showTimes or seats
    if (existingHall.showTimes.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete hall with associated showtimes. Remove showtimes first.'
      });
    }
    
    if (existingHall.seats.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete hall with associated seats. Remove seats first.'
      });
    }
    
    await prisma.hall.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Hall deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall
};