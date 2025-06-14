import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding process...');

  // Clean up existing data - delete in reverse order of dependencies
  console.log('Cleaning up existing data...');
  // await prisma.ticket.deleteMany({});
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
    }),
    prisma.movie.create({
      data: {
        title: 'Bhaagi 4',
        description: 'The fourth installment of the high-octane action franchise follows Tiger as he faces his most dangerous mission yet. With spectacular stunts, intense fight sequences, and a gripping storyline, Tiger must save his family while taking on an international crime syndicate.',
        duration: 132,
        genre: 'Action/Thriller',
        releaseDate: new Date('2025-08-15'),
        language: 'Hindi',
        director: 'Ahmed Khan',
        cast: 'Tiger Shroff, Shraddha Kapoor, Riteish Deshmukh',
        posterUrl: JSON.stringify(['/uploads/products/bhagi4.jpg']),
        trailerUrl: 'https://www.youtube.com/watch?v=dummytrailer4'
      }
    }),
    prisma.movie.create({
      data: {
        title: 'Maalik',
        description: 'A powerful political drama that explores the journey of a common man who rises to become a leader fighting against corruption and injustice. Set against the backdrop of contemporary politics, this film showcases the struggle between power and righteousness.',
        duration: 148,
        genre: 'Drama/Political',
        releaseDate: new Date('2025-09-01'),
        language: 'Hindi',
        director: 'Ashish R. Mohan',
        cast: 'Rajkummar Rao, Taapsee Pannu, Pankaj Tripathi',
        posterUrl: JSON.stringify(['/uploads/products/Maalik_(2025_film).jpg']),
        trailerUrl: 'https://www.youtube.com/watch?v=dummytrailer5'
      }
    }),
    prisma.movie.create({
      data: {
        title: 'Sitaare Zameen Par',
        description: 'A heartwarming sequel to the beloved Taare Zameen Par, this film continues the journey of understanding and nurturing special children. It tells the story of a new group of students who discover their unique talents with the help of an inspiring teacher.',
        duration: 155,
        genre: 'Drama/Family',
        releaseDate: new Date('2025-12-25'),
        language: 'Hindi',
        director: 'Aamir Khan',
        cast: 'Aamir Khan, Genelia DSouza, Darsheel Safary',
        posterUrl: JSON.stringify(['/uploads/products/Sitaare_Zameen_Par_poster.jpg']),
        trailerUrl: 'https://www.youtube.com/watch?v=dummytrailer6'
      }
    }),
    prisma.movie.create({
      data: {
        title: 'War 2',
        description: 'The highly anticipated sequel to the blockbuster War brings back high-octane action and espionage. Agent Kabir faces a new threat as he uncovers a conspiracy that goes deeper than he ever imagined. With breathtaking action sequences and stunning visuals.',
        duration: 165,
        genre: 'Action/Spy',
        releaseDate: new Date('2025-10-02'),
        language: 'Hindi',
        director: 'Ayan Mukerji',
        cast: 'Hrithik Roshan, Tiger Shroff, Vaani Kapoor',
        posterUrl: JSON.stringify(['/uploads/products/war-2-et00356501-1747723057.avif']),
        trailerUrl: 'https://www.youtube.com/watch?v=dummytrailer7'
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
  
  // Define time slots
  const timeSlots = [
    { hour: 10, minute: 0 },   // Morning
    { hour: 13, minute: 15 },  // Afternoon
    { hour: 16, minute: 30 },  // Late Afternoon
    { hour: 19, minute: 45 },  // Evening
    { hour: 22, minute: 0 }    // Night
  ];

  // Create showtimes for each movie
  for (let movieIndex = 0; movieIndex < movies.length; movieIndex++) {
    const movie = movies[movieIndex];
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(tomorrowStart);
      date.setDate(tomorrowStart.getDate() + day);
      
      // Create 2-3 shows per day per movie
      const numShows = Math.floor(Math.random() * 2) + 2; // 2 or 3 shows
      const selectedTimeSlots = timeSlots.slice(0, numShows);
      
      for (let showIndex = 0; showIndex < selectedTimeSlots.length; showIndex++) {
        const timeSlot = selectedTimeSlots[showIndex];
        const hallId = showIndex % 2 === 0 ? hall1.id : hall2.id; // Alternate between halls
        
        const startTime = new Date(date);
        startTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + movie.duration);
        
        // Calculate base price based on time slot and movie popularity
        let basePrice = 300;
        if (timeSlot.hour >= 19) basePrice += 50; // Evening premium
        if (movie.title.includes('War') || movie.title.includes('Bhaagi')) basePrice += 30; // Action premium
        if (movie.title.includes('Sitaare') || movie.title.includes('Maalik')) basePrice += 20; // Premium content
        
        const showtime = await prisma.showTime.create({
          data: {
            startTime,
            endTime,
            movieId: movie.id,
            hallId,
            basePrice: basePrice
          }
        });
        showtimes.push(showtime);
      }
    }
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

  console.log('Creating sample payments and tickets...');
  // Create multiple sample payments and tickets for different users and movies
  const sampleShowtimes = showtimes.slice(0, 5); // Use first 5 showtimes
  
  for (let i = 0; i < sampleShowtimes.length; i++) {
    const showtime = sampleShowtimes[i];
    
    // Find different types of seats
    const seats = await prisma.seat.findMany({
      where: {
        hallId: showtime.hallId,
      },
      take: 3,
      skip: i * 3 // Different seats for each booking
    });
    
    for (const seat of seats) {
      // Get the pricing for this seat type
      const pricing = await prisma.showTimePricing.findFirst({
        where: {
          showTimeId: showtime.id,
          seatTypeId: seat.seatTypeId
        }
      });
      
      // Create payment
      const payment = await prisma.payment.create({
        data: {
          amount: pricing.price,
          status: Math.random() > 0.2 ? 'COMPLETED' : 'PENDING', // 80% completed, 20% pending
          paymentMethod: ['CREDIT_CARD', 'ESEWA', 'PAYPAL'][Math.floor(Math.random() * 3)],
          transactionId: `TRANS${Date.now()}${Math.floor(Math.random() * 1000)}`,
          userId: regularUser.id
        }
      });
      
      // Create ticket
      await prisma.ticket.create({
        data: {
          showTimeId: showtime.id,
          userId: regularUser.id,
          seatId: seat.id,
          price: pricing.price,
          paymentId: payment.id,
          qrCode: `TICKET-${showtime.id}-${seat.id}-${regularUser.id}-${Date.now()}`,
          selectionStatus: payment.status === 'COMPLETED' ? 'BOOKED' : 'SELECTED',
          isUsed: Math.random() > 0.8 // 20% chance of being used
        }
      });
    }
  }

  console.log('Seeding completed successfully.');
  console.log(`Created ${movies.length} movies with ${showtimes.length} showtimes.`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });