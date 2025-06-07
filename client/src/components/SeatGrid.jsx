import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import { useParams } from 'react-router-dom';
import api from '../axios';
import { useSelector } from 'react-redux';

// Initialize socket
const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

const SeatGrid = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const showtimeid  = 22

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seatsByRow, setSeatsByRow] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [liveSelectedSeats, setLiveSelectedSeats] = useState([]);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, msg]);
  };

  // Fetch seats
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const res = await api.get(`api/frontend/getshowtimesbyid/${22}`);
        const seatsData = res.data.hall.seats;

        const grouped = seatsData.reduce((acc, seat) => {
          if (!acc[seat.row]) acc[seat.row] = [];
          acc[seat.row].push(seat);
          return acc;
        }, {});

        Object.keys(grouped).forEach(row => {
          grouped[row].sort((a, b) => a.number - b.number);
        });

        setSeatsByRow(grouped);
        setLoading(false);
      } catch (err) {
        setError('Failed to load seats');
        setLoading(false);
      }
    };

    fetchSeats();
  }, [showtimeid]);

  // Handle seat click
  const handleSeatClick = (seat) => {
    if (seat.tickets?.length > 0) return;

    const isAlreadySelected = selectedSeats.includes(seat.id);
    const updated = isAlreadySelected
      ? selectedSeats.filter(id => id !== seat.id)
      : [...selectedSeats, seat.id];

    setSelectedSeats(updated);

    socket.emit("selected_seat", {
      seatId: seat.id,
      showtimeId: showtimeid,
      userId: user?.id
    });
  };

  // Socket listeners
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    socket.on("selected_seat", ({ seatId, userId }) => {
      console.log("Socket received:", { seatId, userId, currentUserId: user?.id });
      addLog(`User ${userId} selected seat ID: ${seatId}`);
      
      if (userId !== user?.id) {
        console.log("Adding seat to liveSelectedSeats:", seatId);
        setLiveSelectedSeats(prev => {
          const updated = [...new Set([...prev, seatId])];
          console.log("Updated liveSelectedSeats:", updated);
          return updated;
        });
      } else {
        console.log("Ignoring own selection");
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("selected_seat");
    };
  }, [user]);

  if (loading) return <p>Loading seats...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="seat-grid max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Select Your Seats</h2>

      {Object.keys(seatsByRow).sort().map(row => (
        <div key={row} className="seat-row mb-4">
          <div className="row-label font-bold mb-2">Row {row}</div>
          <div className="seats flex gap-2 flex-wrap">
         {seatsByRow[row].map(seat => {
  const selectionStatus = seat.tickets?.[0]?.selectionStatus;
  const isBooked = selectionStatus === "BOOKED";
  const isSelectedByOther = selectionStatus === "SELECTED";
  const isSelected = selectedSeats.includes(seat.id);
  const isLiveSelectedByOther = liveSelectedSeats.includes(seat.id);
  
  // Debug logging for specific seats
  if (seat.id === 198 || seat.id === 159 || seat.id === 177) {
    console.log(`Seat ${seat.id}:`, {
      isBooked,
      isSelectedByOther,
      isSelected,
      isLiveSelectedByOther,
      liveSelectedSeats,
      selectionStatus
    });
  }

  return (
    <button
      key={seat.id}
      onClick={() => handleSeatClick(seat)}
      disabled={isBooked}
      className={`
        w-10 h-10 rounded border text-sm
        ${isBooked ? 'bg-red-500 cursor-not-allowed text-white' : ''}
        ${isSelected ? 'bg-green-500 text-white' : ''}
        ${(isSelectedByOther || isLiveSelectedByOther) && !isSelected ? 'bg-yellow-400 text-black' : ''}
        ${!isBooked && !isSelected && !isSelectedByOther && !isLiveSelectedByOther ? 'bg-white' : ''}
        hover:opacity-80 transition-all
      `}
      title={`Seat ${seat.row}${seat.number} - ${isBooked ? 'Booked' : (isSelectedByOther || isLiveSelectedByOther) ? 'Selected by other' : 'Available'}`}
    >
      {seat.number}
    </button>
  );
})}
          </div>
        </div>
      ))}

      <div className="mt-6">
        <strong>Selected Seats:</strong> {selectedSeats.join(', ') || 'None'}
      </div>
      
      <div className="mt-2">
        <strong>Live Selected by Others:</strong> {liveSelectedSeats.join(', ') || 'None'}
      </div>

      <div className="mt-6 flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded border"></div> You
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-400 rounded border"></div> Selected by others
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded border"></div> Booked
        </div>
      </div>

      {logs.length > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <strong className="block mb-2">Socket Logs:</strong>
          <ul className="list-disc ml-5 text-sm space-y-1">
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SeatGrid;