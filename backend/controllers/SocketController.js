import prisma from "../prisma/prisma.js";

class SocketController {
  constructor(io) {
    this.io = io;
    this.activeUsers = new Map(); // Track users in each showtime room
    this.seatHolds = new Map(); // Track temporarily held seats
    this.SEAT_HOLD_TIMEOUT = 300000; // 5 minutes in milliseconds
  }

  // Initialize socket connections
  initializeSocket() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join showtime room
      socket.on('join-showtime', (data) => {
        this.handleJoinShowtime(socket, data);
      });

      // Handle seat selection
      socket.on('select-seat', (data) => {
        this.handleSeatSelection(socket, data);
      });

      // Handle seat deselection
      socket.on('deselect-seat', (data) => {
        this.handleSeatDeselection(socket, data);
      });

      // Handle seat booking/purchase
      socket.on('book-seats', (data) => {
        this.handleSeatBooking(socket, data);
      });

      // Handle user leaving showtime page
      socket.on('leave-showtime', (data) => {
        this.handleLeaveShowtime(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Get current seat status
      socket.on('get-seat-status', (data) => {
        this.handleGetSeatStatus(socket, data);
      });
    });
  }

  // Handle user joining a showtime room
  async handleJoinShowtime(socket, { showtimeId, userId }) {
    try {
      const roomName = `showtime-${showtimeId}`;
      
      // Join the room
      socket.join(roomName);
      socket.showtimeId = showtimeId;
      socket.userId = userId;

      // Track active users
      if (!this.activeUsers.has(roomName)) {
        this.activeUsers.set(roomName, new Set());
      }
      this.activeUsers.get(roomName).add(socket.id);

      // Get current seat status from database
      const seats = await this.getCurrentSeatStatus(showtimeId);
      
      // Send current seat status to the joining user
      socket.emit('seat-status-update', { seats });

      // Notify others about new user joining
      socket.to(roomName).emit('user-joined', { 
        userId, 
        activeUsers: this.activeUsers.get(roomName).size 
      });

      console.log(`User ${userId} joined showtime ${showtimeId}`);
    } catch (error) {
      console.error('Error joining showtime:', error);
      socket.emit('error', { message: 'Failed to join showtime' });
    }
  }

  // Handle seat selection (temporary hold)
  async handleSeatSelection(socket, { showtimeId, seatId, userId }) {
    try {
      const roomName = `showtime-${showtimeId}`;
      const holdKey = `${showtimeId}-${seatId}`;

      // Check if seat is already booked or held by someone else
      const isBooked = await this.isSeatBooked(showtimeId, seatId);
      const currentHold = this.seatHolds.get(holdKey);

      if (isBooked) {
        socket.emit('seat-selection-failed', { 
          seatId, 
          reason: 'Seat is already booked' 
        });
        return;
      }

      if (currentHold && currentHold.userId !== userId) {
        socket.emit('seat-selection-failed', { 
          seatId, 
          reason: 'Seat is currently held by another user' 
        });
        return;
      }

      // Hold the seat temporarily
      const holdTimeout = setTimeout(() => {
        this.seatHolds.delete(holdKey);
        this.io.to(roomName).emit('seat-released', { seatId });
      }, this.SEAT_HOLD_TIMEOUT);

      this.seatHolds.set(holdKey, {
        userId,
        socketId: socket.id,
        timeout: holdTimeout,
        timestamp: Date.now()
      });

      // Broadcast seat selection to all users in the room
      this.io.to(roomName).emit('seat-selected', { 
        seatId, 
        userId, 
        isTemporary: true 
      });

      console.log(`Seat ${seatId} selected by user ${userId} in showtime ${showtimeId}`);
    } catch (error) {
      console.error('Error selecting seat:', error);
      socket.emit('error', { message: 'Failed to select seat' });
    }
  }

  // Handle seat deselection
  async handleSeatDeselection(socket, { showtimeId, seatId, userId }) {
    try {
      const roomName = `showtime-${showtimeId}`;
      const holdKey = `${showtimeId}-${seatId}`;
      const currentHold = this.seatHolds.get(holdKey);

      // Only allow deselection by the user who selected it
      if (currentHold && currentHold.userId === userId) {
        clearTimeout(currentHold.timeout);
        this.seatHolds.delete(holdKey);

        // Broadcast seat deselection to all users in the room
        this.io.to(roomName).emit('seat-deselected', { seatId, userId });

        console.log(`Seat ${seatId} deselected by user ${userId} in showtime ${showtimeId}`);
      }
    } catch (error) {
      console.error('Error deselecting seat:', error);
      socket.emit('error', { message: 'Failed to deselect seat' });
    }
  }

