import React, { useState, useCallback } from 'react';
import axios from '../utils/axios';
import { translations } from '../utils/translations';
import { toast } from 'sonner';
import { PlusCircle, CalendarX2 } from 'lucide-react';
import HolidaysTable from './HolidaysTable';
import EmptyState from './ui/EmptyState';
import ConfirmDeleteModal from './ui/ConfirmDeleteModal';
import AddHolidayModal from './ui/AddHolidayModal';

const HolidayManager = ({ lang, holidays, setHolidays }) => {
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const t = translations[lang]?.dashboard || {};

  const handleAddHoliday = async (newHoliday) => {
    try {
      const response = await axios.post('/holidays/', newHoliday);
      setHolidays(prevHolidays => [...prevHolidays, response.data]);
      toast.success(t.add_holiday_success || 'Holiday added successfully.');
      setIsAddModalOpen(false);
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
      setHolidays(prevHolidays => prevHolidays.filter(h => h.id !== holidayToDelete.id));
      toast.success(t.delete_holiday_success || 'Holiday deleted successfully.');
    } catch (error) {
      console.error('Failed to delete holiday:', error);
      toast.error(t.delete_holiday_error || 'Failed to delete holiday.');
    } finally {
      setIsDeleteModalOpen(false);
      setHolidayToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          {t.add_new_holiday_button || 'Add New Holiday'}
        </button>
      </div>

      {holidays.length > 0 ? (
        <HolidaysTable 
          holidays={holidays} 
          labels={t} 
          lang={lang} 
          onDelete={handleDeleteHoliday} 
        />
      ) : (
        <EmptyState 
          message={t.no_holidays_message || 'No holidays have been set yet.'} 
          buttonText={t.add_holiday_button || 'Add Holiday'}
          onButtonClick={() => setIsAddModalOpen(true)}
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

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title={t.delete_holiday_modal_title || 'Delete Holiday'}
          message={
            t.delete_holiday_modal_message
              ? t.delete_holiday_modal_message.replace('{holidayName}', holidayToDelete?.name)
              : `Are you sure you want to delete ${holidayToDelete?.name}? This action cannot be undone.`
          }
          cancelText={t.cancel_button || 'Cancel'}
          confirmText={t.confirm_delete_button || 'Yes, Delete'}
          lang={lang}
        />
      )}
    </div>
  );
};

export default HolidayManager;
