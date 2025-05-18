import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ toggleSidebar, isMobile, sidebarCollapsed }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const mobileOptionsRef = useRef(null);
  
  const notifications = [
    { id: 1, text: 'New user registered', time: '5 min ago', icon: 'fas fa-user-plus text-blue-500', path: '/users' },
    { id: 2, text: 'Server overload detected', time: '10 min ago', icon: 'fas fa-exclamation-triangle text-yellow-500', path: '/settings' },
    { id: 3, text: 'New order received', time: '1 hour ago', icon: 'fas fa-shopping-cart text-green-500', path: '/tables/data' },
    { id: 4, text: 'Database backup completed', time: '3 hours ago', icon: 'fas fa-database text-purple-500', path: '/settings' },
  ];
  
  const messages = [
    { id: 1, name: 'John Doe', text: 'When will the new features be ready?', time: '5 min ago', avatar: 'https://randomuser.me/api/portraits/men/41.jpg', path: '/messages/1' },
    { id: 2, name: 'Sarah Smith', text: 'The reports look great!', time: '1 hour ago', avatar: 'https://randomuser.me/api/portraits/women/67.jpg', path: '/messages/2' },
    { id: 3, name: 'Mike Johnson', text: 'Can we schedule a meeting tomorrow?', time: '2 hours ago', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', path: '/messages/3' },
  ];

  // Handle clicks outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setShowMessages(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && isMobile) {
        setShowMobileSearch(false);
      }
      if (mobileOptionsRef.current && !mobileOptionsRef.current.contains(event.target)) {
        setShowMobileOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  const closeAllDropdowns = () => {
    setShowNotifications(false);
    setShowMessages(false);
    setShowUserMenu(false);
    setShowMobileSearch(false);
    setShowMobileOptions(false);
  };

  return (
    <header className="bg-white shadow-md py-2 px-4 flex items-center justify-between fixed w-full z-40 top-0 h-16">
      <div className="flex items-center">
        <button 
          className="text-gray-600 hover:text-gray-800 focus:outline-none mr-3 flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
          onClick={toggleSidebar}
          aria-label={isMobile ? "Show sidebar" : "Toggle sidebar"}
        >
          <i className={`fas ${isMobile ? 'fa-bars' : (sidebarCollapsed ? 'fa-bars' : 'fa-times')}`}></i>
        </button>
        
        {/* Desktop Search */}
        <div className={`relative ${isMobile && !showMobileSearch ? 'hidden' : 'block'}`} ref={searchRef}>
          {isMobile && showMobileSearch && (
            <button 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
              onClick={() => setShowMobileSearch(false)}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
          )}
          <input 
            type="text" 
            placeholder="Search..." 
            className={`border border-gray-300 rounded-md ${isMobile && showMobileSearch ? 'pl-10' : 'pl-10'} pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isMobile && showMobileSearch ? 'w-screen absolute left-0 -ml-4' : 'w-48 md:w-64'}`}
          />
          {(!isMobile || !showMobileSearch) && (
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          )}
        </div>
        
        {/* Mobile Search Toggle */}
        {isMobile && !showMobileSearch && (
          <button 
            className="text-gray-600 hover:text-gray-800 focus:outline-none ml-2 flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
            onClick={() => setShowMobileSearch(true)}
          >
            <i className="fas fa-search"></i>
          </button>
        )}
      </div>
      
      {/* Desktop Options */}
      <div className="hidden md:flex items-center space-x-1 md:space-x-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button 
            className="text-gray-600 hover:text-gray-800 focus:outline-none relative p-2 flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
              setShowUserMenu(false);
            }}
            aria-label="Notifications"
          >
            <i className="fas fa-bell"></i>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notifications.length}
            </span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-50 overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-2 text-sm font-semibold">
                You have {notifications.length} notifications
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(notification => (
                  <Link 
                    key={notification.id}
                    to={notification.path} 
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                    onClick={closeAllDropdowns}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        <i className={notification.icon}></i>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-700">{notification.text}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-200 px-4 py-2 text-center">
                <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-800" onClick={closeAllDropdowns}>
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Messages Dropdown */}
        <div className="relative" ref={messagesRef}>
          <button 
            className="text-gray-600 hover:text-gray-800 focus:outline-none relative p-2 flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            aria-label="Messages"
          >
            <i className="fas fa-envelope"></i>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {messages.length}
            </span>
          </button>
          
          {showMessages && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 overflow-hidden">
              <div className="border-b border-gray-200 px-4 py-2 text-sm font-semibold">
                You have {messages.length} messages
              </div>
              <div className="max-h-64 overflow-y-auto">
                {messages.map(message => (
                  <Link 
                    key={message.id}
                    to={message.path} 
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                    onClick={closeAllDropdowns}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <img 
                          src={message.avatar} 
                          alt={message.name} 
                          className="h-10 w-10 rounded-full"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{message.name}</p>
                        <p className="text-sm text-gray-600 truncate">{message.text}</p>
                        <p className="text-xs text-gray-500">{message.time}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-200 px-4 py-2 text-center">
                <Link to="/messages" className="text-sm text-blue-600 hover:text-blue-800" onClick={closeAllDropdowns}>
                  View all messages
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button 
            className="flex items-center focus:outline-none p-1 rounded-md hover:bg-gray-100"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
              setShowMessages(false);
            }}
            aria-label="User menu"
          >
            <img 
              src="https://randomuser.me/api/portraits/men/1.jpg" 
              alt="Admin User" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">Admin User</span>
            <i className="fas fa-chevron-down ml-1 text-sm text-gray-400 hidden sm:block"></i>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 overflow-hidden">
              <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAllDropdowns}>
                <i className="fas fa-user mr-2"></i> Profile
              </Link>
              <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAllDropdowns}>
                <i className="fas fa-cog mr-2"></i> Settings
              </Link>
              <div className="border-t border-gray-200 my-1"></div>
              <Link to="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAllDropdowns}>
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden" ref={mobileOptionsRef}>
        <button 
          className="text-gray-600 hover:text-gray-800 focus:outline-none flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
          onClick={() => setShowMobileOptions(!showMobileOptions)}
          aria-label="More options"
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>

        {/* Mobile Dropdown Menu */}
        {showMobileOptions && (
          <div className="absolute right-4 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 text-sm border-b border-gray-200">
              <div className="flex items-center">
                <img 
                  src="https://randomuser.me/api/portraits/men/1.jpg" 
                  alt="Admin User" 
                  className="h-8 w-8 rounded-full object-cover mr-2"
                />
                <span className="font-medium text-gray-700">Admin User</span>
              </div>
            </div>
            
            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAllDropdowns}>
              <i className="fas fa-user mr-2"></i> Profile
            </Link>
            
            <div className="border-t border-gray-200 my-1"></div>
            
            <button 
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowMobileOptions(false);
              }}
            >
              <i className="fas fa-bell mr-2"></i> Notifications
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {notifications.length}
              </span>
            </button>
            
            <button 
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setShowMessages(!showMessages);
                setShowMobileOptions(false);
              }}
            >
              <i className="fas fa-envelope mr-2"></i> Messages
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {messages.length}
              </span>
            </button>
            
            <div className="border-t border-gray-200 my-1"></div>
            
            <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAllDropdowns}>
              <i className="fas fa-cog mr-2"></i> Settings
            </Link>
            <Link to="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAllDropdowns}>
              <i className="fas fa-sign-out-alt mr-2"></i> Logout
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
