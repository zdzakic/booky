import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Loader from './components/Loader';

// Layouts and Guards
import ProtectedRoute from './components/ProtectedRoute';

// --- LAZY-LOADED PAGES ---
// Replace your static imports with these lazy-loaded versions.
// Adjust the paths if they are different in your project.
const BookingForm = lazy(() => import('./components/BookingForm'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ReservationsDashboard = lazy(() => import('./components/ReservationsDashboard'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginBlockedPage = lazy(() => import('./pages/LoginBlockedPage'));

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Toaster richColors position="top-center" />
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<BookingForm />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/login-blocked" element={<LoginBlockedPage />} />

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
        </Suspense>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;