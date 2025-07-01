// TimeSlots.jsx
import React from 'react';

export default function TimeSlots({ slots, loading, selectedTime, setSelectedTime }) {
  if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">Lade Termine...</p>;
  if (!slots.length) return <p className="text-sm text-gray-500 dark:text-gray-400">Keine Termine verfügbar.</p>;

  return (
    <div>
      <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">Verfügbare Uhrzeiten</label>
      <div className="grid grid-cols-3 gap-2">
        {slots.map(s => (
          <button
            key={s.time}
            type="button"
            disabled={!s.enabled}
            // onClick={() => setSelectedTime(s.time)}
            onClick={() =>
              s.enabled &&
              setSelectedTime(prev => (prev === s.time ? null : s.time))
            }
            className={
              s.enabled
                ? s.time === selectedTime
                  ? 'py-2 px-2 rounded-xl border bg-orange-600 text-white border-orange-600'
                  : 'py-2 px-2 rounded-xl border bg-white text-gray-800 hover:border-orange-400'
                : 'py-2 px-2 rounded-xl border bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          >
            {s.time}
          </button>
        ))}
      </div>
    </div>
  );
}
