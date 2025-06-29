// components/DatePickerComponent.jsx

import React from 'react';
import 'react-day-picker/dist/style.css';
import { Popover } from '@headlessui/react';
import { DayPicker } from 'react-day-picker';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { HOLIDAYS } from '../util/constants';


export default function DatePickerComponent({ selectedDate, setSelectedDate }) {
  const disabledDays = [
    { before: new Date() },      // all days before today
    { dayOfWeek: [0, 6] },      // Sundays & Saturdays
    ...HOLIDAYS.map(d => ({ date: d })), // holidays
  ];

  const modifiersClassNames = {
    disabled: 'text-gray-400',                                      // grey text only
    selected: 'rounded-full bg-orange-500 text-white',              // orange circle
    today: 'text-orange-500 font-bold', // orange outline
  };

  return (
    <div>
      <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
        Datum auswählen
      </label>
      <Popover className="relative">
        <Popover.Button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-orange-400 transition">
          <span>
            {selectedDate
              ? format(selectedDate, 'dd.MM.yyyy', { locale: de })
              : 'Datum wählen'}
          </span>
          <CalendarDays className="ml-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
        </Popover.Button>
        <Popover.Panel className="absolute left-0 bottom-full mb-2 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg p-4">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={de}
            // fromDate={new Date()}
            disabled={disabledDays}
            modifiersClassNames={modifiersClassNames}
            className="rounded-lg"
          />
        </Popover.Panel>
      </Popover>
      {selectedDate && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          Gewähltes Datum: {format(selectedDate, 'dd.MM.yyyy', { locale: de })}
        </p>
      )}
    </div>
  );
}
