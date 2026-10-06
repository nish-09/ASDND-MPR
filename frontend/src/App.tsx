import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import StaffDashboard from './pages/StaffDashboard';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes without the MainLayout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes wrapped in the MainLayout */}
        <Route element={<MainLayout />}>
          {/* Publicly accessible Home & Booking Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/book/:providerId" element={<BookAppointment />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/my-queue" element={<MyAppointments />} />
          </Route>

          {/* Protected Staff & Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'PROVIDER']} />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/queue" element={<StaffDashboard />} />
            <Route path="/organizer/dashboard" element={<StaffDashboard />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
