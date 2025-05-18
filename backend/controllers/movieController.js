import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all movies
const getMovies = async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        showTimes: {
          include: {
            hall: true
          }
        }
      }
    });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get movie by ID
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: { id: Number(id) },
      include: {
        showTimes: {
          include: {
            hall: {
              include: {
                filmHall: true
              }
            },
            pricingOptions: {
              include: {
                seatType: true
              }
            }
          }
        }
      }
    });
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new movie
const createMovie = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      duration, 
      genre, 
      releaseDate, 
      language, 
      director, 
      cast, 
      posterUrl, 
      trailerUrl 
    } = req.body;
    
    const newMovie = await prisma.movie.create({
      data: {
        title,
        description,
        duration: Number(duration),
        genre,
        releaseDate: new Date(releaseDate),
        language,
        director,
        cast,
        posterUrl,
        trailerUrl
      }
    });
    
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update movie
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      duration, 
      genre, 
      releaseDate, 
      language, 
      director, 
      cast, 
      posterUrl, 
      trailerUrl 
    } = req.body;
    
    // Check if movie exists
    const existingMovie = await prisma.movie.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    const updatedMovie = await prisma.movie.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(duration && { duration: Number(duration) }),
        ...(genre && { genre }),
        ...(releaseDate && { releaseDate: new Date(releaseDate) }),
        ...(language && { language }),
        ...(director !== undefined && { director }),
        ...(cast !== undefined && { cast }),
        ...(posterUrl !== undefined && { posterUrl }),
        ...(trailerUrl !== undefined && { trailerUrl })
      }
    });
    
    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete movie
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if movie exists
    const existingMovie = await prisma.movie.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Check if movie has showTimes
    const showTimesUsingMovie = await prisma.showTime.findFirst({
      where: { movieId: Number(id) }
    });
    
    if (showTimesUsingMovie) {
      return res.status(400).json({ error: 'Cannot delete movie with associated show times' });
    }
    
    await prisma.movie.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};