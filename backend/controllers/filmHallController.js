import prisma from "../prisma/prisma.js";


const getFilmHalls = async (req, res) => {
  try {
    // Role-based access control
    let filmHalls = [];
    
    if (req.user.role === 'ADMIN') {
      // Admins can see all film halls
      filmHalls = await prisma.filmHall.findMany({
        include: {
          halls: true,
        }
      });
    } else if (req.user.role === 'CINEMA' && req.user.filmhallId) {
      // Cinema users can only see their own film hall
      filmHalls = await prisma.filmHall.findMany({
        where: { id: req.user.filmhallId },
        include: {
          halls: true,
        }
      });
    } else {
      // Regular users can see all film halls (or could be restricted if needed)
      filmHalls = await prisma.filmHall.findMany({
        include: {
          halls: true,
        }
      });
    }
    
    res.json(filmHalls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get film hall by ID
const getFilmHallById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // For CINEMA users, check if they are requesting their own film hall
    if (req.user.role === 'CINEMA' && req.user.filmhallId && Number(id) !== req.user.filmhallId) {
      return res.status(403).json({ error: 'You do not have access to this film hall' });
    }
    
    const filmHall = await prisma.filmHall.findUnique({
      where: { id: Number(id) },
      include: {
        halls: {
          include: {
            seats: true,
            showTimes: {
              include: {
                movie: true
              }
            }
          }
        }
      }
    });
    
    if (!filmHall) {
      return res.status(404).json({ error: 'Film hall not found' });
    }
    
    res.json(filmHall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new film hall
const createFilmHall = async (req, res) => {
  try {
    // Only ADMIN users can create film halls
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can create film halls' });
    }
    
    const { name, address, city, description, imageUrl } = req.body;
    
    const newFilmHall = await prisma.filmHall.create({
      data: {
        name,
        address,
        city,
        description,
        imageUrl
      }
    });
    
    res.status(201).json(newFilmHall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update film hall
const updateFilmHall = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, description, imageUrl } = req.body;
    
    // Check if film hall exists
    const existingFilmHall = await prisma.filmHall.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingFilmHall) {
      return res.status(404).json({ error: 'Film hall not found' });
    }
    
    // For CINEMA users, check if they are updating their own film hall
    if (req.user.role === 'CINEMA') {
      if (!req.user.filmhallId || Number(id) !== req.user.filmhallId) {
        return res.status(403).json({ error: 'You can only update your own film hall' });
      }
    } else if (req.user.role !== 'ADMIN') {
      // Regular users cannot update film halls
      return res.status(403).json({ error: 'You do not have permission to update film halls' });
    }
    
    const updatedFilmHall = await prisma.filmHall.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(city && { city }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl })
      }
    });
    
    res.json(updatedFilmHall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete film hall
const deleteFilmHall = async (req, res) => {
  try {
    // Only ADMIN users can delete film halls
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can delete film halls' });
    }
    
    const { id } = req.params;
    
    // Check if film hall exists
    const existingFilmHall = await prisma.filmHall.findUnique({
      where: { id: Number(id) },
      include: {
        halls: true
      }
    });
    
    if (!existingFilmHall) {
      return res.status(404).json({ error: 'Film hall not found' });
    }
    
    // Check if film hall has associated halls
    if (existingFilmHall.halls && existingFilmHall.halls.length > 0) {
      return res.status(400).json({ error: 'Cannot delete film hall with associated halls. Delete the halls first.' });
    }
    
    await prisma.filmHall.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Film hall deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getFilmHalls,
  getFilmHallById,
  createFilmHall,
  updateFilmHall,
  deleteFilmHall
};