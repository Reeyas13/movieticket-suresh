import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding process...');

  // Clean up existing data - delete in reverse order of dependencies
  console.log('Cleaning up existing data...');
  await prisma.ticket.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.showTimePricing.deleteMany({});
  await prisma.showTime.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.hall.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.filmHall.deleteMany({});
  await prisma.seatType.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating users...');
  // Create users with different roles
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcryptjs.hash('password123', 10),
      phone: '9800000000',
      role: 'ADMIN'
    }
  });

  const cinemaUser = await prisma.user.create({
    data: {
      name: 'Cinema Manager',
      email: 'cinema@example.com',
      password: await bcryptjs.hash('password123', 10),
      phone: '9800000001',
      role: 'CINEMA'
    }
  });

  const regularUser = await prisma.user.create({
    data: {
      name: 'Regular User',
      email: 'user@example.com',
      password: await bcryptjs.hash('password123', 10),
      phone: '9800000002',
      role: 'USER'
    }
  });

  console.log('Creating film hall...');
  // Create a film hall
  const filmHall = await prisma.filmHall.create({
    data: {
      name: 'City Cinemas',
      address: '123 Main Street',
      city: 'Kathmandu',
      description: 'A premium movie experience with state-of-the-art facilities',
      imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
      userId: cinemaUser.id
    }
  });

  console.log('Creating seat types...');
  // Create seat types
  const standardSeatType = await prisma.seatType.create({
    data: {
      name: 'Standard',
      description: 'Regular comfortable seating'
    }
  });

  const premiumSeatType = await prisma.seatType.create({
    data: {
      name: 'Premium',
      description: 'Extra comfortable seating with more legroom'
    }
  });

  const vipSeatType = await prisma.seatType.create({
    data: {
      name: 'VIP',
      description: 'Luxury recliner seats with personal service'
    }
  });

  console.log('Creating halls...');
  // Create halls in the film hall
  const hall1 = await prisma.hall.create({
    data: {
      name: 'Hall 1',
      capacity: 120,
      filmHallId: filmHall.id
    }
  });

  const hall2 = await prisma.hall.create({
    data: {
      name: 'Hall 2',
      capacity: 80,
      filmHallId: filmHall.id
    }
  });

  console.log('Creating seats...');
  // Create seats for Hall 1
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 15;

  const hall1Seats = [];
  for (const row of rows) {
    for (let number = 1; number <= seatsPerRow; number++) {
      // Assign different seat types based on rows
      let seatTypeId;
      if (row === 'A' || row === 'B') {
        seatTypeId = vipSeatType.id; // First two rows are VIP
      } else if (row === 'C' || row === 'D' || row === 'E') {
        seatTypeId = premiumSeatType.id; // Middle rows are Premium
      } else {
        seatTypeId = standardSeatType.id; // Rest are Standard
      }

      const seat = await prisma.seat.create({
        data: {
          row,
          number,
          hallId: hall1.id,
          seatTypeId
        }
      });
      hall1Seats.push(seat);
    }
  }

  // Create seats for Hall 2 (smaller hall)
  const hall2Seats = [];
  for (const row of rows.slice(0, 6)) { // Fewer rows for Hall 2
    for (let number = 1; number <= 13; number++) { // Fewer seats per row
      let seatTypeId;
      if (row === 'A') {
        seatTypeId = vipSeatType.id;
      } else if (row === 'B' || row === 'C') {
        seatTypeId = premiumSeatType.id;
      } else {
        seatTypeId = standardSeatType.id;
      }

      const seat = await prisma.seat.create({
        data: {
          row,
          number,
          hallId: hall2.id,
          seatTypeId
        }
      });
      hall2Seats.push(seat);
    }
  }

  console.log('Creating movies...');
  // Create movies using images in uploads/products
  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        title: 'Final Destination: Bloodlines',
        description: 'In this new installment of the horror franchise, a group of friends narrowly escape a catastrophic accident only to find themselves hunted by death itself. As they try to break the cycle of fate, they discover dark secrets about their ancestors that might hold the key to their survival.',
        duration: 105,
        genre: 'Horror/Thriller',
        releaseDate: new Date('2025-07-15'),
        language: 'English',
        director: 'Steven Quale',
        cast: 'Emma Roberts, Dylan Minnette, Josephine Langford',
        posterUrl: JSON.stringify(['/uploads/products/final-destination-bloodlines.avif']),
        trailerUrl: 'https://www.youtube.com/watch?v=dummytrailer1'
      }
    }),
    prisma.movie.create({
      data: {
        title: 'Housefull 5',
        description: 'The fifth installment in the popular Housefull comedy franchise brings back the chaos and confusion with new characters and hilarious situations. When three couples end up in the same mansion due to a series of misunderstandings, a roller coaster of comedy ensues.',
        duration: 140,
        genre: 'Comedy',
        releaseDate: new Date('2025-06-20'),
        language: 'Hindi',
        director: 'Farhad Samji',
        cast: 'Akshay Kumar, Riteish Deshmukh, Abhishek Bachchan',
        posterUrl: JSON.stringify(['/uploads/products/housefull-5.jpg']),
        trailerUrl: 'https://www.youtube.com/watch?v=dummytrailer2'
      }
    }),
    prisma.movie.create({
      data: {
        title: 'Unn Ko Sweater',
        description: 'A heartwarming Nepali drama about a young girl from a mountain village who knits a sweater for her grandmother during a harsh winter. As she navigates the challenges of rural life and modern education, she learns valuable lessons about family, tradition, and perseverance.',
        duration: 125,
        genre: 'Drama',
        releaseDate: new Date('2025-05-01'),
        language: 'Nepali',
        director: 'Suman Pokhrel',
        cast: 'Malina Joshi, Dayahang Rai, Saugat Malla',
        posterUrl: JSON.stringify(['/uploads/products/unnkosweater.jpg']),
        trailerUrl: 'https://www.youtube.com/watch?v=dummytrailer3'
      }
    })
  ]);

  console.log('Creating showtimes...');
  // Create showtimes for the movies
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  // Create multiple showtimes for each movie across both halls
  const showtimes = [];
  
  // Showtimes for Final Destination: Bloodlines
  for (let day = 0; day < 7; day++) {
    const date = new Date(tomorrowStart);
    date.setDate(tomorrowStart.getDate() + day);
    
    // Morning show (Hall 1)
    const morningStart = new Date(date);
    morningStart.setHours(10, 0, 0, 0);
    const morningEnd = new Date(morningStart);
    morningEnd.setMinutes(morningStart.getMinutes() + movies[0].duration);
    
    const morningShow = await prisma.showTime.create({
      data: {
        startTime: morningStart,
        endTime: morningEnd,
        movieId: movies[0].id,
        hallId: hall1.id,
        basePrice: 300.00
      }
    });
    showtimes.push(morningShow);
    
    // Evening show (Hall 2)
    const eveningStart = new Date(date);
    eveningStart.setHours(18, 30, 0, 0);
    const eveningEnd = new Date(eveningStart);
    eveningEnd.setMinutes(eveningStart.getMinutes() + movies[0].duration);
    
    const eveningShow = await prisma.showTime.create({
      data: {
        startTime: eveningStart,
        endTime: eveningEnd,
        movieId: movies[0].id,
        hallId: hall2.id,
        basePrice: 350.00
      }
    });
    showtimes.push(eveningShow);
  }
  
  // Showtimes for Housefull 5
  for (let day = 0; day < 7; day++) {
    const date = new Date(tomorrowStart);
    date.setDate(tomorrowStart.getDate() + day);
    
    // Afternoon show (Hall 1)
    const afternoonStart = new Date(date);
    afternoonStart.setHours(13, 15, 0, 0);
    const afternoonEnd = new Date(afternoonStart);
    afternoonEnd.setMinutes(afternoonStart.getMinutes() + movies[1].duration);
    
    const afternoonShow = await prisma.showTime.create({
      data: {
        startTime: afternoonStart,
        endTime: afternoonEnd,
        movieId: movies[1].id,
        hallId: hall1.id,
        basePrice: 320.00
      }
    });
    showtimes.push(afternoonShow);
    
    // Late evening show (Hall 2)
    const lateEveningStart = new Date(date);
    lateEveningStart.setHours(21, 0, 0, 0);
    const lateEveningEnd = new Date(lateEveningStart);
    lateEveningEnd.setMinutes(lateEveningStart.getMinutes() + movies[1].duration);
    
    const lateEveningShow = await prisma.showTime.create({
      data: {
        startTime: lateEveningStart,
        endTime: lateEveningEnd,
        movieId: movies[1].id,
        hallId: hall2.id,
        basePrice: 370.00
      }
    });
    showtimes.push(lateEveningShow);
  }
  
  // Showtimes for Unn Ko Sweater
  for (let day = 0; day < 7; day++) {
    const date = new Date(tomorrowStart);
    date.setDate(tomorrowStart.getDate() + day);
    
    // Late afternoon show (Hall 1)
    const lateAfternoonStart = new Date(date);
    lateAfternoonStart.setHours(16, 30, 0, 0);
    const lateAfternoonEnd = new Date(lateAfternoonStart);
    lateAfternoonEnd.setMinutes(lateAfternoonStart.getMinutes() + movies[2].duration);
    
    const lateAfternoonShow = await prisma.showTime.create({
      data: {
        startTime: lateAfternoonStart,
        endTime: lateAfternoonEnd,
        movieId: movies[2].id,
        hallId: hall1.id,
        basePrice: 310.00
      }
    });
    showtimes.push(lateAfternoonShow);
  }

  console.log('Creating showtime pricing...');
  // Create pricing for each showtime
  for (const showtime of showtimes) {
    // Standard seats pricing
    await prisma.showTimePricing.create({
      data: {
        showTimeId: showtime.id,
        seatTypeId: standardSeatType.id,
        price: showtime.basePrice
      }
    });
    
    // Premium seats pricing (20% more than base price)
    await prisma.showTimePricing.create({
      data: {
        showTimeId: showtime.id,
        seatTypeId: premiumSeatType.id,
        price: showtime.basePrice * 1.2
      }
    });
    
    // VIP seats pricing (50% more than base price)
    await prisma.showTimePricing.create({
      data: {
        showTimeId: showtime.id,
        seatTypeId: vipSeatType.id,
        price: showtime.basePrice * 1.5
      }
    });
  }

  console.log('Creating sample payment and tickets...');
  // Create a sample payment and tickets for the regular user
  const sampleShowtime = showtimes[0]; // Using the first showtime
  
  // Find a VIP seat in the showtime's hall
  const vipSeat = await prisma.seat.findFirst({
    where: {
      hallId: sampleShowtime.hallId,
      seatTypeId: vipSeatType.id
    }
  });
  
  // Create payment
  const payment = await prisma.payment.create({
    data: {
      amount: sampleShowtime.basePrice * 1.5, // VIP pricing
      status: 'COMPLETED',
      paymentMethod: 'CREDIT_CARD',
      transactionId: 'TRANS123456789',
      userId: regularUser.id
    }
  });
  
  // Create ticket
  await prisma.ticket.create({
    data: {
      showTimeId: sampleShowtime.id,
      userId: regularUser.id,
      seatId: vipSeat.id,
      price: sampleShowtime.basePrice * 1.5,
      paymentId: payment.id,
      qrCode: `TICKET-${sampleShowtime.id}-${vipSeat.id}-${regularUser.id}`,
      isUsed: false
    }
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
