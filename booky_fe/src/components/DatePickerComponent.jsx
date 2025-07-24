// components/DatePickerComponent.jsx

import React from 'react';
import 'react-day-picker/dist/style.css';
import { Popover } from '@headlessui/react';
import { DayPicker } from 'react-day-picker';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
// import { useLanguage } from '../context/LanguageContext';
// import { HOLIDAYS } from '../utils/constants';

// Očekuje: selectedDate, setSelectedDate, label, placeholder, holidays (optional array)
export default function DatePickerComponent({
  selectedDate,
  setSelectedDate,
  label = 'Select Date',
  placeholder = 'Select a date',
  disabledDates = [],
  lang,
//   holidays = HOLIDAYS // Fallback to static holidays if not provided
}) {
//   const { lang } = useLanguage();

//   const disabledDays = [
//     { before: new Date() },
//     { dayOfWeek: [0, 6] },
//     ...holidays.map(d => (typeof d === 'string' ? new Date(d) : new Date(d.date))),
//   ];

    const disabledDays = [
        { before: new Date() },
        { dayOfWeek: [0, 6] },
        ...disabledDates.map(date => new Date(date)),
    ];

  const modifiersClassNames = {
    disabled: 'text-neutral-medium dark:text-neutral-dark',         // umjesto gray-400
    selected: 'rounded-full bg-primary text-neutral-white',         // tvoja nova glavna boja
    today: 'text-primary font-bold',                                // tvoja nova glavna za “danas”
    selected_today: 'rounded-full bg-primary text-white ring-2 ring-primary-dark'
  };

  // Mapiranje jezika na date-fns locale
  const localeMap = { de, en: enUS };
  const currentLocale = localeMap[lang] || de;

  return (
    <div>
      <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <Popover className="relative">
        <Popover.Button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary dark:hover:border-primary-dark transition">
          <span>
            {selectedDate
              ? format(selectedDate, 'dd.MM.yyyy', { locale: currentLocale })
              : placeholder}
          </span>
          <CalendarDays className="ml-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
        </Popover.Button>
        <Popover.Panel className="absolute left-0 bottom-full mb-2 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg p-4">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={currentLocale}
            disabled={disabledDays}
            modifiersClassNames={modifiersClassNames}
            className="rounded-lg"
          />
        </Popover.Panel>
      </Popover>
      {selectedDate && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          {lang === 'de' ? 'Gewähltes Datum:' : 'Selected date:'}{" "}
          {format(selectedDate, 'dd.MM.yyyy', { locale: currentLocale })}
        </p>
      )}
    </div>
  );
}
