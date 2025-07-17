import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { translations } from '../utils/translations';
import { toast } from 'sonner';
import { Calendar, Trash2, PlusCircle } from 'lucide-react';

const HolidayManager = ({ lang }) => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = translations[lang]?.dashboard || {};

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/holidays/');
      // Sort holidays by date, soonest first
      const sortedHolidays = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setHolidays(sortedHolidays);
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
      toast.error(t.fetch_holidays_error || 'Failed to fetch holidays.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async (date) => {
    // Logic to add a holiday will be implemented here
    console.log('Adding holiday on:', date);
    // Example: POST to API, then call fetchHolidays()
  };

  const handleDeleteHoliday = async (holidayId) => {
    // Logic to delete a holiday will be implemented here
    console.log('Deleting holiday with ID:', holidayId);
    // Example: DELETE to API, then call fetchHolidays()
  };

  if (loading) {
    return <div className="text-center p-8">{t.loading || 'Loading...'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t.holiday_list_title || 'Holiday List'}</h3>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => alert('Calendar for adding holidays will be implemented here!')}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200">
          <PlusCircle className="w-5 h-5 mr-2" />
          {t.add_holiday_button || 'Add Holiday'}
        </button>
      </div>

      <div className="space-y-4">
        {holidays.length > 0 ? (
          holidays.map(holiday => (
            <div key={holiday.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-orange-500" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{holiday.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(holiday.date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteHoliday(holiday.id)}
                className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t.no_holidays_message || 'No holidays have been set.'}</p>
        )}
      </div>
    </div>
  );
};

export default HolidayManager;
