import { useState } from 'react';

const Hero = ({ featuredMovie, onBookTickets }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use provided featuredMovie or fallback to default if not provided
  const movie = featuredMovie || {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    rating: 4.8,
    releaseDate: "March 1, 2024"
  };
  const imageLink = JSON.parse(movie.image)[0]
  console.log(import.meta.env.VITE_API_IMAGE+imageLink)
// console.log(typeof imageLink[0])
  return (
    <section className="relative h-[80vh] overflow-hidden">
      {/* Background Image with Overlay */}
      {console.log(typeof movie.image)}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.VITE_API_IMAGE+imageLink})`, filter: 'blur(8px)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative h-full flex items-center">
        <div className="max-w-2xl text-white space-y-6">
          <div className="flex items-center space-x-2">
            <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">Featured</span>
            <span className="text-sm font-medium">{featuredMovie.releaseDate}</span>
          </div>
          
          <h1 className="text-5xl font-bold">{movie.title}</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 font-medium">{movie.rating}/5.0</span>
            </div>
            <span>|</span>
            <span className="text-sm">{movie.duration || "2h 46m"}</span>
            <span>|</span>
            <span className="text-sm">PG-13</span>
          </div>
          
          <p className="text-lg">{movie.description}</p>
          
          <div className="flex space-x-4 pt-2">
            <button className="btn-primary flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch Trailer
            </button>
            <button 
              className="btn-secondary flex items-center"
              onClick={onBookTickets}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
              </svg>
              Book Tickets
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mt-8">
           
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
