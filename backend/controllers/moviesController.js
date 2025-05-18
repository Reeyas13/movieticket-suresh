import { getImageUrl, deleteImage } from "../helpers/ImageHandler.js";
import prisma from "../prisma/prisma.js";

// Create a new movie
const createMovies = async (req, res) => {
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
      trailerUrl
    } = req.body;

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => getImageUrl(file.filename));
    }

    const newMovie = await prisma.movie.create({
      data: {
        title,
        description,
        duration: parseInt(duration),
        genre,
        releaseDate: new Date(releaseDate),
        language,
        director,
        cast,
        posterUrl: JSON.stringify(imageUrls),
        trailerUrl
      }
    });

    res.json({
      newMovie,
      message: "Movie created successfully",
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Get all movies
const getAllMovies = async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        showTimes: {
          include: {
            hall: {
              include: {
                filmHall: true
              }
            }
          }
        }
      }
    });

    // Parse poster URLs from JSON string to array
    const processedMovies = movies.map(movie => ({
      ...movie,
      posterUrl: movie.posterUrl ? JSON.parse(movie.posterUrl) : []
    }));

    res.json({ 
      movies: processedMovies,
      success: true 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Get a single movie by ID
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
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
      return res.status(404).json({ 
        message: "Movie not found",
        success: false 
      });
    }

    // Parse poster URLs from JSON string to array
    const processedMovie = {
      ...movie,
      posterUrl: movie.posterUrl ? JSON.parse(movie.posterUrl) : []
    };

    res.json({ 
      movie: processedMovie,
      success: true 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Update a movie
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
      trailerUrl
    } = req.body;

    // Get the current movie to access the existing poster URLs
    const currentMovie = await prisma.movie.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentMovie) {
      return res.status(404).json({ 
        message: "Movie not found",
        success: false 
      });
    }

    // Handle image uploads
    let imageUrls = currentMovie.posterUrl ? JSON.parse(currentMovie.posterUrl) : [];
    
    // Add new images if provided
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => getImageUrl(file.filename));
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    const updatedMovie = await prisma.movie.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        duration: parseInt(duration),
        genre,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        language,
        director,
        cast,
        posterUrl: JSON.stringify(imageUrls),
        trailerUrl
      }
    });

    res.json({
      movie: {
        ...updatedMovie,
        posterUrl: JSON.parse(updatedMovie.posterUrl)
      },
      message: "Movie updated successfully",
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Delete a movie
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the movie to delete its images
    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
      include: {
        showTimes: true
      }
    });

    if (!movie) {
      return res.status(404).json({ 
        message: "Movie not found",
        success: false 
      });
    }

    // Check if the movie has associated showtimes
    if (movie.showTimes && movie.showTimes.length > 0) {
      return res.status(400).json({
        message: "Cannot delete movie with existing showtimes",
        success: false
      });
    }

    // Delete the movie
    await prisma.movie.delete({
      where: { id: parseInt(id) }
    });

    // Delete associated images
    if (movie.posterUrl) {
      const imageUrls = JSON.parse(movie.posterUrl);
      for (const url of imageUrls) {
        await deleteImage(url);
      }
    }

    res.json({
      message: "Movie deleted successfully",
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Remove an image from a movie
const removeMovieImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    // Get the current movie
    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(id) }
    });

    if (!movie) {
      return res.status(404).json({ 
        message: "Movie not found",
        success: false 
      });
    }

    // Parse current image URLs
    const currentImageUrls = JSON.parse(movie.posterUrl || '[]');
    
    // Remove the specified image URL
    const updatedImageUrls = currentImageUrls.filter(url => url !== imageUrl);

    // Update the movie with the new list of URLs
    const updatedMovie = await prisma.movie.update({
      where: { id: parseInt(id) },
      data: {
        posterUrl: JSON.stringify(updatedImageUrls)
      }
    });

    // Delete the image file
    await deleteImage(imageUrl);

    res.json({
      movie: {
        ...updatedMovie,
        posterUrl: updatedImageUrls
      },
      message: "Image removed successfully",
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};


export default {
  createMovies,
  getAllMovies,
  getMovieById,
  updateMovie,
  
  deleteMovie,
  removeMovieImage
};