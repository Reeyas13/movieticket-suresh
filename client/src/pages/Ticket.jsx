import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  User,
  CreditCard,
  QrCode,
  Film,
} from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../axios";

const Ticket = () => {
  // Mock data based on your JSON response
  const { uuid } = useParams();
  const [ticketDetails, setTicketDetails] = useState({});
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Fetches ticket details based on the uuid in the URL.
   *
   * If the fetch is successful, the ticket details are stored in the
   * ticketDetails state.  If there is an error, the error message is
   */
    async function fetchData() {
      try {
        setLoading(true);
        const res = await api.get(`/api/payments/${uuid}`);
        const data = res.data;
        console.log(data);
        setTicketDetails(data);
      } catch (err) {
        console.error("Error fetching showtime data:", err);
        setError("Failed to load showtime information. Please try again.");
      }finally{
        setLoading(false);
      }
    }
    fetchData();
  }, [uuid]);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading ticket details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-red-500 text-white p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!ticketDetails.success || !ticketDetails.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">No ticket data found</div>
      </div>
    );
  }

  const { data } = ticketDetails;
  const firstTicket = data.tickets[0];
  const movie = firstTicket.showTime.movie;
  const cinema = firstTicket.seat.hall.filmHall;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Movie Tickets</h1>
          <p className="text-blue-200">Booking Confirmation</p>
        </div>

        {/* Payment Status Banner */}
        <div className={`mb-6 p-4 rounded-lg text-center ${
          data.status === 'PENDING' 
            ? 'bg-yellow-500 text-yellow-900' 
            : data.status === 'SUCCESS' 
            ? 'bg-green-500 text-green-900' 
            : 'bg-red-500 text-red'
        }`}>
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            <span className="font-semibold">Payment Status: {data.status}</span>
          </div>
          <p className="text-sm mt-1">Total Amount: NPR {data.amount}</p>
        </div>

        {/* Movie Info Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {(() => {
                try {
                  const image = import.meta.env.VITE_API_IMAGE + JSON.parse(movie.posterUrl)[0];
                  return (
                    <img 
                      src={image} 
                      alt={movie.title}
                      className="w-48 h-72 object-cover rounded-lg shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  );
                } catch (error) {
                  return null;
                }
              })()}
              {/* <div className="w-48 h-72 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg flex items-center justify-center"> */}
                {/* <Film className="w-16 h-16 text-gray-400" /> */}
              {/* </div> */}
            </div>
            <div className="flex-1 text-white">
              <h2 className="text-3xl font-bold mb-3">{movie.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <p><span className="text-blue-300 font-semibold">Genre:</span> {movie.genre}</p>
                  <p><span className="text-blue-300 font-semibold">Duration:</span> {formatDuration(movie.duration)}</p>
                  <p><span className="text-blue-300 font-semibold">Language:</span> {movie.language}</p>
                  <p><span className="text-blue-300 font-semibold">Director:</span> {movie.director}</p>
                </div>
                <div className="space-y-2">
                  <p><span className="text-blue-300 font-semibold">Cast:</span> {movie.cast}</p>
                  <p><span className="text-blue-300 font-semibold">Release Date:</span> {formatDate(movie.releaseDate)}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{movie.description}</p>
            </div>
          </div>
        </div>

        {/* Cinema & Show Details */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Cinema Details
              </h3>
              <div className="space-y-2">
                <p><span className="text-blue-300 font-semibold">Cinema:</span> {cinema.name}</p>
                <p><span className="text-blue-300 font-semibold">Hall:</span> {firstTicket.seat.hall.name}</p>
                <p><span className="text-blue-300 font-semibold">Address:</span> {cinema.address}, {cinema.city}</p>
                <p className="text-gray-300 text-sm">{cinema.description}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Show Details
              </h3>
              <div className="space-y-2">
                <p><span className="text-blue-300 font-semibold">Date:</span> {formatDate(firstTicket.showTime.startTime)}</p>
                <p><span className="text-blue-300 font-semibold">Start Time:</span> {formatTime(firstTicket.showTime.startTime)}</p>
                <p><span className="text-blue-300 font-semibold">End Time:</span> {formatTime(firstTicket.showTime.endTime)}</p>
                <p><span className="text-blue-300 font-semibold">Base Price:</span> NPR {firstTicket.showTime.basePrice}</p>
            </div>
            </div>
          </div>
        </div>

        {/* Individual Tickets */}
        <div className="space-y-4">
          {data.tickets.map((ticket, index) => (
            <div key={ticket.id} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                <h3 className="text-white text-xl font-bold">Ticket #{index + 1}</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Ticket Details */}
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">SEAT</p>
                        <p className="text-2xl font-bold text-gray-800">
                          Row {ticket.seat.row} - Seat {ticket.seat.number}
                        </p>
                        <p className="text-sm text-purple-600 font-semibold">
                          {ticket.seat.seatType.name}
                        </p>
                        <p className="text-xs text-gray-500">{ticket.seat.seatType.description}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">PRICE</p>
                        <p className="text-2xl font-bold text-green-600">NPR {ticket.price}</p>
                        <p className="text-sm text-gray-500">Per ticket</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-semibold">Ticket ID</p>
                          <p className="text-gray-800">{ticket.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-semibold">Status</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            ticket.selectionStatus === 'BOOKED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {ticket.selectionStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="flex flex-col items-center justify-center border-l-2 border-dashed border-gray-300 pl-6">
                    <div className="bg-gray-100 p-4 rounded-lg mb-3">
                      <QrCode className="w-20 h-20 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-600 font-mono text-center break-all">
                      {ticket.qrCode}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Scan at entrance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div>
              <p className="text-blue-300 font-semibold">Name</p>
              <p>{data.user.name}</p>
            </div>
            <div>
              <p className="text-blue-300 font-semibold">Email</p>
              <p>{data.user.email}</p>
            </div>
            <div>
              <p className="text-blue-300 font-semibold">Phone</p>
              <p>{data.user.phone}</p>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl p-6 mt-6 shadow-2xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Number of Tickets:</span>
              <span className="font-semibold">{data.tickets.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-semibold">{data.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Booking ID:</span>
              <span className="font-mono text-xs">{data.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Booking Date:</span>
              <span>{formatDate(data.createdAt)}</span>
            </div>
            <div className="border-t pt-2 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-green-600">NPR {data.amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6 rounded-r-lg">
          <h4 className="font-bold text-yellow-800 mb-2">Important Notes:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Please arrive at least 15 minutes before showtime</li>
            <li>• Present your QR code at the entrance for scanning</li>
            <li>• Outside food and beverages are not allowed</li>
            <li>• Mobile phones should be switched off during the movie</li>
            <li>• Tickets are non-refundable and non-transferable</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Ticket;