// TimeSlots.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { translations } from '../utils/translations';

export default function TimeSlots({ selectedDate, serviceId, selectedTime, onTimeSelect, lang = 'de', timezone }) {
  const t = translations[lang];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    if (!selectedDate || !serviceId) {
      setAvailableTimes([]);
      setIsVisible(false);
      return;
    }

    const fetchAvailableTimes = async () => {
      setIsLoading(true);
      setError(null);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

      try {
        const response = await fetch(`${API_BASE_URL}/availability/?service=${serviceId}&date=${formattedDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch time slots.');
        }
        const data = await response.json();
        // The backend returns an array of strings, so we map it to an array of objects.
        const formattedTimes = data.map(time => ({ time, enabled: true }));
        setAvailableTimes(formattedTimes);
        setIsVisible(formattedTimes.length > 0);
      } catch (err) {
        setError(err.message);
        setAvailableTimes([]);
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableTimes();
  }, [selectedDate, serviceId]);

  useEffect(() => {
    // Trigger the animation shortly after the component is ready to be shown.
    if (!isLoading && availableTimes.length > 0) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading, availableTimes.length]);

  if (isLoading)
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t.loadingSlots}</p>;

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!isLoading && !error && availableTimes.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t.noSlots}</p>;
  }

  return (
    <div className={`transition-all duration-300 ease-in-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">{t.availableTimes}</label>
      <div className="grid grid-cols-3 gap-2">
        {availableTimes.map(s => (
          <button
            key={s.time}
            type="button"
            disabled={!s.enabled}
            onClick={() => onTimeSelect(prev => (prev === s.time ? null : s.time))}
            className={`py-2 px-2 rounded-xl border transition-colors duration-200 ` +
              (s.enabled
                ? s.time === selectedTime
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-800 hover:border-orange-400 dark:bg-gray-800 dark:text-white dark:hover:border-orange-500'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500')
            }
          >
            {s.time}
          </button>
        ))}
      </div>
    </div>
  );
}
