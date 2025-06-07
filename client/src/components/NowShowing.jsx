import { useState, useEffect } from 'react';

const NowShowing = ({ onMovieSelect }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock API calls for demonstration
  useEffect(() => {
    const fetchNowShowingMovies = async () => {
      try {
        setLoading(true);
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const mockMovies = [
          {
            id: 1,
            title: "Spider-Man: No Way Home",
            category: "Action",
            image: "https://images.unsplash.com/photo-1635863138275-d9b33299886b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            rating: 4.8,
            duration: "2h 28m",
            description: "Peter Parker seeks help from Doctor Strange to forget his identity as Spider-Man."
          },
          {
            id: 2,
            title: "The Batman",
            category: "Action",
            image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            rating: 4.7,
            duration: "2h 56m",
            description: "Batman ventures into Gotham City's underworld when a sadistic killer leaves clues."
          },
          {
            id: 3,
            title: "Turning Red",
            category: "Comedy",
            image: "https://images.unsplash.com/photo-1489599134284-b6d8d6d9c13e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            rating: 4.5,
            duration: "1h 40m",
            description: "A 13-year-old girl named Meilin turns into a giant red panda whenever she gets too excited."
          },
          {
            id: 4,
            title: "Dune",
            category: "Sci-Fi",
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            rating: 4.6,
            duration: "2h 35m",
            description: "Paul Atreides leads nomadic tribes in a revolt against the evil Harkonnen."
          }
        ];
        
        setMovies(mockMovies);
      } catch (err) {
        console.error('Error fetching now showing movies:', err);
        setError('Failed to load movies');
        setMovies([]);
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
        // Mock categories
        setCategories(['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi']);
      } catch (err) {
        console.error('Error fetching categories:', err);
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
      <section className="py-20 bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-slate-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100 rounded-full opacity-30 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full opacity-30 -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Now Showing
            </h2>
            <p className="text-gray-600 text-lg">Catch the latest movies in theaters</p>
          </div>
          <button className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
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
        
        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-12 p-1 bg-white rounded-2xl shadow-lg">
          {categories.map(category => (
            <button
              key={category}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie, index) => (
              <div 
                key={movie.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3 cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onMovieSelect && onMovieSelect(movie)}
              >
                {/* Movie Poster */}
                <div className="relative overflow-hidden h-80">
                  <img 
                    src={movie.image || movie.poster || "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {movie.rating || '4.5'}
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                      <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                      {movie.duration || '2h 30m'}
                    </div>
                  </div>
                </div>
                
                {/* Movie Info */}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {movie.description || movie.synopsis || 'Experience an unforgettable cinematic journey.'}
                  </p>
                  
                  {/* Category Tag */}
                  <div className="flex items-center justify-between">
                    <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {movie.category || 'Drama'}
                    </span>
                    
                    <button className="text-blue-500 hover:text-blue-600 font-semibold text-sm transition-colors">
                      Book Now →
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-10 4h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zm2-10h4v4H7v-4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Movies Available</h3>
              <p className="text-gray-500">No movies found for the selected category. Try another category!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NowShowing;