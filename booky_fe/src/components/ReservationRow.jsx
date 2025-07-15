import React from 'react';
import { translations } from '../utils/translations';
import { theme } from '../config/theme'; // KORAK 1: Uvozimo temu

// ActionButton ostaje ista mala helper komponenta
const ActionButton = ({ title, onClick, children }) => (
  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title={title} onClick={onClick}>
    {children}
  </button>
);

const ReservationRow = ({ reservation, labels, lang, onView, onEdit, onDelete }) => {
  const t = translations[lang]?.dashboard || {};

  const now = new Date();
  const lastSlot = reservation.slots && reservation.slots[reservation.slots.length - 1];
  let isPast = false;

  if (lastSlot) {
    // Create a Date object from the last slot's start time.
    // new Date() will correctly parse this in the user's local timezone.
    const endTime = new Date(`${lastSlot.date}T${lastSlot.start_time}`);
    // Add 30 minutes to get the actual end time of the reservation.
    endTime.setMinutes(endTime.getMinutes() + 30);

    // Compare with the current time.
    isPast = endTime < new Date();
  }

  // KORAK 2: Definišemo klase koristeći vrednosti iz teme
  const isStoredClasses = `bg-${theme.colors.success}-100 text-${theme.colors.success}-800 dark:bg-${theme.colors.success}-900/30 dark:text-${theme.colors.success}-200`;
  const isNotStoredClasses = `bg-${theme.colors.error}-100 text-${theme.colors.error}-800 dark:bg-${theme.colors.error}-900/30 dark:text-${theme.colors.error}-200`;
  const timeSlotClasses = `bg-custom-orange-200 text-custom-orange-800 dark:bg-custom-orange-800/30 dark:text-custom-orange-100`;
  const viewIconClasses = `text-${theme.colors.secondary}-500`;
  const editIconClasses = `text-${theme.colors.primary}-500`;
  const deleteIconClasses = `text-${theme.colors.error}-500`;

  const rowClass = isPast
    ? 'border-b text-sm bg-gray-50/50 dark:bg-gray-900/10 text-gray-400 dark:text-gray-700 opacity-20'
    : reservation.isNext
    ? `border-b text-sm group bg-${theme.colors.secondary}-100 dark:bg-${theme.colors.secondary}-900/30`
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
        {reservation.service_name}
      </div>

      <div className="text-sm md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.stored || 'Stored?'}: </span>
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${reservation.is_stored ? isStoredClasses : isNotStoredClasses}`}>
          {reservation.is_stored ? (labels.yes || 'Yes') : (labels.no || 'No')}
        </span>
      </div>
      
      <div className="col-span-2 mt-2 md:table-cell md:px-3 md:py-2 md:mt-0">
        <div className="flex flex-wrap gap-1 items-center">
          {reservation.slots.map(slot => (
            <div key={slot.id} className={`font-mono text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${timeSlotClasses}`}>
              {slot.date} {slot.start_time}
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 dark:text-gray-500 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.created || 'Created'}: </span>
        {reservation.created ? new Date(reservation.created).toLocaleString(lang === 'de' ? 'de-DE' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
      </div>

      <div className="col-span-2 mt-2 md:table-cell md:px-3 md:py-2 md:mt-0">
        <div className="flex gap-2 items-center justify-start md:justify-end">
          <ActionButton title={labels.view || "View"} onClick={() => onView(reservation)}>
            <svg className={`w-5 h-5 ${viewIconClasses}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>
          </ActionButton>
          <ActionButton title={labels.edit || "Edit"} onClick={() => onEdit(reservation)}>
            <svg className={`w-5 h-5 ${editIconClasses}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.036 2.036 0 112.881 2.881l-9.071 9.072a4 4 0 01-1.414.942l-4 1.334 1.334-4a4 4 0 01.942-1.414l9.072-9.071z"/></svg>
          </ActionButton>
          <ActionButton title={labels.delete || "Delete"} onClick={() => onDelete(reservation)}>
            <svg className={`w-5 h-5 ${deleteIconClasses}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default ReservationRow;
