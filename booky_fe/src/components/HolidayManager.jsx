import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { translations } from '../utils/translations';
import { toast } from 'sonner';
import { PlusCircle, CalendarX2 } from 'lucide-react';
import HolidaysTable from './HolidaysTable';
import EmptyState from './ui/EmptyState';
import ConfirmDeleteModal from './ui/ConfirmDeleteModal';
import AddHolidayModal from './ui/AddHolidayModal';

const HolidayManager = ({ lang }) => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const t = translations[lang]?.dashboard || {};

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/holidays/');
      const sortedHolidays = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setHolidays(sortedHolidays);
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
      toast.error(t.fetch_holidays_error || 'Failed to fetch holidays.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async (newHoliday) => {
    try {
      await axios.post('/holidays/', newHoliday);
      toast.success(t.add_holiday_success || 'Holiday added successfully.');
      fetchHolidays();
    } catch (error) {
      console.error('Failed to add holiday:', error);
      toast.error(t.add_holiday_error || 'Failed to add holiday.');
    }
  };

  const handleDeleteHoliday = (holiday) => {
    setHolidayToDelete(holiday);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!holidayToDelete) return;
    try {
      await axios.delete(`/holidays/${holidayToDelete.id}/`);
      toast.success(t.delete_holiday_success || 'Holiday deleted successfully.');
      fetchHolidays();
    } catch (error) {
      console.error('Failed to delete holiday:', error);
      toast.error(t.delete_holiday_error || 'Failed to delete holiday.');
    } finally {
      setIsDeleteModalOpen(false);
      setHolidayToDelete(null);
    }
  };

  if (loading) {
    return <div className="text-center p-8">{t.loading || 'Loading...'}</div>;
  }

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t.holiday_list_title || 'Holiday List'}</h3>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200">
          <PlusCircle className="w-5 h-5 mr-2" />
          {t.add_holiday_button || 'Add Holiday'}
        </button>
      </div>

      {holidays.length > 0 ? (
        <HolidaysTable 
          holidays={holidays} 
          labels={t} 
          lang={lang} 
          onDelete={(id) => {
            const holiday = holidays.find(h => h.id === id);
            handleDeleteHoliday(holiday);
          }}
        />
      ) : (
        <EmptyState
          icon={<CalendarX2 className="w-12 h-12 text-gray-400" />}
          title={t.no_holidays_title || 'No Holidays Set'}
          message={t.no_holidays_message || 'You have not set any holidays yet. Add one to block out dates for bookings.'}
        />
      )}

      {isDeleteModalOpen && holidayToDelete && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title={t.delete_holiday_confirm_title || 'Delete Holiday?'}
          message={`${t.delete_holiday_confirm_message || 'Are you sure you want to delete'} ${holidayToDelete.name}?`}
          cancelText={t.cancel_button || 'Cancel'}
          confirmText={t.confirm_delete_button || 'Yes, Delete'}
        />
      )}

      <AddHolidayModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHoliday}
        lang={lang}
        labels={t}
        holidays={holidays}
      />
    </div>
  );
};

export default HolidayManager;
