import prisma from "../prisma/prisma.js";
const formatMovie = (movie) => {
  return {
    id: movie.id,
    title: movie.title,
    image: movie.posterUrl,
    description: movie.description,
    rating: 4.5, // This would come from a ratings system in a real app
    duration: `${movie.duration}m`,
    category: movie.genre,
    releaseDate: movie.releaseDate.toLocaleDateString(),
    director: movie.director,
    cast: movie.cast,
    language: movie.language,
    trailerUrl: movie.trailerUrl
  };
};

// Movies APIs
const getMovies = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    // Build filter conditions
    let where = {};
    
    if (category && category !== 'All') {
      where.genre = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { director: { contains: search, mode: 'insensitive' } },
        { cast: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const movies = await prisma.movie.findMany({
      where,
      orderBy: { releaseDate: 'desc' }
    });
    
    const formattedMovies = movies.map(formatMovie);
    
    res.status(200).json(formattedMovies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
};

const getMovie = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    
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
        tickets: true
      }
    }
  }
});
    console.log(movie)
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // const formattedMovie = formatMovie(movie);
    
    res.status(200).json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ message: 'Failed to fetch movie' });
  }
};

const getMovieCategories = async (req, res) => {
  try {
    // Get unique genres from the movies
    const movies = await prisma.movie.findMany({
      select: {
        genre: true
      },
      distinct: ['genre']
    });
    
    const categories = movies.map(movie => movie.genre);
    categories.unshift('All'); // Add 'All' option
    
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

 const getUpcomingMovies = async (req, res) => {
  try {
    const today = new Date();
    
    const upcomingMovies = await prisma.movie.findMany({
      where: {
        releaseDate: {
          gt: today
        }
      },
      orderBy: {
        releaseDate: 'asc'
      },
      take: 6 // Limit to 6 upcoming movies
    });
    
    const formattedMovies = upcomingMovies.map(formatMovie);
    
    res.status(200).json(formattedMovies);
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming movies' });
  }
};

const getNowShowingMovies = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get movies that have been released in the last 30 days and have showtimes
    const nowShowingMovies = await prisma.movie.findMany({
      where: {
        releaseDate: {
          gte: thirtyDaysAgo,
          lte: today
        },
        showTimes: {
          some: {
            startTime: {
              gte: today
            }
          }
        }
      },
      include: {
        showTimes: {
          where: {
            startTime: {
              gte: today
            }
          },
          take: 1
        }
      },
      orderBy: {
        releaseDate: 'desc'
      }
    });
    
    const formattedMovies = nowShowingMovies.map(formatMovie);
    
    res.status(200).json(formattedMovies);
  } catch (error) {
    console.error('Error fetching now showing movies:', error);
    res.status(500).json({ message: 'Failed to fetch now showing movies' });
  }
};

 const getFeaturedMovie = async (req, res) => {
  try {
    // Get the most recent movie with showtimes as featured
    const today = new Date();
    
    const featuredMovie = await prisma.movie.findFirst({
      where: {
        showTimes: {
          some: {
            startTime: {
              gte: today
            }
          }
        }
      },
      orderBy: {
        releaseDate: 'desc'
      }
    });
    
    if (!featuredMovie) {
      return res.status(404).json({ message: 'No featured movie found' });
    }
    
    const formattedMovie = formatMovie(featuredMovie);
    
    res.status(200).json(formattedMovie);
  } catch (error) {
    console.error('Error fetching featured movie:', error);
    res.status(500).json({ message: 'Failed to fetch featured movie' });
  }
};

