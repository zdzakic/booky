import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { translations } from '../utils/translations';
import LanguageSwitcher from './LanguageSwitcher';
import { groupByDay } from '../utils/reservationUtils';
import ReservationsTable from './ReservationsTable';
import QuickStats from './QuickStats';
import SearchBar from './SearchBars';
import DashboardSkeleton from './DashboardSkeleton';
import EmptyState from './EmptyState';
import { CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const ReservationsDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('de');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);

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

  if (loading) return <DashboardSkeleton />;

  // Akcije za dugmad (dodaj kasnije prave funkcije)
  const handleView = (row) => alert(`${t.view || 'View'} reservation: ${row.full_name}`);
  const handleEdit = (row) => alert(`${t.edit || 'Edit'} reservation: ${row.full_name}`);

  const handleDelete = (row) => {
    setReservationToDelete(row);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    try {
      await axios.delete(`/reservations/${reservationToDelete.id}/`);
      setReservations(prev => prev.filter(res => res.id !== reservationToDelete.id));
      toast.success(t.delete_success || 'Reservation deleted successfully.');
    } catch (error) {
      console.error('Failed to delete reservation:', error);
      toast.error(t.delete_error || 'Failed to delete reservation.');
    } finally {
      setIsModalOpen(false);
      setReservationToDelete(null);
    }
  };

  return (
    <div className="font-sans bg-gray-50 dark:bg-gray-950 min-h-screen w-full flex flex-col items-center pt-8 px-4">
      <div className="flex justify-between items-center max-w-7xl w-full mx-auto mb-5">
        <h2 className="text-2xl font-bold">{t.all_reservations || 'All reservations'}</h2>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>

      {/* Search Input */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.search_placeholder}
        className="mb-6"
      />
      {/* Quick Stats Section */}
      <QuickStats
        reservationsTodayCount={reservationsTodayCount}
        totalSlotsToday={totalSlotsToday}
        newClientsToday={newClientsToday}
        t={t}
      />

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

        {filteredReservations.length === 0 && !loading && (
          <EmptyState
            icon={<CalendarPlus className="w-8 h-8 text-gray-400" />}
            title={t.no_reservations_title || 'No Reservations Found'}
            message={searchQuery 
              ? (t.no_reservations_search_message || 'Try adjusting your search query.') 
              : (t.no_reservations_message || 'There are currently no reservations. Why not create one?')}
            buttonText={t.create_new_button || 'Create New Reservation'}
            buttonLink="/"
          />
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title={t.delete_modal_title || 'Delete Reservation'}
        message={t.delete_modal_message || 'Are you sure you want to delete this reservation? This action cannot be undone.'}
      />
    </div>
  );
};

export default ReservationsDashboard;
