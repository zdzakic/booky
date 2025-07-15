import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { translations } from '../utils/translations';
import LanguageSwitcher from './LanguageSwitcher';
import { groupByDay } from '../utils/reservationUtils';
import ReservationsTable from './ReservationsTable';
import QuickStats from './QuickStats';

const ReservationsDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('de');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get('/reservations/lists/')
      .then(res => {
        setReservations(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const t = translations[lang]?.dashboard || {};

  // Filtriranje rezervacija na osnovu pretrage
  const filteredReservations = reservations.filter(res => {
    const query = searchQuery.toLowerCase();
    return (
      res.full_name.toLowerCase().includes(query) ||
      (res.phone && res.phone.toLowerCase().includes(query)) ||
      (res.email && res.email.toLowerCase().includes(query)) ||
      (res.license_plate && res.license_plate.toLowerCase().includes(query))
    );
  });

  // Grupisanje termina po danima
  const { today, future } = groupByDay(filteredReservations);

  // Pronalazak i označavanje sljedeće rezervacije za danas
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // npr. "18:45"
  let nextReservationFound = false;

  const todayWithNext = today.map(res => {
    if (nextReservationFound) return { ...res, isNext: false };

    const earliestSlotTime = res.slots.reduce((earliest, s) => s.start_time < earliest ? s.start_time : earliest, '23:59');

    if (earliestSlotTime > currentTime) {
      nextReservationFound = true;
      return { ...res, isNext: true };
    }
    return { ...res, isNext: false };
  });

  // Izračunavanje statistike za brzi pregled
  const reservationsTodayCount = today.length;
  const totalSlotsToday = today.reduce((acc, res) => acc + res.slots.length, 0);
  const newClientsToday = today.filter(res => !res.is_stored).length;

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

      {/* Search Input */}
      <div className="max-w-7xl w-full mx-auto mb-6">
        <input
          type="text"
          placeholder={t.search_placeholder || 'Search...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quick Stats Section */}
      <QuickStats
        reservationsTodayCount={reservationsTodayCount}
        totalSlotsToday={totalSlotsToday}
        newClientsToday={newClientsToday}
        t={t}
      />
      {/* <div className="max-w-7xl w-full mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-3xl font-bold text-gray-800">{reservationsTodayCount}</h3>
          <p className="text-sm font-medium text-gray-500">{t.reservations_today}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-3xl font-bold text-gray-800">{totalSlotsToday}</h3>
          <p className="text-sm font-medium text-gray-500">{t.total_slots_today}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-3xl font-bold text-gray-800">{newClientsToday}</h3>
          <p className="text-sm font-medium text-gray-500">{t.new_clients_today}</p>
        </div>
      </div> */}


      <div className="max-w-7xl w-full mx-auto">
        <ReservationsTable
          title={t.today || 'Today'}
          reservations={todayWithNext}
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
