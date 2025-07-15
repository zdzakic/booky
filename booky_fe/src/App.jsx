import { Toaster } from 'sonner';
import BookingForm from './components/BookingForm';
import SuccessPage from './pages/SuccessPage';
import ReservationsDashboard from './components/ReservationsDashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<BookingForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/dashboard" element={<ReservationsDashboard />} />
      </Routes>
    </main>
  );
}

export default App;
