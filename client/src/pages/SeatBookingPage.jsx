import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../axios';

const SeatBookingPage = () => {
  const { showtimeid } = useParams();
  const navigate = useNavigate();

  // State variables
  const [loading, setLoading] = useState(true);
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [hall, setHall] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatsByRow, setSeatsByRow] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Add notification helper
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Helper function to update seat status
  const updateSeatStatus = useCallback((seatId, newStatus) => {
    console.log(`Updating seat ${seatId} to ${newStatus}`);
    setSeats((prevSeats) => {
      const updatedSeats = prevSeats.map((seat) =>
        seat.id === seatId ? { ...seat, status: newStatus } : seat
      );
      
      // Update seatsByRow as well
      const newSeatsByRow = {};
      updatedSeats.forEach(seat => {
        if (!newSeatsByRow[seat.row]) {
          newSeatsByRow[seat.row] = [];
        }
        newSeatsByRow[seat.row].push(seat);
      });
      
      // Sort seats in each row by number
      Object.keys(newSeatsByRow).forEach(row => {
        newSeatsByRow[row].sort((a, b) => a.number - b.number);
      });
      
      // Sort rows
      const sortedRows = Object.keys(newSeatsByRow).sort((a, b) => {
        return convertToNumeric(a) - convertToNumeric(b);
      });
      
      const sortedGroupedByRow = {};
      sortedRows.forEach(row => {
        sortedGroupedByRow[row] = newSeatsByRow[row];
      });
      
      setSeatsByRow(sortedGroupedByRow);
      
      return updatedSeats;
    });
  }, []);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await api.get(`api/frontend/getshowtimesbyid/${showtimeid}`);
        const data = res.data;
        console.log('Showtime data:', data); // Debug API response
        setShowtime(data);
        setMovie(data.movie);
        setHall(data.hall);
        processSeats(data.hall.seats);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching showtime data:", err);
        setError("Failed to load showtime information. Please try again.");
        setLoading(false);
      }
    }
    
    fetchData();
  }, [showtimeid]);

  // Process seats and organize them by row
  const processSeats = useCallback((seatsData) => {
    if (!seatsData || !Array.isArray(seatsData)) return;
    
    // Process all seats
    const processedSeats = seatsData.map(seat => {
      const price = getPrice(seat.seatTypeId);
      const status = seat.tickets && seat.tickets.length > 0 ? 'booked' : 'available';
      return {
        id: seat.id.toString(),
        row: seat.row,
        displayRow: convertToNumeric(seat.row),
        number: seat.number,
        type: seat.seatType ? (seat.seatType.name === 'r' ? 'regular' : 'special') : 'regular',
        status,
        price,
        seatTypeId: seat.seatTypeId
      };
    });
    
    console.log('Processed seats:', processedSeats); // Debug processed seats
    setSeats(processedSeats);
    
    // Group seats by row
    const groupedByRow = processedSeats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      
      // Sort seats in each row by number
      acc[seat.row].sort((a, b) => a.number - b.number);
      
      return acc;
    }, {});
    
    // Convert keys to numeric rows for display and sort them
    const sortedRows = Object.keys(groupedByRow).sort((a, b) => {
      return convertToNumeric(a) - convertToNumeric(b);
    });
    
    const sortedGroupedByRow = {};
    sortedRows.forEach(row => {
      sortedGroupedByRow[row] = groupedByRow[row];
    });
    
    setSeatsByRow(sortedGroupedByRow);
  }, [showtime]);

  // Convert alphabetic row to numeric
  const convertToNumeric = useCallback((row) => {
    if (!row) return 1;
    if (!isNaN(row)) return Number(row);
    return row.toUpperCase().charCodeAt(0) - 64;
  }, []);

  // Get price based on seat type
  const getPrice = useCallback((seatTypeId) => {
    if (!showtime || !showtime.pricingOptions) {
      console.warn(`No pricing options available for seatTypeId: ${seatTypeId}, returning default price`);
      return 10.0; // Default price if no pricing options
    }
    
    const pricingOption = showtime.pricingOptions.find(
      option => option.seatTypeId === seatTypeId
    );
    
    const price = pricingOption ? parseFloat(pricingOption.price) : parseFloat(showtime.basePrice || 10.0);
    console.log(`Price for seatTypeId ${seatTypeId}: ${price}`);
    return isNaN(price) ? 10.0 : price; // Fallback to 10.0 if price is NaN
  }, [showtime]);

  // Calculate total price
  useEffect(() => {
    let price = 0;
    selectedSeats.forEach(seatId => {
      const seat = seats.find(s => s.id === seatId);
      if (seat) {
        if (seat.price === 0 || isNaN(seat.price)) {
          console.warn(`Seat ${seatId} has invalid price: ${seat.price}`);
        }
        price += seat.price || 0;
      }
    });
    console.log(`Calculated total price: ${price} for seats: ${selectedSeats.join(', ')}`);
    setTotalPrice(price);
  }, [selectedSeats, seats]);

  // Handle seat selection
  const handleSeatClick = useCallback((seatId) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'booked') return;

    if (seat.price === 0 || isNaN(seat.price)) {
      console.warn(`Seat ${seatId} has invalid price: ${seat.price}`);
      addNotification(`Warning: Seat ${seatId} has no price set`, 'warning');
    }

    if (seat.status === 'available') {
      setSelectedSeats(prev => [...prev, seatId]);
      updateSeatStatus(seatId, 'selected');
      addNotification(`Seat ${seatId} selected`, 'success');
    } else if (seat.status === 'selected') {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
      updateSeatStatus(seatId, 'available');
      addNotification(`Seat ${seatId} deselected`, 'info');
    }
  }, [seats, updateSeatStatus, addNotification]);

  const handleProceedToPayment = useCallback(async () => {
    if (selectedSeats.length === 0) return;

    try {
      // Create booking
      const userId = 1; // Should come from auth context
      const bookingData = {
        userId,
        showtimeId: showtime.id,
        seats: selectedSeats,
        paymentMethod: 'ESEWA'
      };
      
      // Create booking and get payment details
      const response = await api.post('api/frontend/bookings', bookingData);
      const { payment, tickets } = response.data;
      
      // Update seats to booked status
      selectedSeats.forEach(seatId => {
        updateSeatStatus(seatId, 'booked');
      });
      
      // Prepare eSewa parameters
      const esewaParams = {
        amt: totalPrice,
        psc: 0,
        pdc: 0,
        txAmt: 0,
        tAmt: totalPrice,
        pid: payment.id,
        scd: 'EPAYTEST',
        su: `${window.location.origin}/booking-success`,
        fu: `${window.location.origin}/booking-failed`
      };
      
      // Create form to submit to eSewa
      const form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', 'https://uat.esewa.com.np/epay/main');
      form.setAttribute('target', '_blank');
      
      // Add parameters to form
      for (const key in esewaParams) {
        const hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', key);
        hiddenField.setAttribute('value', esewaParams[key]);
        form.appendChild(hiddenField);
      }
      
      document.body.appendChild(form);
      
      // For demo: simulate payment success
      try {
        await api.post(`api/frontend/payments/${payment.id}/complete`, { transactionId: `ESEWA-${Date.now()}` });
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
      
      document.body.removeChild(form);
      
      alert(`Payment successful! Total: Rs. ${totalPrice.toFixed(2)}\nTicket IDs: ${tickets.map(t => t.id).join(', ')}`);
      
      // Navigate to success page
      navigate('/booking-success', { 
        state: { 
          movie,
          showtime,
          tickets,
          payment,
          selectedSeats: selectedSeats.map(id => seats.find(s => s.id === id)),
          totalPrice
        } 
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      addNotification(`Payment failed: ${error.response?.data?.message || 'Server error'}`, 'error');
    }
  }, [navigate, selectedSeats, movie, showtime, seats, totalPrice, updateSeatStatus, addNotification]);

  const handleBackToMovie = () => {
    navigate(`/movie/${movie?.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] flex-col gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-amber-500 rounded-full animate-spin"></div>
        <p>Loading seat information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[50vh] flex-col gap-4">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/movies')}
          className="bg-amber-500 text-white px-4 py-2 rounded-md border-none cursor-pointer"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  if (!movie || !showtime || !hall) {
    return (
      <div className="flex justify-center items-center h-[50vh] flex-col gap-4">
        <p>Required information is missing. Please try selecting the movie again.</p>
        <button 
          onClick={() => navigate('/movies')}
          className="bg-amber-500 text-white px-4 py-2 rounded-md border-none cursor-pointer"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  // Format showtime date and time
  const showtimeDate = new Date(showtime.startTime);
  const formattedDate = showtimeDate.toLocaleDateString();
  const formattedTime = showtimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`px-4 py-2 rounded-md shadow-lg transition-all duration-300 ${
                notification.type === 'error' ? 'bg-red-400 text-white' :
                notification.type === 'warning' ? 'bg-yellow-500 text-white' :
                notification.type === 'success' ? 'bg-green-500 text-white' :
                'bg-blue-500 text-white'
              }`}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleBackToMovie}
          className="flex items-center text-gray-500 bg-transparent border-none cursor-pointer p-0 transition-colors hover:text-gray-700"
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
        </div>
      </div>
      
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          {/* Screen */}
          <div className="bg-gray-200 h-8 rounded-lg mb-8 relative shadow-md">
            <div className="absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 text-gray-500 text-sm whitespace-nowrap">
              Screen
            </div>
          </div>
          
          {/* Seats */}
          <div className="flex flex-col gap-3 items-center">
            {Object.entries(seatsByRow).map(([row, rowSeats]) => (
              <div 
                key={row} 
                className="flex gap-2 items-center"
              >
                <div className="w-6 text-center font-medium text-gray-500">
                  {rowSeats[0]?.displayRow || convertToNumeric(row)}
                </div>
                
                <div className="flex gap-2">
                  {rowSeats.map(seat => (
                    <button 
                      key={seat.id} 
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === 'booked'}
                      className={`
                        w-10 h-10 flex justify-center items-center rounded border-none
                        ${seat.status === 'booked' 
                          ? 'bg-red-400 text-white cursor-not-allowed' 
                          : seat.status === 'selected' 
                            ? 'bg-amber-500 text-white cursor-pointer'
                            : seat.type === 'special' 
                              ? 'bg-purple-100 text-gray-700 cursor-pointer'
                              : 'bg-gray-100 text-gray-700 cursor-pointer'
                        }
                        transition-all duration-200
                      `}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
              <span className="text-sm">
                Regular (Rs. {
                  showtime.pricingOptions?.find(option => option.seatTypeId === 6)?.price || showtime.basePrice || 'N/A'
                })
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-100 rounded mr-2"></div>
              <span className="text-sm">
                Special (Rs. {
                  showtime.pricingOptions?.find(option => option.seatTypeId === 5)?.price || showtime.basePrice || 'N/A'
                })
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
              <span className="text-sm">Booked</span>
            </div>
          </div>
          
          {/* Booking Summary */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Booking Summary</h3>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Selected Seats:</span>
                <span className="text-gray-800">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-800">Total Price:</span>
                <span className="text-gray-800">Rs. {totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              className={`
                w-full py-3 rounded-md border-none
                ${selectedSeats.length > 0
                  ? 'bg-amber-500 text-white cursor-pointer hover:bg-amber-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
                transition-colors duration-200
              `}
              onClick={handleProceedToPayment}
              disabled={selectedSeats.length === 0}
            >
              {selectedSeats.length > 0 ? 'Proceed to Payment' : 'Select at least one seat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBookingPage;