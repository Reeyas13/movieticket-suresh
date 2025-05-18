import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Static user data
  const staticUser = {
    id: 'user123',
    name: 'John Doe',
    email: 'john.doe@example.com'
  };
  
  // Get booking data from location state
  const { 
    bookingId, 
    movie, 
    showtime, 
    theater, 
    screen, 
    seats, 
    totalPrice, 
    expiresAt 
  } = location.state || {};
  
  const [timeLeft, setTimeLeft] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentError, setPaymentError] = useState(null);
  
  // Handle reservation expiry countdown
  useEffect(() => {
    if (!expiresAt) return;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(expiresAt).getTime();
      return Math.max(0, Math.floor((expiryTime - now) / 1000));
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        navigate('/movies', { state: { message: 'Your seat reservation has expired. Please try again.' } });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [expiresAt, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!cardDetails.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!cardDetails.cardHolder.trim()) {
      newErrors.cardHolder = 'Card holder name is required';
    }
    
    if (!cardDetails.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'Please use MM/YY format';
    }
    
    if (!cardDetails.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Simulate payment processing
      const mockResponse = {
        bookingId,
        confirmationCode: 'ABC123',
        paymentId: 'PAY123',
        paymentDate: new Date().toISOString()
      };
      
      // Generate booking confirmation data
      const confirmationData = {
        bookingId: mockResponse.bookingId,
        confirmationCode: mockResponse.confirmationCode,
        paymentId: mockResponse.paymentId,
        paymentDate: mockResponse.paymentDate,
        movie,
        showtime,
        theater,
        screen,
        seats,
        totalPrice,
        paymentMethod,
        lastFourDigits: cardDetails.cardNumber.slice(-4)
      };
      
      // Navigate to confirmation page
      navigate('/confirmation', { state: { confirmationData } });
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentError('Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };
  
  const formatTimeLeft = () => {
    if (!timeLeft) return '';
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleBackToSeats = () => {
    navigate(`/booking/${movie?.id}`, { 
      state: { 
        showtimeId: showtime?.id,
        movie,
        showtime
      } 
    });
  };
  
  if (!bookingId || !movie || !showtime || !seats || !totalPrice) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <p>Booking information is missing. Please try again.</p>
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

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem 1rem' 
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
        padding: '1.5rem' 
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem', 
          color: '#1F2937' 
        }}>Payment Details</h2>
        
        {timeLeft > 0 && (
          <div style={{
            backgroundColor: '#FEF3C7',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem', color: '#D97706' }} 
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
              <span style={{ fontWeight: '500', color: '#92400E', fontSize: '0.875rem' }}>
                Complete payment before reservation expires:
              </span>
            </div>
            <div style={{ 
              backgroundColor: '#F59E0B', 
              color: 'white', 
              fontWeight: 'bold',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem'
            }}>
              {formatTimeLeft()}
            </div>
          </div>
        )}
        
        {paymentError && (
          <div style={{
            backgroundColor: '#FEF2F2',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            color: '#B91C1C',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem', color: '#EF4444' }} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span>{paymentError}</span>
            </div>
          </div>
        )}
        
        <div style={{ 
          backgroundColor: '#F3F4F6', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem' 
        }}>
          <div style={{ 
            marginBottom: '1rem' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem', 
              color: '#1F2937' 
            }}>{movie.title}</h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem', 
              color: '#6B7280', 
              fontSize: '0.875rem' 
            }}>
              <span>{new Date(showtime.date).toLocaleDateString()} | {showtime.time}</span>
              <span>•</span>
              <span>{theater.name} - {screen.name}</span>
            </div>
          </div>
          
          <div style={{ 
            marginBottom: '1rem' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem' 
            }}>
              <span style={{ 
                color: '#4B5563', 
                fontSize: '0.875rem' 
              }}>Selected Seats:</span>
              <span style={{ 
                color: '#1F2937', 
                fontSize: '0.875rem' 
              }}>{seats.map(seat => seat.id).join(', ')}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 'bold' 
            }}>
              <span style={{ 
                color: '#1F2937' 
              }}>Total Price:</span>
              <span style={{ 
                color: '#1F2937' 
              }}>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div style={{ 
          marginBottom: '1.5rem' 
        }}>
          <h3 style={{ 
            fontWeight: '600', 
            marginBottom: '0.75rem', 
            color: '#1F2937' 
          }}>Payment Method</h3>
          <div style={{ 
            display: 'flex', 
            gap: '1rem' 
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                style={{ marginRight: '0.5rem' }}
              />
              <span>Credit/Debit Card</span>
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={() => setPaymentMethod('paypal')}
                style={{ marginRight: '0.5rem' }}
              />
              <span>PayPal</span>
            </label>
          </div>
        </div>
        
        {paymentMethod === 'card' && (
          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#4B5563', 
                  marginBottom: '0.25rem' 
                }}>
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 1rem', 
                    border: `1px solid ${errors.cardNumber ? '#EF4444' : '#D1D5DB'}`, 
                    borderRadius: '0.375rem', 
                    outline: 'none' 
                  }}
                  maxLength="19"
                />
                {errors.cardNumber && (
                  <p style={{ 
                    color: '#EF4444', 
                    fontSize: '0.75rem', 
                    marginTop: '0.25rem' 
                  }}>{errors.cardNumber}</p>
                )}
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#4B5563', 
                  marginBottom: '0.25rem' 
                }}>
                  Card Holder Name
                </label>
                <input
                  type="text"
                  name="cardHolder"
                  value={cardDetails.cardHolder}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 1rem', 
                    border: `1px solid ${errors.cardHolder ? '#EF4444' : '#D1D5DB'}`, 
                    borderRadius: '0.375rem', 
                    outline: 'none' 
                  }}
                />
                {errors.cardHolder && (
                  <p style={{ 
                    color: '#EF4444', 
                    fontSize: '0.75rem', 
                    marginTop: '0.25rem' 
                  }}>{errors.cardHolder}</p>
                )}
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#4B5563', 
                    marginBottom: '0.25rem' 
                  }}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem 1rem', 
                      border: `1px solid ${errors.expiryDate ? '#EF4444' : '#D1D5DB'}`, 
                      borderRadius: '0.375rem', 
                      outline: 'none' 
                    }}
                    maxLength="5"
                  />
                  {errors.expiryDate && (
                    <p style={{ 
                      color: '#EF4444', 
                      fontSize: '0.75rem', 
                      marginTop: '0.25rem' 
                    }}>{errors.expiryDate}</p>
                  )}
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#4B5563', 
                    marginBottom: '0.25rem' 
                  }}>
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem 1rem', 
                      border: `1px solid ${errors.cvv ? '#EF4444' : '#D1D5DB'}`, 
                      borderRadius: '0.375rem', 
                      outline: 'none' 
                    }}
                    maxLength="4"
                  />
                  {errors.cvv && (
                    <p style={{ 
                      color: '#EF4444', 
                      fontSize: '0.75rem', 
                      marginTop: '0.25rem' 
                    }}>{errors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '2rem' 
            }}>
              <button
                type="button"
                onClick={handleBackToSeats}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  backgroundColor: '#F3F4F6', 
                  color: '#4B5563', 
                  borderRadius: '0.375rem', 
                  fontWeight: '500', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
                disabled={isProcessing}
              >
                Back
              </button>
              <button
                type="submit"
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  backgroundColor: '#F59E0B', 
                  color: 'white', 
                  borderRadius: '0.375rem', 
                  fontWeight: '500', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <svg style={{ 
                      animation: 'spin 1s linear infinite', 
                      marginRight: '0.5rem', 
                      height: '1rem', 
                      width: '1rem' 
                    }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Complete Payment'
                )}
              </button>
            </div>
          </form>
        )}
        
        {paymentMethod === 'paypal' && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem 0' 
          }}>
            <p style={{ 
              marginBottom: '1rem' 
            }}>You will be redirected to PayPal to complete your payment.</p>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '2rem' 
            }}>
              <button
                type="button"
                onClick={handleBackToSeats}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  backgroundColor: '#F3F4F6', 
                  color: '#4B5563', 
                  borderRadius: '0.375rem', 
                  fontWeight: '500', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  backgroundColor: '#F59E0B', 
                  color: 'white', 
                  borderRadius: '0.375rem', 
                  fontWeight: '500', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                Continue to PayPal
              </button>
            </div>
          </div>
        )}
        
        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#6B7280' 
        }}>
          <p style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1rem', width: '1rem', marginRight: '0.25rem' }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure payment processing. Your card details are encrypted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;