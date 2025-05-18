import { useState } from 'react';
import { Link } from 'react-router-dom';

// Static bookings data
const staticBookings = [
  {
    id: '1',
    Showtime: {
      Movie: {
        title: 'Inception',
        posterUrl: 'https://via.placeholder.com/60x90'
      },
      Screen: {
        Theater: {
          name: 'Cineplex Downtown'
        },
        name: 'Screen 1'
      },
      date: '2023-05-20',
      startTime: '2023-05-20T14:00:00'
    },
    bookingStatus: 'confirmed',
    paymentMethod: 'credit_card',
    totalAmount: 25.00,
    bookingNumber: 'BK001',
    bookingDate: '2023-05-18T10:00:00'
  },
  {
    id: '2',
    Showtime: {
      Movie: {
        title: 'The Matrix',
        posterUrl: 'https://via.placeholder.com/60x90'
      },
      Screen: {
        Theater: {
          name: 'Cineplex Uptown'
        },
        name: 'Screen 2'
      },
      date: '2023-05-21',
      startTime: '2023-05-21T16:00:00'
    },
    bookingStatus: 'cancelled',
    paymentMethod: 'paypal',
    totalAmount: 30.00,
    bookingNumber: 'BK002',
    bookingDate: '2023-05-19T11:00:00'
  },
  {
    id: '3',
    Showtime: {
      Movie: {
        title: 'Avatar',
        posterUrl: 'https://via.placeholder.com/60x90'
      },
      Screen: {
        Theater: {
          name: 'Cineplex Suburb'
        },
        name: 'Screen 3'
      },
      date: '2023-05-22',
      startTime: '2023-05-22T18:00:00'
    },
    bookingStatus: 'confirmed',
    paymentMethod: 'credit_card',
    totalAmount: 15.00,
    bookingNumber: 'BK003',
    bookingDate: '2023-05-20T12:00:00'
  }
];

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState(staticBookings);
  const [activeTab, setActiveTab] = useState('all');
  const [cancelingBookingId, setCancelingBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.bookingStatus === activeTab;
  });

  // Handle booking cancellation
  const handleCancelBooking = (bookingId) => {
    setCancelingBookingId(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = () => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === cancelingBookingId ? { ...booking, bookingStatus: 'cancelled' } : booking
      )
    );
    setShowCancelModal(false);
    setCancelReason('');
    setCancelingBookingId(null);
  };

  // Format date and time
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">My Bookings</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'all' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-600'
          }`}
        >
          All Bookings
        </button>
        <button
          onClick={() => setActiveTab('confirmed')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'confirmed' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-600'
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'cancelled' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-600'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Bookings list */}
      {filteredBookings.length > 0 ? (
        <div className="grid gap-6">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="p-6 rounded-lg shadow-md bg-white">
              {/* Movie and Showtime Info */}
              <div className="flex items-center mb-4">
                <img
                  src={booking.Showtime?.Movie?.posterUrl || 'https://via.placeholder.com/60x90'}
                  alt={booking.Showtime?.Movie?.title}
                  className="w-16 h-24 object-cover rounded mr-4"
                />
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-gray-800">
                    {booking.Showtime?.Movie?.title || 'Movie Title'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {booking.Showtime?.Screen?.Theater?.name || 'Theater Name'},{' '}
                    {booking.Showtime?.Screen?.name || 'Screen'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.Showtime?.date
                      ? new Date(booking.Showtime.date).toLocaleDateString()
                      : 'Date'}
                    ,{' '}
                    {booking.Showtime?.startTime
                      ? new Date(booking.Showtime.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Time'}
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h4 className="text-lg font-semibold mb-2 text-gray-700">Booking Details</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Booking ID:</strong> {booking.bookingNumber}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Booked On:</strong> {formatDateTime(booking.bookingDate)}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Status:</strong>{' '}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.bookingStatus === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.bookingStatus === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Payment:</strong>{' '}
                  {booking.paymentMethod?.replace('_', ' ').toUpperCase() || 'Credit Card'}
                </p>
                <p className="text-lg font-semibold text-gray-800 mt-2">
                  Total: ${parseFloat(booking.totalAmount).toFixed(2)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 mt-4">
                <Link
                  to={`/bookings/${booking.id}`}
                  className="block w-full text-center py-2 px-4 bg-yellow-500 text-white font-semibold rounded"
                >
                  View Details
                </Link>
                {booking.bookingStatus === 'confirmed' &&
                  new Date(booking.Showtime?.startTime) > new Date() && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="block w-full text-center py-2 px-4 border border-red-500 text-red-500 font-semibold rounded"
                    >
                      Cancel Booking
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'all'
              ? "You haven't booked any movie tickets yet."
              : `You don't have any ${activeTab} bookings.`}
          </p>
          <Link
            to="/movies"
            className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded"
          >
            Browse Movies
          </Link>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Cancel Booking</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label htmlFor="cancelReason" className="block mb-2 font-medium text-gray-700">
                Reason for cancellation (optional)
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Please provide a reason for cancellation"
                rows="4"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setCancelingBookingId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded"
              >
                No, Keep Booking
              </button>
              <button
                onClick={confirmCancelBooking}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded"
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;