import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';

const MoviesPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'];
  
  const movies = [
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
    },
    {
      id: 3,
      title: "The Batman",
      image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      rating: 4.5,
      category: "Action",
      duration: "2h 56m",
      releaseDate: "March 4, 2022"
    },
    {
      id: 4,
      title: "Barbie",
      image: "https://images.unsplash.com/photo-1595452767427-0905ad9b036d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      rating: 4.2,
      category: "Comedy",
      duration: "1h 54m",
      releaseDate: "July 21, 2023"
    },
    {
      id: 5,
      title: "A Quiet Place: Day One",
      image: "https://images.unsplash.com/photo-1543536448-1e76fc2795bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      rating: 4.3,
      category: "Horror",
      duration: "1h 39m",
      releaseDate: "June 28, 2024"
    },
    {
      id: 6,
      title: "Godzilla x Kong: The New Empire",
      image: "https://images.unsplash.com/photo-1518929458113-44982f09ff3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      rating: 4.1,
      category: "Action",
      duration: "1h 55m",
      releaseDate: "March 29, 2024"
    },
    {
      id: 7,
      title: "Deadpool & Wolverine",
      image: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      rating: 4.6,
      category: "Action",
      duration: "2h 10m",
      releaseDate: "July 26, 2024"
    },
    {
      id: 8,
      title: "Furiosa: A Mad Max Saga",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      rating: 4.4,
      category: "Action",
      duration: "2h 30m",
      releaseDate: "May 24, 2024"
    }
  ];

  const filteredMovies = activeCategory === 'All' 
    ? movies 
    : movies.filter(movie => movie.category === activeCategory);

  const handleMovieSelect = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div style={{
      padding: '4rem 0',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>All Movies</h1>
        </div>
        
        {/* Categories */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {categories.map(category => (
            <button
              key={category}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                backgroundColor: activeCategory === category ? '#F59E0B' : '#ffffff',
                color: activeCategory === category ? '#ffffff' : '#4B5563',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Movies Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredMovies.map(movie => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onClick={() => handleMovieSelect(movie)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoviesPage;
