// src/pages/SuccessPage.jsx
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md bg-white shadow-lg rounded-2xl p-10 text-center">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reservierung erfolgreich!</h2>
        <p className="text-gray-600 mb-6">
          Vielen Dank für Ihre Buchung. Wir haben Ihre Anfrage erhalten und werden sie schnellstmöglich bestätigen.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-xl"
        >
          Zurück zur Startseite
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
