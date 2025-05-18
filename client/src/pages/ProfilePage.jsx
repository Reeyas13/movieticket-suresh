import React, { useState } from 'react';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '123-456-7890'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profilePic, setProfilePic] = useState('https://via.placeholder.com/150');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('Profile updated successfully');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setPasswordSuccess('Password changed successfully');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  const handleLogout = () => {
    alert('Logged out');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {isDarkMode ? (
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Personal Information</h2>

          {profileError && (
            <div className="p-3 mb-4 rounded bg-red-100 text-red-700 animate-fade-in">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 mb-4 rounded bg-green-100 text-green-700 animate-fade-in">
              {profileSuccess}
            </div>
          )}

          <div className="mb-6 flex justify-center">
            <div className="relative">
              <img
                src={profilePic}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-amber-500"
              />
              <label
                htmlFor="profilePic"
                className="absolute bottom-0 right-0 p-2 bg-amber-500 rounded-full cursor-pointer hover:bg-amber-600 transition"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17l3-3 3 3" />
                </svg>
                <input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={profileData.name}
                onChange={handleProfileChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                disabled
              />
              <small className="text-gray-500 dark:text-gray-400">Email cannot be changed</small>
            </div>

            <div className="mb-6">
              <label htmlFor="phoneNumber" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={profileData.phoneNumber}
                onChange={handleProfileChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all duration-300 transform hover:scale-105"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Change Password</h2>

          {passwordError && (
            <div className="p-3 mb-4 rounded bg-red-100 text-red-700 animate-fade-in">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 mb-4 rounded bg-green-100 text-green-700 animate-fade-in">
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="newPassword" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all duration-300 transform hover:scale-105 mb-4"
            >
              Change Password
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full p-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;