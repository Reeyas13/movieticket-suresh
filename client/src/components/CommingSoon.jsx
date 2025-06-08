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
            image: "",
            releaseDate: "July 26, 2024",
            description: "Wade Wilson aka Deadpool teams up with Wolverine in this action-packed adventure."
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, []);

  const handleNotifyMe = async (movieId) => {
    try {
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
      <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent absolute top-0"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-100 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-20 translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-600 text-lg">Get ready for these upcoming blockbusters</p>
          </div>
          <button className="group bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-full font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <span className="flex items-center">
              View All
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-r-lg mb-8 shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {upcomingMovies.length > 0 ? (
            upcomingMovies.map((movie, index) => {
              // Parse image field and build full URL
              let posterUrl = '';
              try {
                const imgs = JSON.parse(movie.image);
                if (Array.isArray(imgs) && imgs.length > 0) {
                  posterUrl = `${API_URL}${imgs[0]}`;
                }
              } catch {
                posterUrl = movie.image;
              }
              
              const imgSrc = posterUrl || movie.poster || "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
              
              return (
                <div 
                  key={movie.id} 
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Movie Poster */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={imgSrc}
                      alt={movie.title}
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Coming Soon Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
                        ✨ Coming Soon
                      </span>
                    </div>

                    {/* Hover Overlay Buttons */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        className="bg-white/90 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-white transition-colors shadow-lg transform hover:scale-105"
                        onClick={() => handleWatchTrailer(movie)}
                      >
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Watch Trailer
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Movie Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                      {movie.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {movie.description || movie.synopsis || 'Get ready for an amazing cinematic experience that will keep you on the edge of your seat.'}
                    </p>
                    
                    {/* Release Date */}
                    <div className="flex items-center text-sm text-gray-500 mb-6 bg-gray-50 px-4 py-3 rounded-lg">
                      <svg className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Release Date: {movie.releaseDate || movie.release_date || 'TBA'}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button 
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                        onClick={() => handleNotifyMe(movie.id)}
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-7a3 3 0 013-3v0a3 3 0 013 3v7h6M4 19H3a1 1 0 01-1-1V6a1 1 0 011-1h18a1 1 0 011 1v12a1 1 0 01-1 1h-1" />
                          </svg>
                          Get Notified
                        </span>
                      </button>
                      
                      <Link 
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                        to={ `/movies/${movie.id}`}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h5a1 1 0 110 2H3a1 1 0 110-2h4zM6 6v12a2 2 0 002 2h8a2 2 0 002-2V6H6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Movies</h3>
              <p className="text-gray-500">Stay tuned for exciting new releases coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;