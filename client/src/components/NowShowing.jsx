import { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import api from '../axios';

const NowShowing = ({ onMovieSelect }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch now showing movies
  useEffect(() => {
    const fetchNowShowingMovies = async () => {
      try {
        setLoading(true);
        const response = await api.get('api/frontend/movies/now-showing');
        setMovies(response.data);
      } catch (err) {
        console.error('Error fetching now showing movies:', err);
        setError('Failed to load movies');
        // Fallback data
        setMovies([
          {
            id: 1,
            title: "Dune: Part Two",
            image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            rating: 4.8,
            category: "Sci-Fi",
            duration: "2h 46m",
            releaseDate: "March 1, 2024"
          },
          {
            id: 2,
            title: "Oppenheimer",
            image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            rating: 4.7,
            category: "Drama",
            duration: "3h 0m",
            releaseDate: "July 21, 2023"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNowShowingMovies();
  }, []);

  // Fetch movie categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('api/frontend/getmovies/categories');
        setCategories(['All', ...response.data]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Keep default categories if API fails
        setCategories(['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi']);
      }
    };

    fetchCategories();
  }, []);

  const filteredMovies = activeCategory === 'All' 
    ? movies 
    : movies.filter(movie => movie.category === activeCategory);

  if (loading) {
    return (
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Now Showing</h2>
          <button className="btn-primary">View All</button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.length > 0 ? (
            filteredMovies.map(movie => (
              <MovieCard 
                key={movie.id}
                movie={movie}
                onClick={() => onMovieSelect(movie)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No movies found for this category.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NowShowing;