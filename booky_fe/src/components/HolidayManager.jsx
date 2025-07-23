import React, { useState } from 'react';
import { toast } from 'sonner';
import { PlusCircle, CalendarX2 } from 'lucide-react';
import HolidaysTable from './HolidaysTable';
import EmptyState from './ui/EmptyState';
import ConfirmDeleteModal from './ui/ConfirmDeleteModal';
import AddHolidayModal from './ui/AddHolidayModal';
import apiClient from '../utils/apiClient';

const HolidayManager = ({ holidays, setHolidays, labels, lang }) => {
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddHoliday = async (newHoliday) => {
    try {
      const response = await apiClient.post('/holidays/', newHoliday);
      setHolidays(prevHolidays => [...prevHolidays, response.data]);
      toast.success(labels.add_holiday_success || 'Holiday added successfully.');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add holiday:', error);
      toast.error(labels.add_holiday_error || 'Failed to add holiday.');
    }
  };

  const handleDeleteHoliday = (holiday) => {
    setHolidayToDelete(holiday);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!holidayToDelete) return;
    try {
      await apiClient.delete(`/holidays/${holidayToDelete.id}/`);
      setHolidays(prevHolidays => prevHolidays.filter(h => h.id !== holidayToDelete.id));
      toast.success(labels.delete_holiday_success || 'Holiday deleted successfully.');
    } catch (error) {
      console.error('Failed to delete holiday:', error);
      toast.error(labels.delete_holiday_error || 'Failed to delete holiday.');
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
          className="px-4 py-2 bg-primary text-neutral-white rounded-md hover:bg-primary-dark flex items-center transition-colors"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          {labels.add_new_holiday_button || 'Add New Holiday'}
        </button>
      </div>

      {holidays.length > 0 ? (
        <HolidaysTable 
          holidays={holidays} 
          labels={labels} 
          onDelete={handleDeleteHoliday} 
        />
      ) : (
        <EmptyState
          Icon={CalendarX2}
          title={labels.no_holidays_title || 'No Holidays Found'}
          message={labels.no_holidays_message || 'There are no holidays scheduled yet. You can add one using the button above.'}
        />
      )}

      <AddHolidayModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHoliday}
        labels={labels}
        // holidays={holidays.map(h => h.date)} 
        holidays={holidays}
        lang={lang}
      />

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title={labels.delete_holiday_modal_title || 'Delete Holiday'}
          message={
            labels.delete_holiday_modal_message
              ? labels.delete_holiday_modal_message.replace('{holidayName}', holidayToDelete?.name)
              : `Are you sure you want to delete ${holidayToDelete?.name}? This action cannot be undone.`
          }
          cancelText={labels.cancel_button || 'Cancel'}
          confirmText={labels.confirm_delete_button || 'Yes, Delete'}
        />
      )}
    </div>
  );
};

export default HolidayManager;
