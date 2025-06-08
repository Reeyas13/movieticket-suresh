  import React, { useState, useEffect } from 'react';
  import api from '../axios';import { io } from "socket.io-client";
  import { useSelector } from 'react-redux';

  // Mock socket for demonstration - replace with actual socket.io import
  const socket = io("http://localhost:5001", {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  // Mock API for demonstration - replace with actual API


  const SeatGrid = () => {
    // Mock user data - replace with actual Redux selector
    // const user = { id: 1 };
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const showtimeid = 22;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [seatsByRow, setSeatsByRow] = useState({});
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [liveSelectedSeats, setLiveSelectedSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => {
      setLogs((prev) => [...prev, msg]);
    };

    // Fetch seats
    useEffect(() => {
      const fetchSeats = async () => {
        try {
          setLoading(true);
          const res = await api.get(`api/frontend/getshowtimesbyid/${showtimeid}`);
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
          
          // Initialize booked seats from existing tickets
          const initialBookedSeats = [];
          seatsData.forEach(seat => {
            if (seat.tickets && seat.tickets.length > 0) {
              const bookedTicket = seat.tickets.find(ticket => ticket.selectionStatus === 'BOOKED');
              if (bookedTicket) {
                initialBookedSeats.push(seat.id);
              }
            }
          });
          setBookedSeats(initialBookedSeats);
          
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
      // Don't allow selection of booked seats
      if (bookedSeats.includes(seat.id)) return;
      
      // Don't allow selection of seats selected by others
      if (liveSelectedSeats.includes(seat.id)) return;

      const isAlreadySelected = selectedSeats.includes(seat.id);
      
      if (isAlreadySelected) {
        // Deselect seat
        setSelectedSeats(prev => prev.filter(id => id !== seat.id));
        socket.emit("deselect_seat", {
          seatId: seat.id,
          showtimeId: showtimeid,
          userId: user?.id
        });
      } else {
        // Select seat
        setSelectedSeats(prev => [...prev, seat.id]);
        socket.emit("selected_seat", {
          seatId: seat.id,
          showtimeId: showtimeid,
          userId: user?.id
        });
      }
    };

    // Socket listeners
    useEffect(() => {
      socket.on("connect", () => {
        console.log("Connected to socket server:", socket.id);
        
        // Join the showtime room
        socket.emit("join_showtime", {
          showtimeId: showtimeid,
          userId: user?.id
        });
      });

      socket.on("selected_seat", ({ seatId, userId, status }) => {
        console.log("Socket received seat selection:", { seatId, userId, status, currentUserId: user?.id });
        addLog(`Seat ${seatId} selected by user ${userId}`);
        
        if (userId !== user?.id) {
          // Another user selected this seat
          setLiveSelectedSeats(prev => {
            const updated = [...new Set([...prev, seatId])];
            console.log("Updated liveSelectedSeats:", updated);
            return updated;
          });
        }
      });

      socket.on("seat_released", ({ seatId, showtimeId, userId }) => {
        console.log("Socket received seat release:", { seatId, showtimeId, userId });
        addLog(`Seat ${seatId} released by user ${userId}`);
        
        // Remove from live selected seats
        setLiveSelectedSeats(prev => prev.filter(id => id !== seatId));
        
        // If it was our seat, remove from selected seats too
        if (userId === user?.id) {
          setSelectedSeats(prev => prev.filter(id => id !== seatId));
        }
      });

      socket.on("seat_booked", ({ seatId, showtimeId, userId, status }) => {
        console.log("Socket received seat booking:", { seatId, showtimeId, userId, status });
        addLog(`Seat ${seatId} booked by user ${userId}`);
        
        // Add to booked seats
        setBookedSeats(prev => [...new Set([...prev, seatId])]);
        
        // Remove from selected and live selected
        setSelectedSeats(prev => prev.filter(id => id !== seatId));
        setLiveSelectedSeats(prev => prev.filter(id => id !== seatId));
      });

      socket.on("seat_selection_error", ({ message, seatId, status }) => {
        console.error("Seat selection error:", message);
        addLog(`Error selecting seat ${seatId}: ${message}`);
        
        // Remove from our selected seats if there was an error
        if (seatId) {
          setSelectedSeats(prev => prev.filter(id => id !== seatId));
        }
      });

      socket.on("seat_deselection_error", ({ message, seatId }) => {
        console.error("Seat deselection error:", message);
        addLog(`Error deselecting seat ${seatId}: ${message}`);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("selected_seat");
        socket.off("seat_released");
        socket.off("seat_booked");
        socket.off("seat_selection_error");
        socket.off("seat_deselection_error");
      };
    }, [user, showtimeid]);

    if (loading) return <p>Loading seats...</p>;
    if (error) return <p>{error}</p>;

    return (
      <div className="seat-grid max-w-3xl mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Select Your Seats</h2>

        {Object.keys(seatsByRow).sort().map(row => (
          <div key={row} className="seat-row mb-4">
            <div className="row-label font-bold mb-2"></div>
            <div className="seats flex gap-2 flex-wrap">
              {seatsByRow[row].map(seat => {
                const isBooked = bookedSeats.includes(seat.id);
                const isSelected = selectedSeats.includes(seat.id);
                const isLiveSelectedByOther = liveSelectedSeats.includes(seat.id);
                
                return (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={isBooked}
                    className={`
                      w-10 h-10 flex justify-center items-center rounded border-none transition-all duration-200
                      ${isBooked ? 'bg-red-500 cursor-not-allowed text-white' : ''}
                      ${isSelected ? 'bg-green-500 text-white' : ''}
                      ${isLiveSelectedByOther && !isSelected ? 'bg-yellow-400 text-black cursor-not-allowed' : ''}
                      ${!isBooked && !isSelected && !isLiveSelectedByOther ? 'bg-purple-100 hover:bg-gray-100' : ''}
                      ${!isBooked && !isLiveSelectedByOther ? 'cursor-pointer' : ''}
                      hover:opacity-80
                    `}
                    title={`Seat ${seat.row}${seat.number} - ${
                      isBooked ? 'Booked' : 
                      isLiveSelectedByOther ? 'Selected by other' : 
                      isSelected ? 'Selected by you' :
                      'Available'
                    }`}
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

        <div className="mt-2">
          <strong>Booked Seats:</strong> {bookedSeats.join(', ') || 'None'}
        </div>

        <div className="mt-6 flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded border"></div> Your Selection
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-400 rounded border"></div> Selected by Others
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded border"></div> Booked
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-white border rounded"></div> Available
          </div>
        </div>

        {logs.length > 0 && (
          <div className="mt-6 bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
            <strong className="block mb-2">Socket Logs:</strong>
            <ul className="list-disc ml-5 text-sm space-y-1">
              {logs.slice(-10).map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  export default SeatGrid;