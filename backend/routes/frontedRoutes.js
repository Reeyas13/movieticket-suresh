import express from "express";
import frontendController from "../controllers/frontendController.js"; // Adjust the path based on your project structure

const frontedRoutes = express.Router();
// Modified frontedRoutes configuration
// import express from 'express';
// import frontendController from '../controllers/frontendController.js';

// const frontedRoutes = express.Router();

// Fix: Reorder routes to place more specific routes before dynamic parameter routes
// Featured movie endpoint
frontedRoutes.get("/movies/featured", frontendController.getFeaturedMovie);

// Now showing movies endpoint
frontedRoutes.get("/movies/now-showing", frontendController.getNowShowingMovies);

// Upcoming movies endpoint 
frontedRoutes.get("/movies/upcoming", frontendController.getUpcomingMovies);

// Movie categories endpoint
frontedRoutes.get("/getmovies/categories", frontendController.getMovieCategories);
frontedRoutes.get("/test/:id", frontendController.getAvailableSeats);
// Single movie endpoint - put this AFTER the specific movie routes
frontedRoutes.get("/movies/:id", frontendController.getMovie);
frontedRoutes.get("/getshowtimesbyid/:id", frontendController.getshowtimesbyid);

// Other routes...
frontedRoutes.get("/movies", frontendController.getMovies);
frontedRoutes.get("/theaters", frontendController.getFilmHalls);
frontedRoutes.get("/theaters/:id", frontendController.getFilmHall);
frontedRoutes.get("/showtimes/:movieId", frontendController.getMovieShowtimes);
frontedRoutes.get("/seats/:showtimeId", frontendController.getAvailableSeats);
frontedRoutes.get("/bookings/:userId", frontendController.getUserBookings);
frontedRoutes.get("/users/:id", frontendController.getUserProfile);

// Post routes
frontedRoutes.post("/bookings", frontendController.createBooking);
frontedRoutes.post("/payments/:id/complete", frontendController.completePayment);
frontedRoutes.put("/users/:id", frontendController.updateUserProfile);

// export default frontedRoutes;
export default frontedRoutes;
