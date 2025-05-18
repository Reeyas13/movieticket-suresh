import React, { useState, useEffect } from 'react';
import api from '../../../axios';
import { toast } from 'react-toastify';

const SeatTypeManagement = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await api.get('api/seat-type');
      setTypes(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch seat types');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ name: '', description: '' });
    setCurrentType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (type) => {
    setFormData({ name: type.name, description: type.description });
    setCurrentType(type);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this seat type?')) {
      try {
        await api.delete(`api/seat-type/${id}`);
        fetchTypes();
        toast.success('Deleted successfully');
      } catch (err) {
        setError(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (currentType) {
        await api.put(`api/seat-type/${currentType.id}`, payload);
        toast.success('Updated successfully');
      } else {
        await api.post('api/seat-type', payload);
        toast.success('Created successfully');
      }
      setIsModalOpen(false);
      fetchTypes();
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
      <h1 className="text-2xl font-semibold mb-4">Seat Type Management</h1>
      <button
        onClick={handleCreate}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Seat Type
      </button>

      <table className="w-full border-collapse mt-2">
        <thead>
          <tr>
            <th className="border px-4 py-2 bg-gray-100">Name</th>
            <th className="border px-4 py-2 bg-gray-100">Description</th>
            <th className="border px-4 py-2 bg-gray-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {types.map((type, idx) => (
            <tr key={type.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border px-4 py-2">{type.name}</td>
              <td className="border px-4 py-2">{type.description}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(type)}
                  className="mr-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(type.id)}
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
              {currentType ? 'Edit Seat Type' : 'Create Seat Type'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  required
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

export default SeatTypeManagement;
