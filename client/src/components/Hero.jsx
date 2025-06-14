
import { useState } from 'react';

const Hero = ({ featuredMovie, onBookTickets }) => {
  const [imageError, setImageError] = useState(false);
  
  // Use provided featuredMovie or fallback to default if not provided
  const movie = featuredMovie || {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    rating: 4.8,
    releaseDate: "March 1, 2024"
  };

  // Improved image parsing with better error handling
  const getImageUrl = (imageData) => {
    if (!imageData) return "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
    
    // If it's already a valid URL string
    if (typeof imageData === 'string' && (imageData.startsWith('http') || imageData.startsWith('/'))) {
      return imageData;
    }
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const imagePath = parsed[0];
        // Check if we need to prepend API URL
        // if (imagePath.startsWith('/') && typeof import !== 'undefined' && import.meta?.env?.VITE_API_IMAGE) {
         
        // }
         return `${import.meta.env.VITE_API_IMAGE}${imagePath}`;
        // return imagePath;
      }
    } catch (error) {
      console.warn('Failed to parse image data:', error);
    }
    
    // Fallback
    return "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
  };

  const imageUrl = getImageUrl(movie.image);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image Layer with improved positioning */}
      <div className="absolute inset-0">
        <img 
          src={imageError ? "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" : imageUrl}
          alt={movie.title}
          className="w-full h-full object-contain"
          style={{ objectPosition: 'center center' }}
          onError={handleImageError}
          loading="eager"
        />
        {/* Multi-layer overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 lg:px-8 relative min-h-screen flex items-center">
        <div className="max-w-3xl text-white space-y-8 z-10 py-20">
          {/* Featured Badge and Date */}
          <div className="flex items-center space-x-4 animate-fadeInUp">
            <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              ✨ Featured
            </span>
            <span className="text-gray-300 text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
              {movie.releaseDate}
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent animate-fadeInUp delay-100">
            {movie.title}
          </h1>
          
          {/* Rating and Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-lg animate-fadeInUp delay-200">
            <div className="flex items-center bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 ${i < Math.floor(movie.rating) ? 'text-yellow-400' : 'text-gray-400'}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 font-semibold text-white">{movie.rating}</span>
            </div>
            
            <div className="h-6 w-px bg-white/30 hidden sm:block"></div>
            
            <span className="text-gray-300 bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm">
              {movie.duration || "2h 46m"}
            </span>
          </div>
          
          {/* Description */}
          <p className="text-lg md:text-xl leading-relaxed text-gray-200 max-w-2xl animate-fadeInUp delay-300">
            {movie.description}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fadeInUp delay-400">
            <button className="group bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch Trailer
            </button>
            
            <button 
              className="group bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center"
              onClick={onBookTickets}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
              </svg>
              Book Tickets
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
};

// Movie Card Component for upcoming movies


export default Hero;