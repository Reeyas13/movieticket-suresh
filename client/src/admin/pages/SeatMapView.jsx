import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../axios';
import { toast } from 'react-toastify';

const SeatMapView = () => {
  const [seats, setSeats] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [hallData, setHallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [mode, setMode] = useState('view'); // 'view', 'select', 'edit'
  const [selectedSeatTypeId, setSelectedSeatTypeId] = useState('');
  
  const { hallId } = useParams();
  
  useEffect(() => {
    Promise.all([
      fetchSeats(),
      fetchSeatTypes(),
      fetchHallData()
    ]).finally(() => setLoading(false));
  }, []);
  
  const fetchSeats = async () => {
    try {
      const res = await api.get('api/seat');
      setSeats(res.data.filter(seat => seat.hallId === Number(hallId)));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch seats');
    }
  };
  
  const fetchSeatTypes = async () => {
    try {
      const res = await api.get('api/seat-type');
      setSeatTypes(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch seat types');
    }
  };
  
  const fetchHallData = async () => {
    try {
      const res = await api.get(`api/hall/${hallId}`);
      setHallData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch hall data');
    }
  };
  
  const handleSeatClick = (seat) => {
    if (mode === 'view') return;
    
    if (mode === 'select') {
      setSelectedSeats(prev => {
        const isSelected = prev.some(s => s.id === seat.id);
        if (isSelected) {
          return prev.filter(s => s.id !== seat.id);
        } else {
          return [...prev, seat];
        }
      });
    } else if (mode === 'edit' && selectedSeatTypeId) {
      updateSeatType(seat.id, Number(selectedSeatTypeId));
    }
  };
  
  const updateSeatType = async (seatId, seatTypeId) => {
    try {
      await api.put(`api/seat/${seatId}`, { seatTypeId });
      toast.success('Seat type updated successfully');
      fetchSeats(); // Refresh seats
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update seat type');
    }
  };
  
  const handleBulkTypeChange = async () => {
    if (!selectedSeatTypeId || selectedSeats.length === 0) {
      toast.error('Please select seat type and seats');
      return;
    }
    
    try {
      // Create an array of promises for updating each seat
      const updatePromises = selectedSeats.map(seat => 
        api.put(`api/seat/${seat.id}`, { seatTypeId: Number(selectedSeatTypeId) })
      );
      
      await Promise.all(updatePromises);
      toast.success(`Updated ${selectedSeats.length} seats`);
      setSelectedSeats([]);
      fetchSeats(); // Refresh seats
    } catch (err) {
      toast.error('Failed to update seats');
    }
  };
  
  const getSeatColor = (seatTypeId) => {
    const seatType = seatTypes.find(type => type.id === seatTypeId);
    
    // Assign colors based on seat type name
    switch(seatType?.name?.toLowerCase()) {
      case 'vip':
        return 'bg-purple-500';
      case 'premium':
        return 'bg-yellow-500';
      case 'standard':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };
  
  const rowLetters = Array.from(new Set(seats.map(seat => seat.row))).sort();
  const maxSeatNumber = Math.max(...seats.map(seat => seat.number), 0);
  
  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Seat Map {hallData ? `- ${hallData.name}` : ''}
      </h1>
      
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setMode('view')}
          className={`px-4 py-2 rounded ${mode === 'view' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          View Mode
        </button>
        <button
          onClick={() => {
            setMode('select');
            setSelectedSeats([]);
          }}
          className={`px-4 py-2 rounded ${mode === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Select Mode
        </button>
        <button
          onClick={() => setMode('edit')}
          className={`px-4 py-2 rounded ${mode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Edit Mode
        </button>
      </div>
      
      {mode !== 'view' && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <div className="flex items-center">
            <select
              value={selectedSeatTypeId}
              onChange={(e) => setSelectedSeatTypeId(e.target.value)}
              className="mr-4 border rounded px-2 py-1"
            >
              <option value="">Select seat type</option>
              {seatTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            
            {mode === 'select' && (
              <button
                onClick={handleBulkTypeChange}
                disabled={!selectedSeatTypeId || selectedSeats.length === 0}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
              >
                Update {selectedSeats.length} selected seats
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="mb-8 flex flex-col">
        <div className="mb-4 flex justify-center">
          <div className="w-1/2 h-8 bg-gray-800 rounded-t-lg flex items-center justify-center text-white">
            Screen
          </div>
        </div>
        
        <div className="mt-8">
          {rowLetters.map((row, rowIndex) => (
            <div key={row} className="flex justify-center mb-2">
              <div className="w-8 flex items-center justify-center font-bold">
                {row}
              </div>
              <div className="flex space-x-2">
                {[...Array(maxSeatNumber)].map((_, colIndex) => {
                  const seatNumber = colIndex + 1;
                  const seat = seats.find(s => s.row === row && s.number === seatNumber);
                  
                  if (!seat) {
                    // Empty space
                    return <div key={`${row}-${seatNumber}`} className="w-8 h-8"></div>;
                  }
                  
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  const seatType = seatTypes.find(type => type.id === seat.seatTypeId);
                  
                  return (
                    <div
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      className={`w-8 h-8 rounded-t-lg cursor-pointer flex items-center justify-center text-xs font-medium
                        ${getSeatColor(seat.seatTypeId)}
                        ${isSelected ? 'ring-2 ring-white' : ''}
                        hover:opacity-80 transition-opacity`}
                      title={`${row}${seatNumber} - ${seatType?.name || 'Unknown'}`}
                    >
                      {seatNumber}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Seat Types</h3>
        <div className="flex space-x-4">
          {seatTypes.map(type => (
            <div key={type.id} className="flex items-center">
              <div className={`w-4 h-4 rounded mr-2 ${getSeatColor(type.id)}`}></div>
              <span>{type.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatMapView;