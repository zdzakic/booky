// src/pages/SuccessPage.jsx
import { CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { translations } from '../utils/translations';

const SuccessPage = () => {
  const location = useLocation();
  const lang = location.state?.lang || 'de';
  const t = translations[lang];
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md bg-white shadow-lg rounded-2xl p-10 text-center">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.successTitle}</h2>
        <p className="text-gray-600 mb-6">
          {t.successMsg}
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-xl"
        >
          {t.backToHome}
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
