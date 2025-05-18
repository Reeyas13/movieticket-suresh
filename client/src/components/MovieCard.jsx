const MovieCard = ({ movie, onClick }) => {
  return (
    <div 
      className="card group cursor-pointer transition-all duration-300 hover:shadow-lg" 
      onClick={onClick}
    >
      {/* Movie Poster */}
      <div className="relative overflow-hidden">
      <img
  src={
    (() => {
      try {
        const parsed = JSON.parse(movie.image);
        const imgPath = Array.isArray(parsed) ? parsed[0] : null;
        console.log(imgPath)
        return imgPath ? `${import.meta.env.VITE_API_URL}${imgPath}` : "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
      } catch {
        return "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
      }
    })()
  }
  alt={movie.title}
  className="w-full h-64 object-cover"
  onError={(e) => {
    e.target.src = "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";
  }}
/>
        
        {/* Overlay with Book Button */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button 
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick();
            }}
          >
            Book Tickets
          </button>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-accent text-white rounded-full px-2 py-1 text-sm font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {movie.rating}
        </div>
      </div>
      
      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{movie.title}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span>{movie.category}</span>
          <span className="mx-2">•</span>
          <span>{movie.duration}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{movie.releaseDate}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-accent cursor-pointer" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
