import prisma from "../prisma/prisma.js";


const getFilmHalls = async (req, res) => {
  try {
    const filmHalls = await prisma.filmHall.findMany({
      include: {
        halls: true,
      }
    });
    res.json(filmHalls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get film hall by ID
const getFilmHallById = async (req, res) => {
  try {
    const { id } = req.params;
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
    const { id } = req.params;
    
    // Check if film hall exists
    const existingFilmHall = await prisma.filmHall.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingFilmHall) {
      return res.status(404).json({ error: 'Film hall not found' });
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