  // Handle seat booking (permanent)
  async handleSeatBooking(socket, { showtimeId, seatIds, userId, paymentId }) {
    try {
      const roomName = `showtime-${showtimeId}`;

      // Verify all seats are held by this user
      const canBook = seatIds.every(seatId => {
        const holdKey = `${showtimeId}-${seatId}`;
        const hold = this.seatHolds.get(holdKey);
        return hold && hold.userId === userId;
      });

      if (!canBook) {
        socket.emit('booking-failed', { 
          reason: 'One or more seats are no longer available' 
        });
        return;
      }

      // Clear the temporary holds
      seatIds.forEach(seatId => {
        const holdKey = `${showtimeId}-${seatId}`;
        const hold = this.seatHolds.get(holdKey);
        if (hold) {
          clearTimeout(hold.timeout);
          this.seatHolds.delete(holdKey);
        }
      });

      // Broadcast permanent booking to all users in the room
      this.io.to(roomName).emit('seats-booked', { 
        seatIds, 
        userId, 
        paymentId,
        timestamp: Date.now()
      });

      console.log(`Seats ${seatIds.join(', ')} booked by user ${userId} in showtime ${showtimeId}`);
    } catch (error) {
      console.error('Error booking seats:', error);
      socket.emit('error', { message: 'Failed to book seats' });
    }
  }

  // Handle user leaving showtime
  handleLeaveShowtime(socket, { showtimeId, userId }) {
    try {
      const roomName = `showtime-${showtimeId}`;
      
      // Release any held seats by this user
      this.releaseUserSeats(showtimeId, userId);
      
      // Remove from active users
      if (this.activeUsers.has(roomName)) {
        this.activeUsers.get(roomName).delete(socket.id);
      }

      // Leave the room
      socket.leave(roomName);

      // Notify others
      socket.to(roomName).emit('user-left', { 
        userId,
        activeUsers: this.activeUsers.get(roomName)?.size || 0
      });

      console.log(`User ${userId} left showtime ${showtimeId}`);
    } catch (error) {
      console.error('Error leaving showtime:', error);
    }
  }

  // Handle socket disconnection
  handleDisconnect(socket) {
    try {
      const { showtimeId, userId } = socket;
      
      if (showtimeId && userId) {
        this.handleLeaveShowtime(socket, { showtimeId, userId });
      }

      console.log(`User disconnected: ${socket.id}`);
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  // Get current seat status
  async handleGetSeatStatus(socket, { showtimeId }) {
    try {
      const seats = await this.getCurrentSeatStatus(showtimeId);
      socket.emit('seat-status-update', { seats });
    } catch (error) {
      console.error('Error getting seat status:', error);
      socket.emit('error', { message: 'Failed to get seat status' });
    }
  }

  // Helper method to get current seat status from database
  async getCurrentSeatStatus(showtimeId) {
    const showtime = await prisma.showTime.findUnique({
      where: { id: parseInt(showtimeId) },
      include: {
        hall: {
          include: {
            seats: {
              include: {
                tickets: {
                  where: {
                    showTimeId: parseInt(showtimeId)
                  }
                },
                seatType: true
              }
            }
          }
        }
      }
    });

    if (!showtime) return [];

    return showtime.hall.seats.map(seat => ({
      id: seat.id.toString(),
      row: seat.row,
      number: seat.number,
      type: seat.seatType ? (seat.seatType.name === 'r' ? 'regular' : 'special') : 'regular',
      status: seat.tickets && seat.tickets.length > 0 ? 'booked' : 'available',
      seatTypeId: seat.seatTypeId
    }));
  }

  // Helper method to check if seat is booked
  async isSeatBooked(showtimeId, seatId) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        showTimeId: parseInt(showtimeId),
        seatId: parseInt(seatId)
      }
    });
    return !!ticket;
  }

  // Helper method to release all seats held by a user
  releaseUserSeats(showtimeId, userId) {
    const roomName = `showtime-${showtimeId}`;
    const keysToDelete = [];

    for (const [holdKey, hold] of this.seatHolds.entries()) {
      if (holdKey.startsWith(`${showtimeId}-`) && hold.userId === userId) {
        clearTimeout(hold.timeout);
        keysToDelete.push(holdKey);
      }
    }

    keysToDelete.forEach(key => {
      const seatId = key.split('-')[1];
      this.seatHolds.delete(key);
      this.io.to(roomName).emit('seat-released', { seatId });
    });
  }
}

// module.exports = SocketController;
export default   SocketController