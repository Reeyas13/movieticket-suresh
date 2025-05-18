import React, { useState, useEffect } from 'react';
import api from '../../../axios';
import { toast } from 'react-toastify';

const HallManagement = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHall, setCurrentHall] = useState(null);
  const [formData, setFormData] = useState({ name: '', capacity: '' });

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const response = await api.get('api/hall');
      setHalls(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch halls');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ name: '', capacity: '' });
    setCurrentHall(null);
    setIsModalOpen(true);
  };

  const handleEdit = (hall) => {
    setFormData({ name: hall.name, capacity: hall.capacity.toString() });
    setCurrentHall(hall);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hall?')) {
      try {
        await api.delete(`api/hall/${id}`);
        fetchHalls();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete hall');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: formData.name, capacity: Number(formData.capacity) };
      if (currentHall) {
        await api.put(`api/hall/${currentHall.id}`, payload);
      } else {
        await api.post('api/hall', payload);
      }
      setIsModalOpen(false);
      fetchHalls();
      toast.success('Operation successful');
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="p-6 text-center">Loading halls...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Hall Management</h1>
      <button
        onClick={handleCreate}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create New Hall
      </button>

      <table className="w-full border-collapse mt-2">
        <thead>
          <tr>
            <th className="border px-4 py-2 bg-gray-100">Name</th>
            <th className="border px-4 py-2 bg-gray-100">Capacity</th>
            <th className="border px-4 py-2 bg-gray-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {halls.map((hall, idx) => (
            <tr
              key={hall.id}
              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="border px-4 py-2">{hall.name}</td>
              <td className="border px-4 py-2">{hall.capacity}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(hall)}
                  className="mr-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hall.id)}
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
        <div className="fixed inset-0 backdrop-blur-sm border-gray-200  border-2   bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md min-w-[300px]">
            <h2 className="text-xl font-semibold mb-4">
              {currentHall ? 'Edit Hall' : 'Create Hall'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Capacity:</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full border border-gray-300 p-2 rounded"
                />
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

export default HallManagement;
