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

  useEffect(() => {
    axios.get('/reservations/')
      .then(res => {
        setReservations(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const t = translations[lang]?.dashboard || {};

  const filteredReservations = reservations.filter(res => {
    const query = searchQuery.toLowerCase();
    return (
      res.full_name.toLowerCase().includes(query) ||
      (res.phone && res.phone.toLowerCase().includes(query)) ||
      (res.email && res.email.toLowerCase().includes(query)) ||
      (res.license_plate && res.license_plate.toLowerCase().includes(query))
    );
  });

  // Calculate statistics from the original reservations list (before filtering)
  const unapprovedCount = reservations.filter(res => !res.is_approved).length;
  const reservationsTodayCount = reservations.filter(res => {
    const today = new Date().toISOString().slice(0, 10);
    return res.start_time.startsWith(today);
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

  if (loading) return <DashboardSkeleton />;

  const handleView = (row) => alert(`${t.view || 'View'} reservation: ${row.full_name}`);
  const handleEdit = (row) => alert(`${t.edit || 'Edit'} reservation: ${row.full_name}`);

  const handleDelete = (reservationId) => {
    setReservationToDelete(reservationId);
    setIsModalOpen(true);
  };

  const handleApprove = async (reservationId) => {
    try {
      const token = localStorage.getItem('token'); // Pretpostavka da token treba
      await axios.patch(`${API_BASE_URL}/reservations/${reservationId}/`, 
        { is_approved: true },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Azuriraj stanje lokalno za instant feedback
      setReservations(prev => 
        prev.map(res => res.id === reservationId ? { ...res, is_approved: true } : res)
      );
      toast.success(t.approve_success || 'Reservation approved!');
    } catch (error) {
      console.error('Failed to approve reservation:', error);
      toast.error(t.approve_error || 'Failed to approve reservation.');
    }
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    try {
      await axios.delete(`/reservations/${reservationToDelete}/`);
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

  return (
    <div className="font-sans bg-gray-50 dark:bg-gray-950 min-h-screen w-full flex flex-col items-center pt-8 px-4">
      <div className="flex justify-between items-center max-w-7xl w-full mx-auto mb-5">
        <h2 className="text-2xl font-bold">{t.all_reservations || 'All reservations'}</h2>
        <LanguageSwitcher lang={lang} setLang={setLang} />
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