// Showtimes APIs
const getMovieShowtimes = async (req, res) => {
  try {
    const { movieId } = req.params;
    const today = new Date();
    
    // Get next 7 days of showtimes
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);
    
    const showtimes = await prisma.showTime.findMany({
      where: {
        movieId: Number(movieId),
        startTime: {
          gte: today,
          lt: endDate
        }
      },
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
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    // Group showtimes by date and then by theater
    const groupedShowtimes = {};
    
    showtimes.forEach(showtime => {
      const date = showtime.startTime.toISOString().split('T')[0];
      const theaterId = showtime.hall.filmHallId;
      
      if (!groupedShowtimes[date]) {
        groupedShowtimes[date] = {};
      }
      
      if (!groupedShowtimes[date][theaterId]) {
        groupedShowtimes[date][theaterId] = {
          theater: {
            id: theaterId,
            name: showtime.hall.filmHall.name,
            location: showtime.hall.filmHall.city
          },
          showtimes: []
        };
      }
      
      groupedShowtimes[date][theaterId].showtimes.push({
        id: showtime.id,
        startTime: showtime.startTime.toISOString(),
        screen: {
          name: showtime.hall.name,
          screenType: '2D' // This could be stored in the hall model
        },
        price: showtime.basePrice.toString(),
        premiumPrice: showtime.pricingOptions.length > 0 ? 
          showtime.pricingOptions[0].price.toString() : 
          (parseFloat(showtime.basePrice) * 1.5).toString() // Default premium price if not set
      });
    });
    
    res.status(200).json(groupedShowtimes);
  } catch (error) {
    console.error('Error fetching movie showtimes:', error);
    res.status(500).json({ message: 'Failed to fetch movie showtimes' });
  }
};

const getAvailableSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;
    
    // Get all seats in the hall
    const showtime = await prisma.showTime.findUnique({
      where: { id: Number(showtimeId) },
      include: {
        hall: {
          include: {
            seats: {
              include: {
                seatType: true
              }
            }
          }
        },
        tickets: {
          select: {
            seatId: true
          }
        }
      }
    });
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    
    // Get booked seat IDs
    const bookedSeatIds = showtime.tickets.map(ticket => ticket.seatId);
    
    // Format seats with availability
    const seats = showtime.hall.seats.map(seat => {
      return {
        id: seat.id,
        row: seat.row,
        number: seat.number,
        type: seat.seatType.name,
        available: !bookedSeatIds.includes(seat.id)
      };
    });
    
    // Group seats by row
    const seatsByRow = {};
    seats.forEach(seat => {
      if (!seatsByRow[seat.row]) {
        seatsByRow[seat.row] = [];
      }
      seatsByRow[seat.row].push(seat);
    });
    
    // Sort rows alphabetically and seats numerically within each row
    const sortedRows = Object.keys(seatsByRow).sort();
    const formattedSeats = sortedRows.map(row => {
      return {
        row,
        seats: seatsByRow[row].sort((a, b) => a.number - b.number)
      };
    });
    
    res.status(200).json(formattedSeats);
  } catch (error) {
    console.error('Error fetching available seats:', error);
    res.status(500).json({ message: 'Failed to fetch available seats' });
  }
};

