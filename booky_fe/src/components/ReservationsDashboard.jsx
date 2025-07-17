import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { translations } from '../utils/translations';
import LanguageSwitcher from './LanguageSwitcher';
import ReservationsTable from './ReservationsTable';
import QuickStats from './QuickStats';
import SearchBar from './ui/SearchBar';
import DashboardSkeleton from './ui/DashboardSkeleton';
import EmptyState from './ui/EmptyState';
import { CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDeleteModal from './ui/ConfirmDeleteModal';

const API_BASE_URL = '/api'; // Pretpostavka da API ima ovakav base URL

const ReservationsDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('de');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [activeFilter, setActiveFilter] = useState('3w'); // Default filter
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Debounce efekt za pretragu
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Čekaj 500ms nakon prestanka tipkanja

    // Očisti timer ako korisnik nastavi tipkati
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    axios.get('/reservations/', {
      params: { 
        period: activeFilter,
        search: debouncedSearchQuery // Koristi debounced vrijednost
      }
    })
      .then(res => {
        // Sada direktno postavljamo podatke s backenda, bez FE filtriranja
        setReservations(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeFilter, debouncedSearchQuery]); // Re-fetch when filter or debounced search term changes

  const t = translations[lang]?.dashboard || {};

  // VAŽNO: Uklanjamo staro filtriranje na frontendu.
  // Vaš postojeći `filteredReservations` bi trebao biti uklonjen ili promijenjen
  // da jednostavno koristi `reservations` koje dolaze s backenda.
  const filteredReservations = reservations;

  const unapprovedCount = reservations.filter(res => !res.is_approved).length;
  const reservationsTodayCount = reservations.filter(r => {
    const today = new Date().toISOString().slice(0, 10);
    return r.start_time.startsWith(today);
  }).length;

  const reservationsThisWeekCount = reservations.filter(res => {
    const reservationDate = new Date(res.start_time);
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return reservationDate >= startOfWeek && reservationDate <= endOfWeek;
  }).length;

  const handleView = (row) => alert(`${t.view || 'View'} reservation: ${row.full_name}`);
  const handleEdit = (row) => alert(`${t.edit || 'Edit'} reservation: ${row.full_name}`);

  const handleDelete = (reservationId) => {
    setReservationToDelete(reservationId);
    setIsModalOpen(true);
  };

  const handleApprove = (id) => {
    // Optimistic UI update
    const originalReservations = [...reservations];
    setReservations(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r));

    toast.promise(
      axios.patch(`reservations/${id}/`, { is_approved: true }),
      {
        loading: t.approving || 'Approving...',
        success: () => {
          // Opcionalno: Možete potpuno ukloniti rezervaciju iz liste nakon odobrenja
          // setReservations(prev => prev.filter(r => r.id !== id));
          return t.approve_success || 'Reservation approved successfully!';
        },
        error: () => {
          // Vrati na staro ako je došlo do greške
          setReservations(originalReservations);
          return t.approve_error || 'Failed to approve reservation.';
        },
      }
    );
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    try {
      await axios.delete(`reservations/${reservationToDelete}/`);
      setReservations(prev => prev.filter(res => res.id !== reservationToDelete));
      toast.success(t.delete_success || 'Reservation deleted successfully.');
    } catch (error) {
      console.error('Failed to delete reservation:', error);
      toast.error(t.delete_error || 'Failed to delete reservation.');
    } finally {
      setIsModalOpen(false);
      setReservationToDelete(null);
    }
  };

  const FilterButton = ({ filterValue, label }) => (
    <button 
      onClick={() => setActiveFilter(filterValue)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
        activeFilter === filterValue 
        ? 'bg-orange-500 text-white shadow-sm'
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'
      }`}>
      {label}
    </button>
  );

  if (loading && reservations.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="font-sans bg-gray-50 dark:bg-gray-950 min-h-screen w-full flex flex-col items-center pt-8 px-4">
      <div className="flex justify-between items-center max-w-7xl w-full mx-auto mb-5">
        <h2 className="text-2xl font-bold">{t.all_reservations || 'All reservations'}</h2>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>

      <div className="flex items-center space-x-2 p-1 bg-gray-200 dark:bg-gray-900 rounded-lg mb-4">
          <FilterButton filterValue="3w" label={t.filter_upcoming || 'Upcoming (3 weeks)'} />
          <FilterButton filterValue="pending" label={t.filter_pending || 'Pending'} />
          <FilterButton filterValue="all" label={t.filter_all || 'All Upcoming'} />
          <FilterButton filterValue="past" label={t.filter_past || 'Past'} />
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.search_placeholder}
        className="mb-6"
      />

      <QuickStats
        reservationsTodayCount={reservationsTodayCount}
        unapprovedCount={unapprovedCount}
        reservationsThisWeekCount={reservationsThisWeekCount}
        t={t}
      />

      <div className="max-w-7xl w-full mx-auto">
        <ReservationsTable
          title={t.all_reservations || 'All reservations'}
          reservations={filteredReservations}
          labels={t}
          lang={lang}
          onView={handleView}
          onEdit={handleEdit}
          onApprove={handleApprove}
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

      {isModalOpen && reservationToDelete && (
        <ConfirmDeleteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
          title={t.delete_confirm_title || 'Delete Reservation?'}
          message={`${t.delete_confirm_message || 'Are you sure you want to delete the reservation for'} ${reservationToDelete.full_name}?`}
          cancelText={t.cancel_button || 'Cancel'}
          confirmText={t.confirm_delete_button || 'Yes, Delete'}
        />
      )}
    </div>
  );
};

export default ReservationsDashboard;
