import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../axios';

const SeatBookingPage = () => {
  const { showtimeid } = useParams();
  const location = useLocation();
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
  
  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await api.get(`api/frontend/getshowtimesbyid/${showtimeid}`);
        const data = res.data;
        console.log(data)
        // Set state with real data
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
  const processSeats = (seatsData) => {
    if (!seatsData || !Array.isArray(seatsData)) return;
    
    // Process all seats
    const processedSeats = seatsData.map(seat => {
      return {
        id: seat.id.toString(),
        row: seat.row,
        number: seat.number,
        type: seat.seatType.name === 'r' ? 'regular' : 'special',
        status: seat.tickets && seat.tickets.length > 0 ? 'booked' : 'available',
        price: getPrice(seat.seatTypeId),
        seatTypeId: seat.seatTypeId
      };
    });
    
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
    
    setSeatsByRow(groupedByRow);
  };

  // Get price based on seat type from pricing options
  const getPrice = (seatTypeId) => {
    if (!showtime || !showtime.pricingOptions) return 0;
    
    const pricingOption = showtime.pricingOptions.find(
      option => option.seatTypeId === seatTypeId
    );
    
    return pricingOption ? parseFloat(pricingOption.price) : parseFloat(showtime.basePrice);
  };

  // Calculate total price whenever selected seats change
  useEffect(() => {
    let price = 0;
    selectedSeats.forEach(seatId => {
      const seat = seats.find(s => s.id === seatId);
      if (seat) {
        price += seat.price || 0;
      }
    });
    setTotalPrice(price);
  }, [selectedSeats, seats]);

  const handleSeatClick = useCallback((seatId) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'booked') return;

    const newStatus = seat.status === 'available' ? 'selected' : 'available';

    // Update seats
    const updatedSeats = seats.map(s => 
      s.id === seatId ? { ...s, status: newStatus } : s
    );
    setSeats(updatedSeats);

    // Update seatsByRow
    setSeatsByRow(prev => {
      const newSeatsByRow = { ...prev };
      if (newSeatsByRow[seat.row]) {
        newSeatsByRow[seat.row] = newSeatsByRow[seat.row].map(s => 
          s.id === seatId ? { ...s, status: newStatus } : s
        );
      }
      return newSeatsByRow;
    });

    // Update selectedSeats
    if (newStatus === 'selected') {
      setSelectedSeats(prev => [...prev, seatId]);
    } else {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    }
  }, [seats]);

  const handleProceedToPayment = useCallback(() => {
    if (selectedSeats.length === 0) return;

    // Navigate to payment page with real data
    navigate('/payment', { 
      state: { 
        movie,
        showtime,
        hall,
        selectedSeats: selectedSeats.map(id => seats.find(s => s.id === id)),
        totalPrice
      } 
    });
  }, [navigate, selectedSeats, movie, showtime, hall, seats, totalPrice]);

  const handleBackToMovie = () => {
    navigate(`/movie/${movie?.id}`);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          border: '4px solid #F3F4F6', 
          borderTop: '4px solid #F59E0B',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p>Loading seat information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/movies')}
          style={{
            backgroundColor: '#F59E0B',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Back to Movies
        </button>
      </div>
    );
  }

  if (!movie || !showtime || !hall) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <p>Required information is missing. Please try selecting the movie again.</p>
        <button 
          onClick={() => navigate('/movies')}
          style={{
            backgroundColor: '#F59E0B',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer'
          }}
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
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem 1rem' 
    }}>
      <div style={{ 
        marginBottom: '1.5rem' 
      }}>
        <button
          onClick={handleBackToMovie}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#6B7280',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            transition: 'color 0.2s'
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem' }} 
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
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          color: '#1F2937' 
        }}>{movie.title}</h1>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#6B7280' 
          }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem', color: '#F59E0B' }} 
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
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#6B7280' 
          }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem', color: '#F59E0B' }} 
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
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#6B7280' 
          }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem', color: '#F59E0B' }} 
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

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#6B7280' 
          }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem', color: '#F59E0B' }} 
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
            Base Price: Rs. {showtime.basePrice}
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem' 
        }}>
          {/* Screen */}
          <div style={{ 
            backgroundColor: '#E5E7EB', 
            height: '2rem', 
            borderRadius: '0.5rem', 
            marginBottom: '2rem', 
            position: 'relative', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
          }}>
            <div style={{ 
              position: 'absolute', 
              bottom: '-1.5rem', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              color: '#6B7280', 
              fontSize: '0.875rem', 
              whiteSpace: 'nowrap' 
            }}>Screen</div>
          </div>
          
          {/* Seats */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem', 
            alignItems: 'center' 
          }}>
            {Object.entries(seatsByRow).map(([row, rowSeats]) => (
              <div 
                key={row} 
                style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  alignItems: 'center' 
                }}
              >
                <div style={{ 
                  width: '1.5rem', 
                  textAlign: 'center', 
                  fontWeight: '500', 
                  color: '#6B7280' 
                }}>{row}</div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem' 
                }}>
                  {rowSeats.map(seat => (
                    <button 
                      key={seat.id} 
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === 'booked'}
                      style={{ 
                        width: '2.5rem', 
                        height: '2.5rem', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        borderRadius: '0.25rem', 
                        border: 'none', 
                        backgroundColor: 
                          seat.status === 'booked' ? '#9CA3AF' : 
                          seat.status === 'selected' ? '#F59E0B' : 
                          seat.type === 'special' ? '#EDE9FE' : '#F3F4F6',
                        color: 
                          seat.status === 'booked' ? '#F3F4F6' : 
                          seat.status === 'selected' ? 'white' : '#4B5563',
                        cursor: seat.status === 'booked' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem' 
        }}>
          {/* Legend */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            justifyContent: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '1rem', height: '1rem', backgroundColor: '#F3F4F6', borderRadius: '0.25rem', marginRight: '0.5rem' }}></div>
              <span style={{ fontSize: '0.875rem' }}>Regular (Rs. {
                showtime.pricingOptions.find(option => option.seatTypeId === 6)?.price || showtime.basePrice
              })</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '1rem', height: '1rem', backgroundColor: '#EDE9FE', borderRadius: '0.25rem', marginRight: '0.5rem' }}></div>
              <span style={{ fontSize: '0.875rem' }}>Special (Rs. {
                showtime.pricingOptions.find(option => option.seatTypeId === 5)?.price || showtime.basePrice
              })</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '1rem', height: '1rem', backgroundColor: '#F59E0B', borderRadius: '0.25rem', marginRight: '0.5rem' }}></div>
              <span style={{ fontSize: '0.875rem' }}>Selected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '1rem', height: '1rem', backgroundColor: '#9CA3AF', borderRadius: '0.25rem', marginRight: '0.5rem' }}></div>
              <span style={{ fontSize: '0.875rem' }}>Booked</span>
            </div>
          </div>
          
          {/* Booking Summary */}
          <div style={{ 
            backgroundColor: '#F3F4F6', 
            padding: '1.5rem', 
            borderRadius: '0.5rem' 
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem', 
              color: '#1F2937' 
            }}>Booking Summary</h3>
            
            <div style={{ 
              marginBottom: '1rem' 
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem' 
              }}>
                <span style={{ color: '#4B5563' }}>Selected Seats:</span>
                <span style={{ color: '#1F2937' }}>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 'bold' 
              }}>
                <span style={{ color: '#1F2937' }}>Total Price:</span>
                <span style={{ color: '#1F2937' }}>Rs. {totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '0.375rem',
                backgroundColor: selectedSeats.length > 0 ? '#F59E0B' : '#D1D5DB',
                color: selectedSeats.length > 0 ? 'white' : '#6B7280',
                border: 'none',
                cursor: selectedSeats.length > 0 ? 'pointer' : 'not-allowed'
              }}
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