import { useState, useEffect } from 'react';
import api from '../axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_IMAGE;

const ComingSoon = () => {
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch upcoming movies
  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        setLoading(true);
        const response = await api.get('api/frontend/movies/upcoming');
        setUpcomingMovies(response.data);
      } catch (err) {
        console.error('Error fetching upcoming movies:', err);
        setError('Failed to load upcoming movies');
        // Fallback data
        setUpcomingMovies([
          {
            id: 1,
            title: "Deadpool & Wolverine",
            image: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            releaseDate: "July 26, 2024",
            description: "Wade Wilson aka Deadpool teams up with Wolverine in this action-packed adventure."
          },
          {
            id: 2,
            title: "Furiosa: A Mad Max Saga",
            image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            releaseDate: "May 24, 2024",
            description: "The origin story of the powerful warrior Furiosa before she teamed up with Mad Max."
          },
          {
            id: 3,
            title: "Inside Out 2",
            image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            releaseDate: "June 14, 2024",
            description: "Riley enters adolescence as new emotions join her core emotions in Headquarters."
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, []);

  const handleNotifyMe = async (movieId) => {
    try {
      // await api.post('/notifications/subscribe', { movieId });
      alert('You will be notified when this movie is released!');
    } catch (err) {
      console.error('Error subscribing to notifications:', err);
      alert('Failed to sign up for notifications. Please try again.');
    }
  };

  const handleWatchTrailer = (movie) => {
    console.log('Watch trailer for:', movie.title);
    alert(`Trailer for ${movie.title} - Feature coming soon!`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Coming Soon</h2>
          <button className="btn-secondary">View All</button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {upcomingMovies.length > 0 ? (
            upcomingMovies.map(movie => {
              // parse image field (stringified array) and build full URL
              let posterUrl = '';
              try {
                const imgs = JSON.parse(movie.image);
                if (Array.isArray(imgs) && imgs.length > 0) {
                  posterUrl = `${API_URL}${imgs[0]}`;
                }
              } catch {
                // if parsing fails, fall back to raw movie.image
                posterUrl = movie.image;
              }
              // final fallback
              const imgSrc =
                posterUrl ||
                movie.poster ||
                "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
              return (
                <Link to={`/movies/${movie.id}`} key={movie.id} className="card overflow-hidden flex flex-col md:flex-row lg:flex-col">
                  {/* Movie Poster */}
                  <div className="relative w-full md:w-1/3 lg:w-full">
                    <img 
                      src={imgSrc}
                      alt={movie.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
                      }}
                    />
                    <div className="absolute top-0 left-0 bg-accent text-white px-3 py-1 m-3 rounded text-sm font-medium">
                      Coming Soon
                    </div>
                  </div>
                  
                  {/* Movie Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{movie.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {movie.description || movie.synopsis || 'No description available.'}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Release Date: {movie.releaseDate || movie.release_date || 'TBA'}
                      </div>
                      
                      <div className="flex space-x-3">
                        {/* <button 
                          className="btn-primary flex-1"
                          onClick={() => handleNotifyMe(movie.id)}
                        >
                          Get Notified
                        </button> */}
                        <button 
                          className="btn-secondary flex-1"
                          onClick={() => handleWatchTrailer(movie)}
                        >
                          Watch Trailer
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No upcoming movies available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
