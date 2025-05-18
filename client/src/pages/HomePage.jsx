import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import NowShowing from '../components/NowShowing';
import ComingSoon from '../components/CommingSoon';
import api from '../axios';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch featured movie
  useEffect(() => {
    const fetchFeaturedMovie = async () => {
      try {
        setLoading(true);
        const response = await api.get('api/frontend/movies/featured');
        setFeaturedMovie(response.data);
      } catch (err) {
        console.error('Error fetching featured movie:', err);
        setError('Failed to load featured movie');
        // Fallback to default movie if API fails
        setFeaturedMovie({
          id: 1,
          title: "Dune: Part Two",
          description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
          image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          rating: 4.8,
          category: "Sci-Fi",
          duration: "2h 46m",
          releaseDate: "March 1, 2024"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMovie();
  }, []);

  const handleMovieSelect = (movie) => {
    navigate(`/movies/${movie.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div>
      {featuredMovie && (
        <Hero 
          featuredMovie={featuredMovie}
          onBookTickets={() => handleMovieSelect(featuredMovie)}
        />
      )}
      <NowShowing onMovieSelect={handleMovieSelect} />
      <ComingSoon />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default HomePage;