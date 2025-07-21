import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
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
import HolidayManager from './HolidayManager';
import { useAuth } from '../context/AuthContext';
import { UserCircle } from 'lucide-react';

const ReservationsDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [holidays, setHolidays] = useState([]); // State for holidays
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [lang, setLang] = useState('de');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [activeFilter, setActiveFilter] = useState('3w'); // Default filter
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [activeView, setActiveView] = useState('reservations'); // 'reservations' or 'holidays'
  const { logout } = useAuth();

  // Debounce efekt za pretragu
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Čekaj 500ms nakon prestanka tipkanja

    // Očisti timer ako korisnik nastavi tipkati
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]); // Ovaj useEffect se pokreće samo kad se promijeni searchQuery

  useEffect(() => {
    const fetchData = async () => {
      // Set loading state based on trigger
      if (!debouncedSearchQuery) {
        setLoading(true); // Full skeleton for initial load and filter changes
      } 

      try {
        const [reservationsResult, holidaysResult] = await Promise.allSettled([
          apiClient.get('/reservations/', { params: { period: activeFilter, search: debouncedSearchQuery, lang } }),
          apiClient.get('/holidays/', { params: { lang } })
        ]);

        if (reservationsResult.status === 'fulfilled') setReservations(reservationsResult.value.data);
        else toast.error('Failed to fetch reservations.');

        if (holidaysResult.status === 'fulfilled') setHolidays(holidaysResult.value.data);
        else toast.error('Failed to fetch holidays.');
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    fetchData();
  }, [activeFilter, debouncedSearchQuery, lang]);

  const t = translations[lang]?.dashboard || {};

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsSearching(true);
  };

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

  const handleDelete = async (reservationId) => {
    try {
      await apiClient.delete(`reservations/${reservationId}/`);
      setReservations(prev => prev.filter(res => res.id !== reservationId));
      toast.success(t.delete_success);
    } catch (error) {
      toast.error(t.delete_error);
      console.error('Failed to delete reservation:', error);
    }
  };

  const handleApprove = (id) => {
    // Optimistic UI update
    const originalReservations = [...reservations];
    setReservations(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r));

    toast.promise(
      apiClient.patch(`reservations/${id}/`, { is_approved: true }),
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
      await apiClient.delete(`reservations/${reservationToDelete}/`);
      setReservations(prev => prev.filter(res => res.id !== reservationToDelete));
      toast.success(t.delete_success);
    } catch (error) {
      toast.error(t.delete_error);
      console.error('Failed to delete reservation:', error);
    } finally {
      setIsModalOpen(false);
      setReservationToDelete(null);
    }
  };

  const FilterButton = ({ filterValue, label }) => (
    <button 
      onClick={() => setActiveFilter(filterValue)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
        activeFilter === filterValue 
        ? 'bg-primary text-neutral-white shadow-sm'
        : 'bg-neutral-white dark:bg-neutral-darker text-neutral dark:text-neutral-medium hover:bg-neutral-light dark:hover:bg-neutral-dark border border-neutral-medium dark:border-neutral-dark'
      }`}>
      {label}
    </button>
  );

  if (loading && reservations.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
  <div className="font-sans bg-neutral-white dark:bg-neutral-even-darker min-h-screen w-full flex flex-col items-center pt-8 px-4">
    <div className="flex justify-between items-center max-w-7xl w-full mx-auto mb-5">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-neutral-darker dark:text-neutral-lightest">
          {activeView === 'reservations' ? (t.all_reservations || 'All reservations') : (t.manage_holidays || 'Manage Holidays')}
          <span className="ml-2"> - SCHMIDICARS</span>
        </h2>
      </div>
      <div className="flex items-center space-x-6"> 
        <LanguageSwitcher lang={lang} setLang={setLang} />
        <button
          onClick={logout}
          title="Logout"
          className="text-neutral hover:text-neutral-darkest dark:text-neutral-medium dark:hover:text-neutral-white focus:outline-none transition-colors"
        >
          <UserCircle size={26} strokeWidth={1.4} />
        </button>
      </div>
    </div>

    {/* Combined Controls Row */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full max-w-7xl mx-auto mb-6 space-y-3 sm:space-y-0">
    {/* MOBILE: dropdown */}
    {activeView === 'reservations' && (
        <div className="w-full sm:hidden">
        <select
            value={activeFilter}
            onChange={e => setActiveFilter(e.target.value)}
            className="w-full border border-neutral-medium dark:border-neutral-dark rounded-md px-3 py-2 text-sm"
        >
            <option value="3w">{t.filter_upcoming || 'Upcoming'}</option>
            <option value="pending">{t.filter_pending || 'Pending'}</option>
            <option value="all">{t.filter_all || 'All'}</option>
            <option value="past">{t.filter_past || 'Past'}</option>
        </select>
        </div>
    )}

    {/* DESKTOP: buttons */}
    <div className="hidden sm:flex items-center space-x-2 p-1 bg-neutral-light dark:bg-neutral-darkest rounded-lg">
        {activeView === 'reservations' && (
        <>
            <FilterButton filterValue="3w" label={t.filter_upcoming} />
            <FilterButton filterValue="pending" label={t.filter_pending} />
            <FilterButton filterValue="all" label={t.filter_all} />
            <FilterButton filterValue="past" label={t.filter_past} />
        </>
        )}
    </div>

    {/* View Switcher */}
    <div className="w-full sm:w-auto flex items-center space-x-2 p-1 bg-neutral-light dark:bg-neutral-darkest rounded-lg">
        <button 
        onClick={() => setActiveView('reservations')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeView === 'reservations'
            ? 'bg-primary text-neutral-white shadow-sm'
            : 'text-neutral-dark dark:text-neutral-medium hover:bg-neutral-light dark:hover:bg-neutral-dark'
        }`}
        >
        {t.reservations_tab}
        </button>
        <button 
        onClick={() => setActiveView('holidays')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeView === 'holidays'
            ? 'bg-primary text-neutral-white shadow-sm'
            : 'text-neutral-dark dark:text-neutral-medium hover:bg-neutral-light dark:hover:bg-neutral-dark'
        }`}
        >
        {t.holidays_tab}
        </button>
    </div>
    </div>

    {/* <div className="flex justify-between items-center w-full max-w-7xl mx-auto mb-6"> */}
      {/* <div>
        {activeView === 'reservations' && (
          <div className="flex items-center space-x-2 p-1 bg-neutral-light dark:bg-neutral-darkest rounded-lg">
            <FilterButton filterValue="3w" label={t.filter_upcoming || 'Upcoming (3 weeks)'} />
            <FilterButton filterValue="pending" label={t.filter_pending || 'Pending'} />
            <FilterButton filterValue="all" label={t.filter_all || 'All Upcoming'} />
            <FilterButton filterValue="past" label={t.filter_past || 'Past'} />
          </div>
        )}
      </div> */}

      {/* View Switcher (Right) */}
      {/* <div className="flex items-center space-x-2 p-1 bg-neutral-light dark:bg-neutral-darkest rounded-lg">
        <button 
          onClick={() => setActiveView('reservations')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${activeView === 'reservations' ? 'bg-primary text-neutral-white shadow-sm' : 'text-neutral-dark dark:text-neutral-medium hover:bg-neutral-light dark:hover:bg-neutral-dark'}`}>
          {t.reservations_tab || 'Reservations'}
        </button>
        <button 
          onClick={() => setActiveView('holidays')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${activeView === 'holidays' ? 'bg-primary text-neutral-white shadow-sm' : 'text-neutral-dark dark:text-neutral-medium hover:bg-neutral-light dark:hover:bg-neutral-dark'}`}>
          {t.holidays_tab || 'Manage Holidays'}
        </button>
      </div> */}
    {/* </div>  */}

    {activeView === 'reservations' ? (
      <div className="max-w-7xl mx-auto w-full">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          placeholder={t.search_placeholder}
          className="mb-6"
          isSearching={isSearching}
        />

        <div className={`transition-opacity duration-300 ${isSearching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <QuickStats
            reservationsTodayCount={reservationsTodayCount}
            unapprovedCount={unapprovedCount}
            reservationsThisWeekCount={reservationsThisWeekCount}
            t={t}
          />

          {reservations.length > 0 ? (
            <ReservationsTable
              reservations={reservations}
              onApprove={handleApprove}
              onDelete={handleDelete}
              onView={handleView}
              onEdit={handleEdit}
              labels={t}
              lang={lang}
            />
          ) : (
            <EmptyState
              Icon={CalendarPlus}
              title={t.no_reservations_title || 'No reservations found'}
              message={t.no_reservations_message || 'There are no reservations matching your criteria.'}
            />
          )}
        </div>
      </div>
    ) : (
      <HolidayManager holidays={holidays} setHolidays={setHolidays} labels={t} lang={lang} />
    )}

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
