import React from 'react';
import { translations } from '../utils/translations';
import { theme } from '../config/theme'; // KORAK 1: Uvozimo temu
import { Check, Trash2 } from 'lucide-react';

// ActionButton ostaje ista mala helper komponenta
const ActionButton = ({ title, onClick, children }) => (
  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title={title} onClick={onClick}>
    {children}
  </button>
);

const ReservationRow = ({ reservation, labels, lang, onApprove, onDelete }) => {
  const t = translations[lang]?.dashboard || {};

  // Simplified 'isPast' logic using end_time
  const isPast = new Date(reservation.end_time) < new Date();
  const isToday = !isPast && reservation.start_time.startsWith(new Date().toISOString().slice(0, 10));

  // KORAK 2: Definišemo klase koristeći vrednosti iz teme
  const isStoredClasses = `bg-${theme.colors.success}-100 text-${theme.colors.success}-800 dark:bg-${theme.colors.success}-900/30 dark:text-${theme.colors.success}-200`;
  const isNotStoredClasses = `bg-${theme.colors.error}-100 text-${theme.colors.error}-800 dark:bg-${theme.colors.error}-900/30 dark:text-${theme.colors.error}-200`;
  const timeSlotClasses = `bg-custom-orange-200 text-custom-orange-800 dark:bg-custom-orange-800/30 dark:text-custom-orange-100`;
  const viewIconClasses = `text-${theme.colors.secondary}-500`;
  const editIconClasses = `text-${theme.colors.primary}-500`;
  const deleteIconClasses = `text-${theme.colors.error}-500`;

  const rowClass = isPast
    ? 'border-b text-sm bg-gray-50/50 dark:bg-gray-900/10 text-gray-400 dark:text-gray-700 opacity-20'
    : isToday
    ? 'border-b text-sm bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-800/50 group transition-colors duration-200' // Highlight for today
    : 'border-b text-sm hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors duration-200';

  return (
    <div className={`${rowClass} border-gray-200 dark:border-gray-700 p-4 grid grid-cols-2 gap-x-4 md:table-row md:p-0`}>

      <div className="col-span-2 mb-2 md:table-cell md:px-3 md:py-2 font-medium text-gray-900 dark:text-white">
        {reservation.full_name}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.phone || 'Phone'}: </span>
        {reservation.phone || '-'}
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.email || 'Email'}: </span>
        {reservation.email || '-'}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.plates || 'Plates'}: </span>
        {reservation.license_plate || '-'}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.service || 'Service'}: </span>
        {reservation.service?.name || '-'}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.stored || 'Stored?'}: </span>
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${reservation.is_stored ? isStoredClasses : isNotStoredClasses}`}>
          {reservation.is_stored ? (labels.yes || 'Yes') : (labels.no || 'No')}
        </span>
      </div>

      {/* Status Cell */}
      <div className="text-sm md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.status || 'Status'}: </span>
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${reservation.is_approved 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'}`}>
          {reservation.is_approved ? (labels.approved || 'Approved') : (labels.pending || 'Pending')}
        </span>
      </div>
      
      {/* Simplified Time Slot display */}
      <div className="col-span-2 mt-2 md:table-cell md:px-3 md:py-2 md:mt-0">
        <div className={`font-mono text-xs px-2 py-0.5 rounded-full whitespace-nowrap inline-block ${timeSlotClasses}`}>
          {new Date(reservation.start_time).toLocaleString(lang === 'de' ? 'de-CH' : 'en-GB', { 
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
          })}
        </div>
      </div>

      <div className="text-xs text-gray-400 dark:text-gray-500 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.created || 'Created'}: </span>
        {reservation.created_at ? new Date(reservation.created_at).toLocaleString(lang === 'de' ? 'de-CH' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
      </div>

      <div className="col-span-2 mt-2 md:table-cell md:px-3 md:py-2 md:mt-0">
        <div className="flex items-center justify-end space-x-4">
          {!reservation.is_approved && (
            <button
              onClick={() => onApprove(reservation.id)}
              className="text-green-600 hover:text-green-900 dark:text-green-500 dark:hover:text-green-400"
              aria-label={`Approve ${reservation.full_name}`}
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(reservation.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"
            aria-label={`Delete ${reservation.full_name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default ReservationRow;
