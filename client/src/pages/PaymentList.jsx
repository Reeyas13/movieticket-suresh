import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Clock, MapPin, User, Filter, Search, Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import api from '../axios';
import { Link } from 'react-router-dom';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: 10,
        ...(filters.status && { status: filters.status })
      });

      const response = await api.get(`/api/payments?${queryParams}`);
      const data   = response.data
      
      if (data.success) {
        setPayments(data.data.payments);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Fallback to empty state
      setPayments([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'FAILED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
              <p className="text-gray-600 mt-1">Manage and track your movie ticket purchases</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
    

        {/* Payments List */}
        <div className="space-y-6">
          {payments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">You haven't made any payments yet.</p>
            </div>
          ) : (
            payments.map((payment) => (
              <Link to={`/history/${payment.id}`} key={payment.id} className="bg-white  hover:cursor-pointer rounded-lg shadow-sm border hover:shadow-xl border transition-shadow">
                <div className="p-6">
                  {/* Payment Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Payment #{payment.id.slice(0, 8)}...
                        </h3>
                        <p className="text-gray-600">{formatDate(payment.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-600">{payment.paymentMethod.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tickets */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Tickets ({payment.tickets.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {payment.tickets.map((ticket) => {

                            const image =import.meta.env.VITE_API_IMAGE +  JSON.parse(ticket.showTime.movie.posterUrl)[0]
                            console.log(image)
                        return <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            {console.log(ticket)}
                            
                            <img
                              src={ image || "/api/placeholder/300/400"}
                              alt={ticket.showTime.movie.title}
                              className="w-16 h-20 rounded object-cover"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/300/400';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 truncate">
                                {ticket.showTime.movie.title}
                              </h5>
                              <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  <span className="truncate">{ticket.seat.hall.filmHall.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  <span>{formatDate(ticket.showTime.startTime)}</span>
                                </div>
                                <div className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  <span>Row {ticket.seat.row}, Seat {ticket.seat.number}</span>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                  {formatCurrency(ticket.price)}
                                </span>
                              
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                      
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <button 
                  className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentList;