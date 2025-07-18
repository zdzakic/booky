import React, { useState } from 'react';
import { X } from 'lucide-react';
import DatePickerComponent from '../DatePickerComponent'; 
import { format } from 'date-fns';

const AddHolidayModal = ({ isOpen, onClose, onAdd, lang, labels, holidays }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(null); 
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !date) {
      setError(labels.add_holiday_form_error || 'Please fill out both fields.');
      return;
    }
    const formattedDate = format(date, 'yyyy-MM-dd');
    onAdd({ name, date: formattedDate });
    onClose(); 
    setName('');
    setDate(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{labels.add_holiday_modal_title || 'Add New Holiday'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="holiday-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {labels.holiday_name_label || 'Holiday Name'}
            </label>
            <input
              type="text"
              id="holiday-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder={labels.holiday_name_placeholder || 'e.g., New Year\'s Day'}
            />
          </div>
          <div className="mb-6">
            <DatePickerComponent 
              selectedDate={date}
              setSelectedDate={setDate}
              label={labels.holiday_date_label || 'Date'}
              placeholder={labels.holiday_date_placeholder || 'Select a date'}
              lang={lang}
              holidays={holidays}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
              {labels.cancel_button || 'Cancel'}
            </button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
              {labels.add_button || 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHolidayModal;
