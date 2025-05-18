import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, PersonOutline, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { login } from '../store/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [credentials, setCredentials] = useState({
    email: 'rohan@example.com',
    password: 'SecurePass123!',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login(credentials));
    console.log(res)
    if (res?.payload?.success ) {
      if(res.payload?.user?.role == 'CINEMA') {
        // toast.error('You are not an admin');
        navigate("/cinema")
        return;
      }
      localStorage.setItem('token', res.payload.token);
      toast.success(res.payload.message || 'Login successful');
      navigate('/admin');
    } else {
      toast.error(res?.payload?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Admin Login</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PersonOutline className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none sm:text-sm"
                placeholder="Email Address"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative flex rounded-lg border border-gray-300 overflow-hidden">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockOutlined className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="flex-grow appearance-none block w-full px-3 py-3 pl-10 border-0 placeholder-gray-500 text-gray-900 focus:outline-none sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="px-3 flex items-center justify-center focus:outline-none hover:bg-gray-50"
              >
                {showPassword ? 
                  <VisibilityOff className="h-5 w-5 text-gray-400" /> : 
                  <Visibility className="h-5 w-5 text-gray-400" />
                }
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 
              border border-transparent text-sm font-medium rounded-md text-white bg-blue-600
              hover:bg-blue-700 focus:outline-none disabled:opacity-70 transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
