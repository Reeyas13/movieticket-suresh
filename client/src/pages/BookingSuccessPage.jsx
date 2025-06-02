import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // If no state is passed, redirect to homepage
    if (!location.state) {
      navigate('/');
      return;
    }
    
    setBookingData(location.state);
  }, [location.state, navigate]);

  if (!bookingData) {
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
        <p>Loading booking information...</p>
      </div>
    );
  }

  const { movie, showtime, tickets, payment, selectedSeats, totalPrice } = bookingData;
  
  // Format date and time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem 1rem' 
    }}>
      <div style={{
        backgroundColor: '#F0FDF4',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid #86EFAC',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          backgroundColor: '#22C55E',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>✓</div>
        <div>
          <h2 style={{ margin: '0', color: '#15803D', fontSize: '1.25rem' }}>Booking Successful!</h2>
          <p style={{ margin: '0.5rem 0 0', color: '#166534' }}>Your tickets have been reserved and payment has been processed.</p>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderRadius: '0.5rem', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          backgroundColor: '#F59E0B', 
          padding: '1.5rem', 
          color: 'white' 
        }}>
          <h1 style={{ margin: '0', fontSize: '1.5rem' }}>{movie.title}</h1>
          <p style={{ margin: '0.5rem 0 0', opacity: '0.9' }}>{movie.genre} | {movie.duration} min</p>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Date & Time</h3>
              <p style={{ fontWeight: '500', margin: '0' }}>{formatDate(showtime.startTime)}</p>
              <p style={{ fontWeight: '500', margin: '0.25rem 0 0' }}>{formatTime(showtime.startTime)}</p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Cinema Hall</h3>
              <p style={{ fontWeight: '500', margin: '0' }}>{showtime.hall.filmHall.name}</p>
              <p style={{ fontWeight: '500', margin: '0.25rem 0 0' }}>{showtime.hall.name}</p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Seat(s)</h3>
              <p style={{ fontWeight: '500', margin: '0' }}>
                {selectedSeats.map(seat => `${seat.row}${seat.number}`).join(', ')}
              </p>
            </div>
          </div>
          
          <div style={{ 
            borderTop: '1px solid #E5E7EB', 
            paddingTop: '1.5rem' 
          }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Payment Information</h3>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem' 
            }}>
              <span>Payment ID</span>
              <span>{payment.id}</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem' 
            }}>
              <span>Payment Method</span>
              <span>eSewa</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 'bold',
              borderTop: '1px solid #E5E7EB',
              paddingTop: '0.75rem',
              marginTop: '0.75rem'
            }}>
              <span>Total Amount</span>
              <span>Rs. {totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <div style={{ 
            borderTop: '1px solid #E5E7EB', 
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <Link 
                to="/my-bookings" 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: '#F3F4F6', 
                  borderRadius: '0.375rem', 
                  textDecoration: 'none',
                  color: '#4B5563',
                  fontWeight: '500'
                }}
              >
                View My Bookings
              </Link>
              <Link 
                to="/" 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: '#F59E0B', 
                  borderRadius: '0.375rem', 
                  textDecoration: 'none',
                  color: 'white',
                  fontWeight: '500'
                }}
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
