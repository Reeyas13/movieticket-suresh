import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../axios';
import CheckoutButton from './CheckoutButton';
import { toast } from 'react-toastify';

const SeatBookingPage = () => {
  const { showtimeid } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Socket connection
  const [socket, setSocket] = useState(null);

  // State variables
  const [loading, setLoading] = useState(true);
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [hall, setHall] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatsByRow, setSeatsByRow] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [liveSelectedSeats, setLiveSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('ESEWA');
  const [logs, setLogs] = useState([]);
  // const { isAuthenticated, user } = useSelector((state) => state.auth);
  const currentUser = user;

  // Payment method options
  const paymentMethods = [
    { value: 'ESEWA', label: 'eSewa' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
    { value: 'PAYPAL', label: 'PayPal' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CASH', label: 'Cash' },
  ];

  // Add notification helper
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  // Add log helper
  const addLog = useCallback((msg) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Please log in to book seats.');
      setLoading(false);
      return;
    }

    const newSocket = io('http://localhost:5001', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // Socket event handlers

  if(!currentUser){
    toast.error("Please login first");
    navigate('/login');
  }
  useEffect(() => {
    if (!socket || !user) return;

    socket.on('connect', () => {
      console.log('Connected to socket server:', socket.id);
      addLog('Connected to live seat selection');
      socket.emit('join_showtime', { showtimeId: Number(showtimeid), userId: user.id });
    });

    socket.on('selected_seat', ({ seatId, userId }) => {
      addLog(`Seat ${seatId} selected by user ${userId}`);
      if (userId !== user.id) {
        setLiveSelectedSeats((prev) => [...new Set([...prev, seatId])]);
        addNotification(`Seat ${seatId} was selected by another user`, 'warning');
      }
    });

    socket.on('seat_released', ({ seatId, userId }) => {
      addLog(`Seat ${seatId} released by user ${userId}`);
      setLiveSelectedSeats((prev) => prev.filter((id) => id !== seatId));
      if (userId === user.id) {
        setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
      }
      if (userId !== user.id) {
        addNotification(`Seat ${seatId} is now available`, 'info');
      }
    });

    socket.on('seat_booked', ({ seatId, userId }) => {
      addLog(`Seat ${seatId} booked by user ${userId}`);
      setBookedSeats((prev) => [...new Set([...prev, seatId])]);
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
      setLiveSelectedSeats((prev) => prev.filter((id) => id !== seatId));
      if (userId !== user.id) {
        addNotification(`Seat ${seatId} was booked by another user`, 'error');
      }
    });

    socket.on('seat_selection_error', ({ message, seatId }) => {
      addLog(`Error selecting seat ${seatId}: ${message}`);
      addNotification(`Error: ${message}`, 'error');
      setSelectedSeats((prev) => prev.filter((id) => id !== Number(seatId)));
    });

    socket.on('seat_deselection_error', ({ message, seatId }) => {
      addLog(`Error deselecting seat ${seatId}: ${message}`);
      addNotification(`Error: ${message}`, 'error');
    });

    socket.on('disconnect', () => {
      addLog('Disconnected from live seat selection');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('selected_seat');
      socket.off('seat_released');
      socket.off('seat_booked');
      socket.off('seat_selection_error');
      socket.off('seat_deselection_error');
    };
  }, [socket, user, showtimeid, addNotification, addLog]);

  // Fetch showtime data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await api.get(`api/frontend/getshowtimesbyid/${showtimeid}`);
        const data = res.data;
        setShowtime(data);
        setMovie(data.movie);
        setHall(data.hall);
        processSeats(data.hall.seats);
      } catch (err) {
        console.error('Error fetching showtime data:', err);
        setError('Failed to load showtime information. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showtimeid]);

  // Process seats and organize by row
  const processSeats = useCallback((seatsData) => {
    if (!seatsData || !Array.isArray(seatsData)) return;

    const processedSeats = seatsData.map((seat) => {
      const price = getPrice(seat.seatTypeId);
      const isBooked =
        seat.tickets &&
        seat.tickets.length > 0 &&
        seat.tickets.some((ticket) => ticket.selectionStatus === 'BOOKED');
      return {
        id: seat.id,
        row: seat.row,
        displayRow: convertToNumeric(seat.row),
        number: seat.number,
        type: seat.seatType?.name === 'r' ? 'regular' : 'special',
        status: isBooked ? 'booked' : 'available',
        price,
        seatTypeId: seat.seatTypeId,
      };
    });

    setSeats(processedSeats);
    setBookedSeats(processedSeats.filter((seat) => seat.status === 'booked').map((seat) => seat.id));

    const groupedByRow = processedSeats.reduce((acc, seat) => {
      acc[seat.row] = acc[seat.row] || [];
      acc[seat.row].push(seat);
      return acc;
    }, {});

    Object.keys(groupedByRow).forEach((row) => {
      groupedByRow[row].sort((a, b) => a.number - b.number);
    });

    const sortedRows = Object.keys(groupedByRow).sort(
      (a, b) => convertToNumeric(a) - convertToNumeric(b)
    );
    const sortedGroupedByRow = {};
    sortedRows.forEach((row) => {
      sortedGroupedByRow[row] = groupedByRow[row];
    });

    setSeatsByRow(sortedGroupedByRow);
  }, [showtime]);

  // Convert row to numeric for sorting
  const convertToNumeric = useCallback((row) => {
    if (!row) return 1;
    if (!isNaN(row)) return Number(row);
    return row.toUpperCase().charCodeAt(0) - 64;
  }, []);

  // Get price for seat type
  const getPrice = useCallback(
    (seatTypeId) => {
      if (!showtime?.pricingOptions) return 10.0;
      const pricingOption = showtime.pricingOptions.find((option) => option.seatTypeId === seatTypeId);
      return pricingOption ? parseFloat(pricingOption.price) : parseFloat(showtime.basePrice || 10.0);
    },
    [showtime]
  );

  // Calculate total price
  useEffect(() => {
    const price = selectedSeats.reduce((sum, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return sum + (seat?.price || 0);
    }, 0);
    setTotalPrice(price);
  }, [selectedSeats, seats]);

  // Handle seat click
  const handleSeatClick = useCallback(
    (seatId) => {
      if (!user || !socket) {
        addNotification('Please log in to select seats', 'error');
        return;
      }

      const seat = seats.find((s) => s.id === seatId);
      if (!seat) return;

      if (bookedSeats.includes(seatId)) {
        addNotification('This seat is already booked', 'error');
        return;
      }

      if (liveSelectedSeats.includes(seatId)) {
        addNotification('This seat is currently selected by another user', 'warning');
        return;
      }

      const isSelected = selectedSeats.includes(seatId);
      if (isSelected) {
        setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
        socket.emit('deselect_seat', { seatId, showtimeId: Number(showtimeid), userId: user.id });
        addNotification(`Seat ${seatId} deselected`, 'info');
      } else {
        setSelectedSeats((prev) => [...prev, seatId]);
        socket.emit('selected_seat', { seatId, showtimeId: Number(showtimeid), userId: user.id });
        addNotification(`Seat ${seatId} selected`, 'success');
      }
    },
    [seats, selectedSeats, liveSelectedSeats, bookedSeats, socket, user, showtimeid, addNotification]
  );

  // Handle payment
  const handleProceedToPayment = useCallback(async () => {
    if (selectedSeats.length === 0) {
      addNotification('Please select at least one seat', 'error');
      return;
    }

    if (!user) {
      addNotification('Please log in to proceed with booking', 'error');
      return;
    }

    try {
      const bookingData = {
        userId: user.id,
        showtimeId: Number(showtimeid),
        seats: selectedSeats,
        paymentMethod,
      };

      const response = await api.post('api/frontend/bookings', bookingData);
      const { payment, tickets } = response.data;
console.log({payment,tickets})
      setBookedSeats((prev) => [...new Set([...prev, ...selectedSeats])]);
      setSelectedSeats([]);

      selectedSeats.forEach((seatId) => {
        if (socket) {
          socket.emit('seat_booked', {
            seatId,
            showtimeId: Number(showtimeid),
            userId: user.id,
            status: 'BOOKED',
          });
        }
      });

      const data ={
         amount: payment.amount,
      paymentId: payment.id,
      }
       const responseData = await api.post("/api/payment/initiate", data);
      // console.log({ responseData })
       if (responseData.data.payment_method === "esewa") {
          esewaCall(responseData.data.formData);
        }
     
    } catch (error) {
      console.error('Error processing payment:', error);
      addNotification(`Payment failed: ${error.response?.data?.message || 'Server error'}`, 'error');
      selectedSeats.forEach((seatId) => {
        if (socket) {
          socket.emit('deselect_seat', { seatId, showtimeId: Number(showtimeid), userId: user.id });
        }
      });
      setSelectedSeats([]);
    }
  }, [
    selectedSeats,
    user,
    socket,
    showtimeid,
    paymentMethod,
    totalPrice,
    movie,
    showtime,
    seats,
    navigate,
    addNotification,
  ]);

  // Navigate back to movie page
  const handleBackToMovie = () => {
    navigate(`/movie/${movie?.id}`);
  };
   const  esewaCall = (formData) => {
    console.log(formData);
    const path = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", path);

    for (const key in formData) {
      const hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", formData[key]);
      form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
  };
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] flex-col gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-amber-500 rounded-full animate-spin"></div>
        <p>Loading seat information...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-[50vh] flex-col gap-4">
        <p>{error}</p>
        <button
          onClick={() => navigate('/movies')}
          className="bg-amber-500 text-white px-4 py-2 rounded-md border-none cursor-pointer hover:bg-amber-600"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  // Missing data state
  if (!movie || !showtime || !hall) {
    return (
      <div className="flex justify-center items-center h-[50vh] flex-col gap-4">
        <p>Required information is missing. Please try selecting the movie again.</p>
        <button
          onClick={() => navigate('/movies')}
          className="bg-amber-500 text-white px-4 py-2 rounded-md border-none cursor-pointer hover:bg-amber-600"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  // Format showtime
  const showtimeDate = new Date(showtime.startTime);
  const formattedDate = showtimeDate.toLocaleDateString();
  const formattedTime = showtimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Get seat status and styling
  const getSeatStatus = (seat) => {
    if (bookedSeats.includes(seat.id)) {
      return {
        status: 'booked',
        className: 'bg-red-400 text-white cursor-not-allowed',
        title: `Seat ${seat.row}${seat.number} - Booked`,
      };
    }
    if (selectedSeats.includes(seat.id)) {
      return {
        status: 'selected',
        className: 'bg-green-500 text-white cursor-pointer',
        title: `Seat ${seat.row}${seat.number} - Selected by you`,
      };
    }
    if (liveSelectedSeats.includes(seat.id)) {
      return {
        status: 'live-selected',
        className: 'bg-yellow-400 text-black cursor-not-allowed',
        title: `Seat ${seat.row}${seat.number} - Selected by another user`,
      };
    }
    return {
      status: 'available',
      className:
        seat.type === 'special'
          ? 'bg-purple-100 text-gray-700 cursor-pointer hover:bg-purple-200'
          : 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200',
      title: `Seat ${seat.row}${seat.number} - Available (Rs. ${seat.price.toFixed(2)})`,
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Notifications */}
      <CheckoutButton />
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-2 rounded-md shadow-lg transition-all duration-300 ${
                notification.type === 'error'
                  ? 'bg-red-500 text-white'
                  : notification.type === 'warning'
                  ? 'bg-yellow-500 text-white'
                  : notification.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={handleBackToMovie}
          className="flex items-center text-gray-500 bg-transparent border-none cursor-pointer p-0 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Movie
        </button>
      </div>

      {/* Movie and Showtime Info */}
      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{movie.title}</h1>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formattedDate}
          </div>
          <div className="flex items-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {formattedTime}
          </div>
          <div className="flex items-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            {hall.name} - Capacity: {hall.capacity}
          </div>
          <div className="flex items-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Base Price: Rs. {showtime.basePrice || 'N/A'}
          </div>
          {socket && (
            <div className="flex items-center text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
              Live Selection Active
            </div>
          )}
        </div>
      </div>

      {/* Seat Selection */}
      <div className="flex flex-col gap-8">
        {/* Screen */}
        <div className="bg-gray-200 h-8 rounded-lg mb-8 relative shadow-md">
          <div className="absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 text-gray-500 text-sm whitespace-nowrap">
            Screen
          </div>
        </div>

        {/* Seats */}
        <div className="flex flex-col gap-3 items-center">
          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
            <div key={row} className="flex gap-2 items-center">
              <div className="w-6 text-center font-medium text-gray-500">
                {rowSeats[0]?.displayRow || convertToNumeric(row)}
              </div>
              <div className="flex gap-2">
                {rowSeats.map((seat) => {
                  const seatInfo = getSeatStatus(seat);
                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seatInfo.status === 'booked' || seatInfo.status === 'live-selected'}
                      className={`w-10 h-10 flex justify-center items-center rounded border-none ${seatInfo.className} transition-all duration-200`}
                      title={seatInfo.title}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
            <span className="text-sm">
              Regular (Rs.{' '}
              {showtime.pricingOptions?.find((option) => option.seatTypeId === 6)?.price ||
                showtime.basePrice ||
                'N/A'}
              )
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-100 rounded mr-2"></div>
            <span className="text-sm">
              Special (Rs.{' '}
              {showtime.pricingOptions?.find((option) => option.seatTypeId === 5)?.price ||
                showtime.basePrice ||
                'N/A'}
              )
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Your Selection</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
            <span className="text-sm">Selected by Others</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
            <span className="text-sm">Booked</span>
          </div>
        </div>

        {/* Booking Summary */}
        {selectedSeats.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
            <p>
              Selected Seats:{' '}
              {selectedSeats
                .map((id) => {
                  const seat = seats.find((s) => s.id === id);
                  return seat ? `${seat.row}${seat.number}` : '';
                })
                .join(', ')}
            </p>
            <p>Total Price: Rs. {totalPrice.toFixed(2)}</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleProceedToPayment}
              className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-md border-none cursor-pointer hover:bg-amber-600"
            >
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatBookingPage;