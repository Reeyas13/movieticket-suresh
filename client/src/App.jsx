import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from './pages/Login';
import AdminLayout from './admin/layout/AdminLayout';
import Dashboard from './admin/Dashboard';
import HallManagement from './admin/pages/halls/HallManagement';
import SeatTypeManagement from './admin/pages/seat-type/SeatTypeManagement';
import SeatManagement from './admin/pages/seats/SeatManagement';
import MovieManagement from './admin/pages/movie/MovieManagement';
import SeatMapView from './admin/pages/SeatMapView';
import ShowTimeManagement from './admin/pages/showtime/ShowTimeManagement';
import LandingLayout from './components/LandingLayout';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import SeatBookingPage from './pages/SeatBookingPage';
import PaymentPage from './pages/PaymentPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <Router>
        <Routes>
          <Route path='' element={<LandingLayout />} >
          
          <Route path='' index element={<HomePage />} />
          <Route path='/movies' index element={<MoviesPage />} />
          <Route path='/movies/:id' index element={<MovieDetailsPage />} />
          <Route path="/show-time/:showtimeid" element={<SeatBookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/my-profile" element={<ProfilePage />} />
</Route>
          <Route path="/login" element={<Login />} />
          <Route path="/cinema" element={<AdminLayout />}>
            <Route path="" index element={<Dashboard />} />
            <Route path="halls" element={<HallManagement />} />
            <Route path="seat-type" element={<SeatTypeManagement />} />
            <Route path="seat" element={<SeatManagement />} />
            <Route path="movie" element={<MovieManagement />} />
            <Route path='seatmap/:hallId' element={<SeatMapView />} />
            <Route path='show-time' element={<ShowTimeManagement />} />
            <Route path="*" element={<>dwla</>} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
