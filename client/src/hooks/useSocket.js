// hooks/useSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8080'; // Your backend URL

export const useSocket = (showtimeId, userId) => {
  const socketRef = useRef();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    if (!showtimeId || !userId) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
      
      // Join the showtime room
      socket.emit('join-showtime', { showtimeId, userId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to server');
      setIsConnected(false);
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message);
    });

    // User activity handlers
    socket.on('user-joined', (data) => {
      setActiveUsers(data.activeUsers);
    });

    socket.on('user-left', (data) => {
      setActiveUsers(data.activeUsers);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave-showtime', { showtimeId, userId });
        socket.disconnect();
      }
    };
  }, [showtimeId, userId]);

  // Socket event listeners
  const onSeatStatusUpdate = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('seat-status-update', callback);
      return () => socketRef.current.off('seat-status-update', callback);
    }
  };

  const onSeatSelected = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('seat-selected', callback);
      return () => socketRef.current.off('seat-selected', callback);
    }
  };

  const onSeatDeselected = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('seat-deselected', callback);
      return () => socketRef.current.off('seat-deselected', callback);
    }
  };

  const onSeatsBooked = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('seats-booked', callback);
      return () => socketRef.current.off('seats-booked', callback);
    }
  };

  const onSeatReleased = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('seat-released', callback);
      return () => socketRef.current.off('seat-released', callback);
    }
  };

  const onSeatSelectionFailed = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('seat-selection-failed', callback);
      return () => socketRef.current.off('seat-selection-failed', callback);
    }
  };

  const onBookingFailed = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('booking-failed', callback);
      return () => socketRef.current.off('booking-failed', callback);
    }
  };

  const onBroadcastMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('broadcast-message', callback);
      return () => socketRef.current.off('broadcast-message', callback);
    }
  };

  // Socket emit functions
  const selectSeat = (seatId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('select-seat', { showtimeId, seatId, userId });
    }
  };

  const deselectSeat = (seatId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('deselect-seat', { showtimeId, seatId, userId });
    }
  };

  const bookSeats = (seatIds, paymentId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('book-seats', { 
        showtimeId, 
        seatIds, 
        userId, 
        paymentId 
      });
    }
  };

  const getSeatStatus = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('get-seat-status', { showtimeId });
    }
  };

  return {
    isConnected,
    error,
    activeUsers,
    // Event listeners
    onSeatStatusUpdate,
    onSeatSelected,
    onSeatDeselected,
    onSeatsBooked,
    onSeatReleased,
    onSeatSelectionFailed,
    onBookingFailed,
    onBroadcastMessage,
    // Emit functions
    selectSeat,
    deselectSeat,
    bookSeats,
    getSeatStatus,
  };
};