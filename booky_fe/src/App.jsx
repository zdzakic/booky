import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';

import BookingForm from './components/BookingForm';
import ReservationsDashboard from './components/ReservationsDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SuccessPage from './pages/SuccessPage';
import LoginBlockedPage from './pages/LoginBlockedPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<BookingForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-blocked" element={<LoginBlockedPage />} />
        <Route path="/success" element={<SuccessPage />} />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ReservationsDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;