  import prisma from "../prisma/prisma.js";
  const getHalls = async (req, res) => {
    try {
      const halls = await prisma.hall.findMany({
        include: {
          filmHall: true,
          seats: true,
        },
        where: {
          filmHallId: req.user.filmhallId
        }
      });
      res.json(halls);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Get hall by ID
  const getHallById = async (req, res) => {
    try {
      const { id } = req.params;
      const hall = await prisma.hall.findUnique({
        where: { id: Number(id), filmHallId: req.user.filmhallId },
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
      
      res.json(hall);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Create new hall
  const createHall = async (req, res) => {
    try {
      const { name, capacity } = req.body;
      const  filmHallId = req.user.filmhallId;
      // console.log()
      // Check if film hall exists
      const filmHall = await prisma.filmHall.findUnique({
        where: { id: Number(filmHallId) }
      });
      
      if (!filmHall) {
        return res.status(404).json({ error: 'Film hall not found' });
      }
      
      const newHall = await prisma.hall.create({
        data: {
          name,
          capacity,
          filmHallId: Number(filmHallId)
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
      
      // Check if hall exists
      const existingHall = await prisma.hall.findUnique({
        where: { id: Number(id), filmHallId: req.user.filmhallId },
        
      });
      
      if (!existingHall) {
        return res.status(404).json({ error: 'Hall not found' });
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
      
      // Check if hall exists
      const existingHall = await prisma.hall.findUnique({
        where: { id: Number(id),filmHallId: req.user.filmhallId }
      });
      
      if (!existingHall) {
        return res.status(404).json({ error: 'Hall not found' });
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