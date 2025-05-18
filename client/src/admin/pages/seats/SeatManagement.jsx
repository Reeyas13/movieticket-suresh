import React, { useState, useEffect } from 'react';
import api from '../../../axios';
import { toast } from 'react-toastify';

const SeatManagement = () => {
  const [seats, setSeats] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSeat, setCurrentSeat] = useState(null);
  const [formData, setFormData] = useState({ row: '', number: '', seatTypeId: '' });

  useEffect(() => {
    Promise.all([fetchSeats(), fetchTypes()]).finally(() => setLoading(false));
  }, []);

  const fetchSeats = async () => {
    try {
      const res = await api.get('api/seat');
      setSeats(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch seats');
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await api.get('api/seat-type');
      setTypes(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch seat types');
    }
  };

  const handleCreate = () => {
    setFormData({ row: '', number: '', seatTypeId: '' });
    setCurrentSeat(null);
    setIsModalOpen(true);
  };

  const handleEdit = (seat) => {
    setFormData({
      row: seat.row,
      number: seat.number.toString(),
      seatTypeId: seat.seatTypeId.toString(),
    });
    setCurrentSeat(seat);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this seat?')) {
      try {
        await api.delete(`api/seat/${id}`);
        await fetchSeats();
        toast.success('Deleted successfully');
      } catch (err) {
        setError(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        row: formData.row,
        number: Number(formData.number),
        seatTypeId: Number(formData.seatTypeId),
      };
      if (currentSeat) {
        await api.put(`api/seat/${currentSeat.id}`, payload);
        toast.success('Updated successfully');
      } else {
        await api.post('api/seat', payload);
        toast.success('Created successfully');
      }
      setIsModalOpen(false);
      fetchSeats();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Seat Management</h1>
      <button
        onClick={handleCreate}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Seat
      </button>

      <table className="w-full border-collapse mt-2">
        <thead>
          <tr>
            <th className="border px-4 py-2 bg-gray-100">Row</th>
            <th className="border px-4 py-2 bg-gray-100">Number</th>
            <th className="border px-4 py-2 bg-gray-100">Type</th>
            <th className="border px-4 py-2 bg-gray-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {seats.map((seat, idx) => (
            <tr key={seat.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border px-4 py-2">{seat.row}</td>
              <td className="border px-4 py-2">{seat.number}</td>
              <td className="border px-4 py-2">{types.find(t => t.id === seat.seatTypeId)?.name || '-'}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(seat)}
                  className="mr-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(seat.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">
              {currentSeat ? 'Edit Seat' : 'Create Seat'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Row</label>
                <input
                  name="row"
                  value={formData.row}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Number</label>
                <input
                  name="number"
                  type="number"
                  value={formData.number}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="seatTypeId"
                  value={formData.seatTypeId}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  <option value="">Select a type</option>
                  {types.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatManagement;
