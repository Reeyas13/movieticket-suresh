import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../axios';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [movie, setMovie] = useState(null);
  const [showtimeDates, setShowtimeDates] = useState([]);
  const [groupedShowtimes, setGroupedShowtimes] = useState({});
  const [earliestShowtimes, setEarliestShowtimes] = useState({});
  const [loading, setLoading] = useState(true);

  const groupShowtimesByDateAndTheater = (showtimes) => {
    const grouped = {};
    showtimes.forEach((showtime) => {
      const date = new Date(showtime.startTime).toISOString().split('T')[0];
      const theaterId = showtime.hall.filmHall.id;
      if (!grouped[date]) grouped[date] = {};
      if (!grouped[date][theaterId]) {
        grouped[date][theaterId] = {
          theater: showtime.hall.filmHall,
          showtimes: [],
        };
      }
      grouped[date][theaterId].showtimes.push(showtime);
    });
    return grouped;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`api/frontend/movies/${id}`);
        const movieData = res.data;
        setMovie(movieData);

        const now = new Date();
        const futureShowtimes = movieData.showTimes.filter(
          (showtime) => new Date(showtime.startTime) > now
        );
        const grouped = groupShowtimesByDateAndTheater(futureShowtimes);

        const earliestShowtimesTemp = {};
        Object.keys(grouped).forEach((date) => {
          const allShowtimesThatDate = Object.values(grouped[date])
            .flatMap((theater) => theater.showtimes);
          if (allShowtimesThatDate.length > 0) {
            const earliest = allShowtimesThatDate.reduce((earliest, current) =>
              new Date(current.startTime) < new Date(earliest.startTime)
                ? current
                : earliest
            );
            earliestShowtimesTemp[date] = earliest;
          }
        });

        setGroupedShowtimes(grouped);
        setEarliestShowtimes(earliestShowtimesTemp);
        const dates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
        setShowtimeDates(dates);
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleShowtimeSelect = (showtime) => {
    console.log(showtime)

    navigate(`/show-time/${showtime.id}`)
    
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p>Movie not found</p>
      </div>
    );
  }

  const posterUrl = JSON.parse(movie.posterUrl)[0];
  const formattedDuration = formatDuration(movie.duration);
  const formattedReleaseDate = new Date(movie.releaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const imageUrl = import.meta.env.VITE_API_IMAGE + posterUrl;

  return (
    <div>
      {/* Movie Banner */}
      <div style={{ position: 'relative', height: '500px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'fit',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',
            }}
          ></div>
        </div>
        <div style={{ position: 'relative', height: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ padding: '2rem', color: 'white', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{movie.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span>{formattedDuration}</span>
              <span>|</span>
              <span>{movie.genre}</span>
            </div>
            <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>{movie.description}</p>
            <button style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F59E0B', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: '500', border: 'none', cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch Trailer
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <nav style={{ display: 'flex' }}>
            <button style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '500', borderBottom: activeTab === 'details' ? '2px solid #F59E0B' : 'none', color: activeTab === 'details' ? '#F59E0B' : '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setActiveTab('details')}>
              Details
            </button>
            <button style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '500', borderBottom: activeTab === 'showtimes' ? '2px solid #F59E0B' : 'none', color: activeTab === 'showtimes' ? '#F59E0B' : '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setActiveTab('showtimes')}>
              Showtimes
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' }}>Synopsis</h2>
              <p style={{ color: '#4B5563', lineHeight: '1.625' }}>{movie.description}</p>
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1F2937' }}>Cast</h2>
              <ul style={{ color: '#4B5563', lineHeight: '1.625' }}>
                {movie.cast.split(',').map((name, index) => (
                  <li key={index}>{name.trim()}</li>
                ))}
              </ul>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1F2937' }}>Director</h3>
                <p style={{ color: '#4B5563' }}>{movie.director}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1F2937' }}>Genre</h3>
                <p style={{ color: '#4B5563' }}>{movie.genre}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1F2937' }}>Release Date</h3>
                <p style={{ color: '#4B5563' }}>{formattedReleaseDate}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'showtimes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' }}>Available Showtimes</h2>
              {showtimeDates.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
                  {showtimeDates.map((date, index) => {
                    const dateObj = new Date(date);
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    let displayDate;
                    if (dateObj.toDateString() === today.toDateString()) {
                      displayDate = 'Today';
                    } else if (dateObj.toDateString() === tomorrow.toDateString()) {
                      displayDate = 'Tomorrow';
                    } else {
                      displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }

                    const earliestShowtime = earliestShowtimes[date];
                    if (!earliestShowtime) return null;

                    return (
                      <Link
                        to={`/show-time/${earliestShowtime.id}`}
                        key={date}
                        style={{
                          backgroundColor: index === 0 ? '#F3F4F6' : '#FFFFFF',
                          color: '#4B5563',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          border: index === 0 ? 'none' : '1px solid #E5E7EB',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          textDecoration: 'none',
                        }}
                      >
                        {displayDate}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {showtimeDates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {showtimeDates.map((date, dateIndex) => {
                  if (dateIndex > 0) return null;

                  const dateObj = new Date(date);
                  const displayDate = dateObj.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  });

                  return (
                    <div key={date}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: '#1F2937', marginBottom: '1rem' }}>{displayDate}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {Object.entries(groupedShowtimes[date] || {}).map(([theaterId, theaterData]) => (
                          <div key={theaterId} style={{ backgroundColor: '#FFFFFF', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <h4 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1F2937' }}>{theaterData.theater.name}</h4>
                              <span style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500' }}>{theaterData.theater.city}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                              {theaterData.showtimes.map((showtime) => {
                                const startTime = new Date(showtime.startTime);
                                const formattedTime = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                const availableSeats = showtime.hall.capacity - showtime.tickets.length;

                                return (
                                  <button
                                    key={showtime.id}
                                    onClick={() =>
                                      handleShowtimeSelect({
                                        id: showtime.id,
                                        time: formattedTime,
                                        date: date,
                                        theater: showtime.hall.filmHall.name,
                                        hall: showtime.hall.name,
                                        availableSeats: availableSeats,
                                      })
                                    }
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      backgroundColor: '#FFFFFF',
                                      border: '1px solid #E5E7EB',
                                      borderRadius: '0.375rem',
                                      padding: '0.75rem 1rem',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease-in-out',
                                      minWidth: '100px',
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                                      e.currentTarget.style.borderColor = '#D1D5DB';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                                      e.currentTarget.style.borderColor = '#E5E7EB';
                                    }}
                                  >
                                    <div style={{ fontSize: '1rem', fontWeight: '500', color: '#1F2937' }}>{formattedTime}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{showtime.hall.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: availableSeats < 10 ? '#EF4444' : '#10B981' }}>Available: {availableSeats}</div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0', backgroundColor: '#F9FAFB', borderRadius: '0.5rem', color: '#6B7280' }}>
                <p>No showtimes available for this movie. Please check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;