import prisma from "../prisma/prisma.js";
/**
 * Create a new showtime for a hall in the user's film hall
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createShowTime = async (req, res) => {
  try {
    const { movieId, startTime, endTime, basePrice, pricingOptions, hallId } = req.body;
   
    const user = await prisma.user.findUnique({
      where: { id: req.user.filmhallId },
      include: { filmhall: { include: { halls: true } } },
    });
    
    if (!user.filmhall) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have a film hall associated with your account' 
      });
    }
    
    // Verify that the hall belongs to the user's film hall
    // const hallExists = user.filmhall.halls.some(hall => hall.id === hallId);
    
    // if (!hallExists) {
    //   return res.status(403).json({ 
    //     success: false,
    //     message: 'You can only create showtimes for halls in your film hall' 
    //   });
    // }
    
    // Create the showtime
    const showTime = await prisma.showTime.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        movie: { connect: { id: movieId } },
        hall: { connect: { id: hallId } },
        basePrice: basePrice,
      },
    });
    
    // Add pricing options if provided
    if (pricingOptions && pricingOptions.length > 0) {
      const pricingData = pricingOptions.map(option => ({
        showTimeId: showTime.id,
        seatTypeId: option.seatTypeId,
        price: option.price
      }));
      
      await prisma.showTimePricing.createMany({
        data: pricingData
      });
    }
    
    // Get the complete showtime with pricing options
    const completeShowTime = await prisma.showTime.findUnique({
      where: { id: showTime.id },
      include: {
        movie: true,
        hall: true,
        pricingOptions: {
          include: {
            seatType: true
          }
        }
      }
    });
    
    return res.status(201).json({
      success: true,
      data: completeShowTime
    });
    
  } catch (error) {
    console.error('Error creating showtime:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create showtime',
      error: error.message
    });
  }
};

/**
 * Get all showtimes for the user's film hall
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShowTimes = async (req, res) => {
  try {
    // Get the user's film hall ID
    // const user = await prisma.user.findUnique({
    //   where: { id: req.user.filmhallId},
    //   include: { filmhall: true },
    // });
    
    // if (!user.filmhall) {
    //   return res.status(403).json({ 
    //     success: false,
    //     message: 'You do not have a film hall associated with your account' 
    //   });
    // }
    console.log(req.user)
    const filmHallId = req.user.filmhallId
    
    // Get all halls for this film hall
    const halls = await prisma.hall.findMany({
      where: { filmHallId },
      select: { id: true }
    });
    console.log(halls)
    const hallIds = halls.map(hall => hall.id);
    
    // Find all showtimes for these halls
    const showTimes = await prisma.showTime.findMany({
      where: {
        hallId: {
          in: hallIds
        }
      },
      include: {
        movie: true,
        hall: true,
        pricingOptions: {
          include: {
            // seatType: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    return res.status(200).json({
      success: true,
      data: showTimes
    });
    
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch showtimes',
      error: error.message
    });
  }
};

/**
 * Get a single showtime by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShowTimeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the user's film hall ID
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { filmhall: { include: { halls: true } } },
    });
    
    if (!user.filmhall) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have a film hall associated with your account' 
      });
    }
    
    const hallIds = user.filmhall.halls.map(hall => hall.id);
    
    // Find the showtime and verify it belongs to one of the user's halls
    const showTime = await prisma.showTime.findUnique({
      where: { id: parseInt(id) },
      include: {
        movie: true,
        hall: true,
        pricingOptions: {
          include: {
            seatType: true
          }
        }
      }
    });
    
    if (!showTime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }
    
    if (!hallIds.includes(showTime.hallId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only access showtimes for your film hall'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: showTime
    });
    
  } catch (error) {
    console.error('Error fetching showtime:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch showtime',
      error: error.message
    });
  }
};

/**
 * Update a showtime
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateShowTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, movieId, hallId, basePrice, pricingOptions } = req.body;
    
    // Get the user's film hall ID
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { filmhall: { include: { halls: true } } },
    });
    
    if (!user.filmhall) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have a film hall associated with your account' 
      });
    }
    
    const hallIds = user.filmhall.halls.map(hall => hall.id);
    
    // Find the showtime
    const showTime = await prisma.showTime.findUnique({
      where: { id: parseInt(id) },
      include: {
        pricingOptions: true
      }
    });
    
    if (!showTime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }
    
    if (!hallIds.includes(showTime.hallId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update showtimes for your film hall'
      });
    }
    
    // If hallId is provided, verify it belongs to the user's film hall
    if (hallId && !hallIds.includes(hallId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update to halls in your film hall'
      });
    }
    
    // Update showtime
    const updatedShowTime = await prisma.showTime.update({
      where: { id: parseInt(id) },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        movieId: movieId || undefined,
        hallId: hallId || undefined,
        basePrice: basePrice || undefined,
      }
    });
    
    // Update pricing options if provided
    if (pricingOptions && pricingOptions.length > 0) {
      // Delete existing pricing options
      await prisma.showTimePricing.deleteMany({
        where: { showTimeId: parseInt(id) }
      });
      
      // Create new pricing options
      const pricingData = pricingOptions.map(option => ({
        showTimeId: parseInt(id),
        seatTypeId: option.seatTypeId,
        price: option.price
      }));
      
      await prisma.showTimePricing.createMany({
        data: pricingData
      });
    }
    
    // Get the updated showtime with all relations
    const completeShowTime = await prisma.showTime.findUnique({
      where: { id: parseInt(id) },
      include: {
        movie: true,
        hall: true,
        pricingOptions: {
          include: {
            seatType: true
          }
        }
      }
    });
    
    return res.status(200).json({
      success: true,
      data: completeShowTime
    });
    
  } catch (error) {
    console.error('Error updating showtime:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update showtime',
      error: error.message
    });
  }
};

/**
 * Delete a showtime
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteShowTime = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the user's film hall ID
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { filmhall: { include: { halls: true } } },
    });
    
    if (!user.filmhall) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have a film hall associated with your account' 
      });
    }
    
    const hallIds = user.filmhall.halls.map(hall => hall.id);
    
    // Find the showtime
    const showTime = await prisma.showTime.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!showTime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }
    
    if (!hallIds.includes(showTime.hallId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete showtimes for your film hall'
      });
    }
    
    // Check if there are any tickets associated with this showtime
    const ticketCount = await prisma.ticket.count({
      where: { showTimeId: parseInt(id) }
    });
    
    if (ticketCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a showtime that has tickets sold'
      });
    }
    
    // Delete pricing options first (cascade doesn't always work as expected)
    await prisma.showTimePricing.deleteMany({
      where: { showTimeId: parseInt(id) }
    });
    
    // Delete the showtime
    await prisma.showTime.delete({
      where: { id: parseInt(id) }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Showtime deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting showtime:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete showtime',
      error: error.message
    });
  }
};

export default {
  createShowTime,
  getShowTimes,
  getShowTimeById,
  updateShowTime,
  deleteShowTime
};