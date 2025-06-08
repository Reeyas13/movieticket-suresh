import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutapi } from '../store/slices/authSlice';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const currentUser = user;

  const handleLogout = () => {
    logoutapi();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h18M3 16h18"
              />
            </svg>
            <span className="font-bold text-xl">CineTicket</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-white hover:text-amber-500 transition-colors">Home</Link>
            <Link to="/movies" className="text-white hover:text-amber-500 transition-colors">Movies</Link>
            {/* <a href="#" className="text-white hover:text-amber-500 transition-colors">Theaters</a> */}
            {/* <a href="#" className="text-white hover:text-amber-500 transition-colors">Promotions</a> */}
            {/* <a href="#" className="text-white hover:text-amber-500 transition-colors">About</a> */}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
{/* {console.log(currentUser)} */}
            {currentUser ? (
              <>
                <Link to="/history" className="text-white hover:text-amber-500 transition-colors">
                  My Bookings
                </Link>
                <div className="relative">
                  <Link to="/my-profile" className="flex items-center gap-2 text-white hover:text-amber-500 transition-colors">
                    <span>{currentUser && currentUser?.name.split(' ')[0]}</span>
                    {/* {console.log(currentUser)} */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-amber-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-600 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-amber-500 text-white px-4 py-2 rounded-md font-medium hover:bg-amber-600 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 pb-4 flex flex-col gap-4 md:hidden">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:text-amber-500 transition-colors py-1"
            >
              Home
            </Link>
            <Link
              to="/movies"
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:text-amber-500 transition-colors py-1"
            >
              Movies
            </Link>
            <a href="#" className="text-white hover:text-amber-500 transition-colors py-1">
              Theaters
            </a>
            <a href="#" className="text-white hover:text-amber-500 transition-colors py-1">
              Promotions
            </a>
            <a href="#" className="text-white hover:text-amber-500 transition-colors py-1">
              About
            </a>
            {currentUser ? (
              <>
                <Link
                  to="/my-bookings"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white hover:text-amber-500 transition-colors py-1"
                >
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white hover:text-amber-500 transition-colors py-1"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-200 text-gray-600 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full bg-gray-200 text-gray-600 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full bg-amber-500 text-white px-4 py-2 rounded-md font-medium hover:bg-amber-600 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;