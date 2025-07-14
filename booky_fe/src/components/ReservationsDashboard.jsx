import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { translations } from '../utils/translations';
import LanguageSwitcher from './LanguageSwitcher';
import { groupByDay } from '../utils/reservationUtils';
import ReservationsTable from './ReservationsTable';

const ReservationsDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('de');

  useEffect(() => {
    axios.get('/reservations/lists/')
      .then(res => {
        setReservations(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const t = translations[lang]?.dashboard || {};

  // Grupisanje termina po danima
  const { today, future } = groupByDay(reservations);

  if (loading) return <div className="pt-24 text-center text-lg font-semibold text-gray-500">Laden...</div>;

  // Akcije za dugmad (dodaj kasnije prave funkcije)
  const handleView = (row) => alert(`${t.view || 'Pregled'} rezervacije: ${row.full_name}`);
  const handleEdit = (row) => alert(`${t.edit || 'Izmjena'} rezervacije: ${row.full_name}`);
  const handleDelete = (row) => {
    if (window.confirm(t.delete_confirm || 'Obriši ovu rezervaciju?')) {
      alert('Obrisano! (stub)');
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen pt-8 px-2">
      <div className="flex justify-between items-center max-w-7xl w-full mx-auto mb-5">
        <h2 className="text-2xl font-bold">{t.all_reservations || 'Sve rezervacije'}</h2>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>
      <div className="max-w-7xl w-full mx-auto">
        <ReservationsTable
          title={t.today || 'Today'}
          reservations={today}
          labels={t}
          lang={lang}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <ReservationsTable
          title={t.upcoming_days || 'Upcoming Days'}
          reservations={future}
          labels={t}
          lang={lang}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {today.length === 0 && future.length === 0 && (
          <div className="rounded-lg shadow bg-white border p-6 text-center text-gray-400">
            {t.no_reservations || 'No reservations found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsDashboard;
