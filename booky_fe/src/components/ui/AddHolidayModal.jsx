import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import DatePickerComponent from '../DatePickerComponent';
import { useLanguage } from '../../context/LanguageContext';

const AddHolidayModal = ({ isOpen, onClose, onAdd, labels, holidays }) => {
  const { lang } = useLanguage(); 
  const [name, setName] = useState('');
  const [date, setDate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDate(null);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !date) {
      setError(labels.add_holiday_form_error || 'Please fill out both fields.');
      return;
    }
    setError('');
    const formattedDate = format(date, 'yyyy-MM-dd');
    onAdd({ name, date: formattedDate });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-neutral-darker p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-neutral-darkest dark:text-white">{labels.add_holiday_modal_title || 'Add New Holiday'}</h3>
          <button onClick={onClose} className="text-neutral dark:text-neutral-light hover:text-neutral-darkest dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="holiday-name" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light mb-1">
              {labels.holiday_name_label || 'Holiday Name'}
            </label>
            <input
              type="text"
              id="holiday-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-medium rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-neutral-dark dark:border-neutral dark:text-white"
              placeholder={labels.holiday_name_placeholder || 'e.g., New Year\'s Day'}
            />
          </div>
          <div className="mb-6">
            <DatePickerComponent 
              selectedDate={date}
              setSelectedDate={setDate}
              label={labels.holiday_date_label || 'Date'}
              placeholder={labels.holiday_date_placeholder || 'Select a date'}
              holidays={holidays}
            />
          </div>
          {error && <p className="text-error text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-light text-neutral-darkest rounded-md hover:bg-neutral-medium dark:bg-neutral-dark dark:text-neutral-light dark:hover:bg-neutral transition-colors">
              {labels.cancel_button || 'Cancel'}
            </button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
              {labels.add_button || 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHolidayModal;
