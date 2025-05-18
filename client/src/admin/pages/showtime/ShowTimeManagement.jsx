import React, { useState, useEffect } from 'react';
import api from '../../../axios';
import { toast } from 'react-toastify';

const ShowTimeManagement = () => {
  const [showTimes, setShowTimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [formData, setFormData] = useState({
    movieId: '', hallId: '', startTime: '', endTime: '', basePrice: '', pricingOptions: []
  });

  useEffect(() => {
    Promise.all([fetchShowTimes(), fetchMovies(), fetchHalls(), fetchSeatTypes()])
      .finally(() => setLoading(false));
  }, []);

  const fetchShowTimes = async () => {
    try {
      const res = await api.get('api/show-times');
      const data = res.data.data ?? res.data;
      setShowTimes(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch show times');
    }
  };

  const fetchMovies = async () => {
    try {
      const res = await api.get('api/movies');
      const data = res.data.movies ?? res.data;
      setMovies(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch movies');
    }
  };

  const fetchHalls = async () => {
    try {
      const res = await api.get('api/hall');
      const data = res.data.data ?? res.data;
      setHalls(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch halls');
    }
  };

  const fetchSeatTypes = async () => {
    try {
      const res = await api.get('api/seat-type');
      const data = res.data.data ?? res.data;
      setSeatTypes(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch seat types');
    }
  };

  const handleCreate = () => {
    setFormData({
      movieId: '', hallId: '', startTime: '', endTime: '', basePrice: '',
      pricingOptions: seatTypes.map(type => ({ seatTypeId: type.id, price: '' }))
    });
    setCurrent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (st) => {
    setFormData({
      movieId: st.movieId,
      hallId: st.hallId,
      startTime: st.startTime.slice(0,16),
      endTime: st.endTime.slice(0,16),
      basePrice: st.basePrice,
      pricingOptions: st.pricingOptions.map(opt => ({ seatTypeId: opt.seatTypeId, price: opt.price }))
    });
    setCurrent(st);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this show time?')) {
      try {
        await api.delete(`api/show-times/${id}`);
        await fetchShowTimes();
        toast.success('Deleted successfully');
      } catch (err) {
        setError(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  const handleChange = (e, idx) => {
    const { name, value } = e.target;
    if (['movieId','hallId','startTime','endTime','basePrice'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (name === 'price') {
      const newOpts = [...formData.pricingOptions];
      newOpts[idx].price = value;
      setFormData(prev => ({ ...prev, pricingOptions: newOpts }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        movieId: Number(formData.movieId),
        hallId: Number(formData.hallId),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        basePrice: parseFloat(formData.basePrice),
        pricingOptions: formData.pricingOptions.map(o => ({ seatTypeId: o.seatTypeId, price: parseFloat(o.price) }))
      };
      if (current) {
        await api.put(`api/show-times/${current.id}`, payload);
        toast.success('Updated successfully');
      } else {
        await api.post('api/show-times', payload);
        toast.success('Created successfully');
      }
      setIsModalOpen(false);
      fetchShowTimes();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Show Time Management</h1>
      <button
        onClick={handleCreate}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >Add Show Time</button>

      <table className="w-full border-collapse mt-2">
        <thead>
          <tr>
            <th className="border px-4 py-2 bg-gray-100">Movie</th>
            <th className="border px-4 py-2 bg-gray-100">Hall</th>
            <th className="border px-4 py-2 bg-gray-100">Start</th>
            <th className="border px-4 py-2 bg-gray-100">End</th>
            <th className="border px-4 py-2 bg-gray-100">Base Price</th>
            <th className="border px-4 py-2 bg-gray-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {showTimes.map((st, idx) => (
            <tr key={st.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border px-4 py-2">{st.movie.title}</td>
              <td className="border px-4 py-2">{st.hall.name}</td>
              <td className="border px-4 py-2">{new Date(st.startTime).toLocaleString()}</td>
              <td className="border px-4 py-2">{new Date(st.endTime).toLocaleString()}</td>
              <td className="border px-4 py-2">{st.basePrice}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(st)}
                  className="mr-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >Edit</button>
                <button
                  onClick={() => handleDelete(st.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {current ? 'Edit Show Time' : 'Create Show Time'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Movie</label>
                  <select
                    name="movieId"
                    value={formData.movieId}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  >
                    <option value="">Select a movie</option>
                    {movies.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hall</label>
                  <select
                    name="hallId"
                    value={formData.hallId}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  >
                    <option value="">Select a hall</option>
                    {halls.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Base Price</label>
                  <input
                    type="number"
                    step="0.01"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="col-span-2">
                  <h3 className="font-medium mb-2">Pricing Options</h3>
                  {formData.pricingOptions.map((opt, idx) => (
                    <div key={opt.seatTypeId} className="flex items-center mb-2">
                      <span className="w-1/3">{seatTypes.find(t => t.id === opt.seatTypeId)?.name}</span>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={opt.price}
                        onChange={e => handleChange(e, idx)}
                        required
                        className="w-2/3 border border-gray-300 p-2 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2">Save</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowTimeManagement;
