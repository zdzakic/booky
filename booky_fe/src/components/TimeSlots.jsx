// TimeSlots.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from '../utils/axios'; // Importujemo našu axios instancu
import { translations } from '../utils/translations';

export default function TimeSlots({ selectedDate, serviceId, selectedTime, onTimeSelect, lang = 'de', timezone }) {
  const t = translations[lang];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

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

      try {
        // Koristimo axios instancu koja ima ispravan baseURL
        const response = await axios.get(`availability/?service=${serviceId}&date=${formattedDate}`);
        
        const formattedTimes = response.data.map(slot => ({ 
          time: slot.time, 
          available_count: slot.available_count, 
          enabled: true 
        }));
        setAvailableTimes(formattedTimes);
        setIsVisible(formattedTimes.length > 0);
      } catch (err) {
        setError(t.errors.fetchTimeSlotsError || 'Failed to fetch time slots.');
        setAvailableTimes([]);
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableTimes();
  }, [selectedDate, serviceId, t.errors.fetchTimeSlotsError]);

  useEffect(() => {
    // Trigger the animation shortly after the component is ready to be shown.
    if (!isLoading && availableTimes.length > 0) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading, availableTimes.length]);

  if (isLoading) {
    return <p className="text-sm text-neutral-dark dark:text-neutral-medium">{t.loadingSlots}</p>;
  }

  if (error) {
    return <p className="text-sm text-error-dark">{error}</p>;
  }

  if (!isLoading && !error && availableTimes.length === 0) {
    return <p className="text-sm text-neutral-dark dark:text-neutral-medium">{t.noSlots}</p>;
  }

  return (
    <div className={`transition-all duration-300 ease-in-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <label className="block mb-2 text-sm text-neutral-darker dark:text-neutral-light">{t.availableTimes}</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {availableTimes.map(s => (
          <button
            key={s.time}
            type="button"
            disabled={!s.enabled}
            onClick={() => onTimeSelect(prev => (prev === s.time ? null : s.time))}
            className={`py-2 px-2 rounded-lg border transition-colors duration-200 flex flex-col items-center justify-center text-center ${ 
              s.enabled
                ? s.time === selectedTime
                  ? 'bg-primary text-white border-primary-dark'
                  : 'bg-white text-neutral-darkest border-neutral-medium hover:border-primary dark:bg-neutral-dark dark:text-neutral-lightest dark:border-neutral-darker dark:hover:border-primary'
                : 'bg-neutral-light text-neutral-medium cursor-not-allowed dark:bg-neutral-darker dark:text-neutral-dark'
            }`}
          >
            <span className="font-semibold text-sm">{s.time}</span>
            {/* Boja ovog teksta se sada nasljeđuje od roditeljskog dugmeta, s blagim smanjenjem kontrasta za suptilniji izgled */}
            <span className="text-xs text-current opacity-75">({s.available_count} {t.spotsAvailable || 'frei'})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
