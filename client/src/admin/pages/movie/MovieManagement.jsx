import React, { useState, useEffect } from 'react';
import api from '../../../axios';
import { toast } from 'react-toastify';

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [formDataState, setFormDataState] = useState({
    title: '',
    description: '',
    duration: '',
    genre: '',
    releaseDate: '',
    language: '',
    director: '',
    cast: '',
    posterFile: null,
    trailerUrl: ''
  });

  useEffect(() => {
    fetchMovies().finally(() => setLoading(false));
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await api.get('api/movies');
      setMovies(res.data.movies);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch movies');
    }
  };

  const handleCreate = () => {
    setFormDataState({
      title: '', description: '', duration: '', genre: '',
      releaseDate: '', language: '', director: '', cast: '',
      posterFile: null, trailerUrl: ''
    });
    setCurrentMovie(null);
    setIsModalOpen(true);
  };

  const handleEdit = (movie) => {
    setFormDataState({
      title: movie.title,
      description: movie.description,
      duration: movie.duration.toString(),
      genre: movie.genre,
      releaseDate: movie.releaseDate.split('T')[0],
      language: movie.language,
      director: movie.director,
      cast: movie.cast,
      posterFile: null,
      trailerUrl: movie.trailerUrl
    });
    setCurrentMovie(movie);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this movie?')) {
      try {
        await api.delete(`api/movies/${id}`);
        await fetchMovies();
        toast.success('Deleted successfully');
      } catch (err) {
        setError(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'posterFile') {
      setFormDataState(prev => ({ ...prev, posterFile: files[0] }));
    } else {
      setFormDataState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formDataState).forEach(([key, val]) => {
        if (key === 'posterFile') {
          if (val) data.append('posterUrl', val);
        } else {
          data.append(key, val);
        }
      });
      let res;
      if (currentMovie) {
        res = await api.put(`api/movies/${currentMovie.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Updated successfully');
      } else {
        res = await api.post('api/movies', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Created successfully');
      }
      setIsModalOpen(false);
      fetchMovies();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Movie Management</h1>
      <button
        onClick={handleCreate}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Movie
      </button>
      <table className="w-full border-collapse mt-2">
        <thead>
          <tr>
            <th className="border px-4 py-2 bg-gray-100">Title</th>
            <th className="border px-4 py-2 bg-gray-100">Genre</th>
            <th className="border px-4 py-2 bg-gray-100">Release Date</th>
            <th className="border px-4 py-2 bg-gray-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie, idx) => (
            <tr key={movie.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border px-4 py-2">{movie.title}</td>
              <td className="border px-4 py-2">{movie.genre}</td>
              <td className="border px-4 py-2">{new Date(movie.releaseDate).toLocaleDateString()}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(movie)}
                  className="mr-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(movie.id)}
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
          <div className="bg-white p-6 rounded-md w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {currentMovie ? 'Edit Movie' : 'Create Movie'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    name="title"
                    value={formDataState.title}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Genre</label>
                  <input
                    name="genre"
                    value={formDataState.genre}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (min)</label>
                  <input
                    name="duration"
                    type="number"
                    value={formDataState.duration}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Release Date</label>
                  <input
                    name="releaseDate"
                    type="date"
                    value={formDataState.releaseDate}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <input
                    name="language"
                    value={formDataState.language}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Director</label>
                  <input
                    name="director"
                    value={formDataState.director}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Cast</label>
                  <textarea
                    name="cast"
                    value={formDataState.cast}
                    onChange={handleChange}
                    rows={2}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formDataState.description}
                    onChange={handleChange}
                    rows={3}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Poster</label>
                  <input
                    name="posterFile"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Trailer URL</label>
                  <input
                    name="trailerUrl"
                    value={formDataState.trailerUrl}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
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

export default MovieManagement;