// Booking and Payment APIs
const createBooking = async (req, res) => {
  try {
    const { userId, showtimeId, seats, paymentMethod } = req.body;
    
    console.log('Booking request received:', { userId, showtimeId, seats, paymentMethod });
    
    if (!userId || !showtimeId || !seats || !seats.length || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get showtime with pricing info
    const showtime = await prisma.showTime.findUnique({
      where: { id: Number(showtimeId) },
      include: {
        pricingOptions: true,
        movie: true,
        hall: true
      }
    });
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    
    console.log('Found showtime:', showtime.id);
    
    // Get seat information for the selected seats with their types and hall info
    const selectedSeats = await prisma.seat.findMany({
      where: {
        id: {
          in: seats.map(seatId => Number(seatId))
        }
      },
      include: {
        hall: true
      }
    });
    
    console.log('Selected seats found:', selectedSeats.length);
    
    if (selectedSeats.length !== seats.length) {
      console.error('Not all seats were found in the database');
      return res.status(400).json({ message: 'One or more selected seats are invalid' });
    }
    
    // Check existing tickets for these seats in this showtime
    const existingTickets = await prisma.ticket.findMany({
      where: {
        showTimeId: Number(showtimeId),
        seatId: {
          in: seats.map(seatId => Number(seatId))
        }
      },
      include: {
        payment: true
      }
    });
    
    console.log('Existing tickets:', existingTickets);
    
    // Check for conflicts
    const conflictingTickets = existingTickets.filter(ticket => 
      ticket.userId !== Number(userId) || ticket.selectionStatus === 'BOOKED'
    );
    
    if (conflictingTickets.length > 0) {
      return res.status(400).json({ 
        message: 'Some seats are already booked or selected by another user', 
        conflictingSeats: conflictingTickets.map(ticket => ({
          seatId: ticket.seatId,
          status: ticket.selectionStatus,
          userId: ticket.userId
        }))
      });
    }
    
    // Calculate total price using base price
    const totalAmount = selectedSeats.length * parseFloat(showtime.basePrice);
    console.log('Total amount calculated:', totalAmount);
    
    // Map payment method to enum value
    let paymentMethodEnum = 'ESEWA'; // Default
    
    // if (paymentMethod === 'ESEWA') {
    //   paymentMethodEnum = 'BANK_TRANSFER';
    // } else if (['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH'].includes(paymentMethod)) {
    //   paymentMethodEnum = paymentMethod;
    // }
    
    // Create or update payment record
    let payment;
    const userSelectedTickets = existingTickets.filter(ticket => 
      ticket.userId === Number(userId) && ticket.selectionStatus === 'SELECTED'
    );
    
    if (userSelectedTickets.length > 0) {
      // Update existing payment
      const existingPaymentId = userSelectedTickets[0].paymentId;
      payment = await prisma.payment.update({
        where: { id: existingPaymentId },
        data: {
          amount: totalAmount,
          status: 'PENDING',
          paymentMethod: paymentMethodEnum
        }
      });
      console.log('Payment updated:', payment.id);
    } else {
      // Create new payment
      payment = await prisma.payment.create({
        data: {
          amount: totalAmount,
          status: 'PENDING',
          paymentMethod: paymentMethodEnum,
          userId: Number(userId)
        }
      });
      console.log('Payment created:', payment.id);
    }
    
    // Update or create tickets
    const ticketPromises = selectedSeats.map(async (seat) => {
      // Check if ticket already exists for this user, seat, and showtime
      const existingTicket = existingTickets.find(ticket => 
        ticket.seatId === seat.id && 
        ticket.userId === Number(userId)
      );
      
      if (existingTicket) {
        // Update existing ticket
        return await prisma.ticket.update({
          where: {
            id: existingTicket.id
          },
          data: {
            price: showtime.basePrice,
            paymentId: payment.id,
            selectionStatus: 'BOOKED',
            qrCode: `TICKET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
          }
        });
      } else {
        // Create new ticket
        return await prisma.ticket.create({
          data: {
            showTimeId: Number(showtimeId),
            userId: Number(userId),
            seatId: seat.id,
            price: showtime.basePrice,
            paymentId: payment.id,
            // selectionStatus: 'BOOKED',
            qrCode: `TICKET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
          }
        });
      }
    });

    const tickets = await Promise.all(ticketPromises);
    
    console.log('Tickets processed:', tickets.length);
    
    res.status(201).json({
      message: 'Booking created successfully',
      payment,
      tickets
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

 const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const bookings = await prisma.ticket.findMany({
      where: {
        userId: Number(userId)
      },
      include: {
        showTime: {
          include: {
            movie: true,
            hall: {
              include: {
                filmHall: true
              }
            }
          }
        },
        seat: {
          include: {
            seatType: true
          }
        },
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Group tickets by payment ID (booking)
    const groupedBookings = {};
    
    bookings.forEach(ticket => {
      if (!groupedBookings[ticket.paymentId]) {
        groupedBookings[ticket.paymentId] = {
          id: ticket.paymentId,
          date: ticket.createdAt,
          movie: {
            id: ticket.showTime.movie.id,
            title: ticket.showTime.movie.title,
            image: ticket.showTime.movie.posterUrl
          },
          showtime: {
            id: ticket.showTimeId,
            date: ticket.showTime.startTime,
            theater: ticket.showTime.hall.filmHall.name
          },
          totalAmount: parseFloat(ticket.payment.amount),
          status: ticket.payment.status,
          tickets: []
        };
      }
      
      groupedBookings[ticket.paymentId].tickets.push({
        id: ticket.id,
        seat: `${ticket.seat.row}${ticket.seat.number}`,
        type: ticket.seat.seatType.name,
        price: parseFloat(ticket.price),
        qrCode: ticket.qrCode,
        isUsed: ticket.isUsed
      });
    });
    
    res.status(200).json(Object.values(groupedBookings));
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Failed to fetch user bookings' });
  }
};

// Film Hall APIs
const getFilmHalls = async (req, res) => {
  try {
    const filmHalls = await prisma.filmHall.findMany({
      include: {
        halls: true
      }
    });
    
    const formattedFilmHalls = filmHalls.map(hall => ({
      id: hall.id,
      name: hall.name,
      address: hall.address,
      city: hall.city,
      description: hall.description,
      image: hall.imageUrl,
      hallCount: hall.halls.length
    }));
    
    res.status(200).json(formattedFilmHalls);
  } catch (error) {
    console.error('Error fetching film halls:', error);
    res.status(500).json({ message: 'Failed to fetch film halls' });
  }
};

const getFilmHall = async (req, res) => {
  try {
    const { id } = req.params;
    
    const filmHall = await prisma.filmHall.findUnique({
      where: { id: Number(id) },
      include: {
        halls: true
      }
    });
    
    if (!filmHall) {
      return res.status(404).json({ message: 'Film hall not found' });
    }
    
    // Get today's showtimes for this film hall
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const showtimes = await prisma.showTime.findMany({
      where: {
        hall: {
          filmHallId: Number(id)
        },
        startTime: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        movie: true,
        hall: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    // Group showtimes by movie
    const movieShowtimes = {};
    
    showtimes.forEach(showtime => {
      if (!movieShowtimes[showtime.movieId]) {
        movieShowtimes[showtime.movieId] = {
          movie: formatMovie(showtime.movie),
          showtimes: []
        };
      }
      
      movieShowtimes[showtime.movieId].showtimes.push({
        id: showtime.id,
        time: showtime.startTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        hall: showtime.hall.name
      });
    });
    
    const formattedFilmHall = {
      id: filmHall.id,
      name: filmHall.name,
      address: filmHall.address,
      city: filmHall.city,
      description: filmHall.description,
      image: filmHall.imageUrl,
      halls: filmHall.halls.map(hall => ({
        id: hall.id,
        name: hall.name,
        capacity: hall.capacity
      })),
      todayShowtimes: Object.values(movieShowtimes)
    };
    
    res.status(200).json(formattedFilmHall);
  } catch (error) {
    console.error('Error fetching film hall:', error);
    res.status(500).json({ message: 'Failed to fetch film hall' });
  }
};

// User APIs
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
};

// Handle payment completion from eSewa
const completePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;
    
    // Update payment status to COMPLETED
    const payment = await prisma.payment.update({
      where: { id: Number(id) },
      data: {
        status: 'COMPLETED',
        transactionId: transactionId
      },
      include: {
        tickets: true
      }
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json({ 
      message: 'Payment completed successfully',
      payment
    });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ message: 'Failed to complete payment' });
  }
};
const getshowtimesbyid = async (req,res) => {
  try {
    const {id} = req.params
     const data = await prisma.showTime.findUnique({
       include:{
        hall: {
          include:{
            seats:{
          
              include:{
                seatType:true,
                tickets:true
              }
            },
            
          }
        },
        movie: true,
        pricingOptions:true,
        
       },
       where: {
        id: Number(id)
       }
     })
     console.log(data)
     res.json(data)
  } catch (error) {
    
  }
  
}
export default {
  getshowtimesbyid,
  updateUserProfile,
  getUserProfile,
  getMovies,
  getMovie,
  getFilmHalls,
  getFilmHall,
  createBooking,
  completePayment,
  getFilmHall,
  getMovieCategories,
  getFilmHalls,
  getUpcomingMovies,
  getAvailableSeats,
  getMovieShowtimes,
  getUserBookings,
  getFeaturedMovie,
  getNowShowingMovies
}