import BookingForm from './components/BookingForm';
import SuccessPage from './pages/SuccessPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
      <Routes>
        <Route path="/" element={<BookingForm />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </main>
  );
}

export default App;
