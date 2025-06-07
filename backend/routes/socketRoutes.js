// routes/socketRoutes.js
// const express = require('express');
import express from 'express';
const socketRoutes = express.Router();

// These routes are mainly for REST API endpoints related to socket functionality
// The actual socket events are handled in the SocketController

// Get active users in a showtime
socketRoutes.get('/showtime/:showtimeId/active-users', (req, res) => {
  try {
    const { showtimeId } = req.params;
    const io = req.app.get('io');
    const socketController = req.app.get('socketController');
    
    const roomName = `showtime-${showtimeId}`;
    const activeUsers = socketController.activeUsers.get(roomName);
    const count = activeUsers ? activeUsers.size : 0;
    
    res.json({
      success: true,
      data: {
        showtimeId: parseInt(showtimeId),
        activeUsers: count
      }
    });
  } catch (error) {
    console.error('Error getting active users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active users'
    });
  }
});

// Get held seats for a showtime
socketRoutes.get('/showtime/:showtimeId/held-seats', (req, res) => {
  try {
    const { showtimeId } = req.params;
    const socketController = req.app.get('socketController');
    
    const heldSeats = [];
    for (const [holdKey, hold] of socketController.seatHolds.entries()) {
      if (holdKey.startsWith(`${showtimeId}-`)) {
        const seatId = holdKey.split('-')[1];
        heldSeats.push({
          seatId: parseInt(seatId),
          userId: hold.userId,
          timestamp: hold.timestamp,
          timeRemaining: Math.max(0, socketController.SEAT_HOLD_TIMEOUT - (Date.now() - hold.timestamp))
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        showtimeId: parseInt(showtimeId),
        heldSeats
      }
    });
  } catch (error) {
    console.error('Error getting held seats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get held seats'
    });
  }
});

// Release held seats (admin endpoint)
socketRoutes.post('/showtime/:showtimeId/release-seats', (req, res) => {
  try {
    const { showtimeId } = req.params;
    const { seatIds, userId } = req.body;
    const socketController = req.app.get('socketController');
    
    if (userId) {
      // Release all seats held by a specific user
      socketController.releaseUserSeats(showtimeId, userId);
    } else if (seatIds && Array.isArray(seatIds)) {
      // Release specific seats
      const roomName = `showtime-${showtimeId}`;
      seatIds.forEach(seatId => {
        const holdKey = `${showtimeId}-${seatId}`;
        const hold = socketController.seatHolds.get(holdKey);
        if (hold) {
          clearTimeout(hold.timeout);
          socketController.seatHolds.delete(holdKey);
          req.app.get('io').to(roomName).emit('seat-released', { seatId });
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Seats released successfully'
    });
  } catch (error) {
    console.error('Error releasing seats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to release seats'
    });
  }
});

// Broadcast message to all users in a showtime (admin endpoint)
socketRoutes.post('/showtime/:showtimeId/broadcast', (req, res) => {
  try {
    const { showtimeId } = req.params;
    const { message, type = 'info' } = req.body;
    const io = req.app.get('io');
    
    const roomName = `showtime-${showtimeId}`;
    io.to(roomName).emit('broadcast-message', {
      message,
      type,
      timestamp: Date.now()
    });
    
    res.json({
      success: true,
      message: 'Message broadcasted successfully'
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast message'
    });
  }
});

export default socketRoutes