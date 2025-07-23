import React from 'react';
import { translations } from '../utils/translations';
import { Check, Trash2 } from 'lucide-react';

// ActionButton helper
const ActionButton = ({ title, onClick, children }) => (
  <button className="p-1 hover:bg-neutral-lightest dark:hover:bg-neutral-dark rounded" title={title} onClick={onClick}>
    {children}
  </button>
);

const ReservationRow = ({ reservation, labels, lang, onApprove, onDelete }) => {
  const t = translations[lang]?.dashboard || {};

  // Helper for service name
  const getTranslatedServiceName = (service) => {
    if (!service) return '-';
    if (lang === 'de') return service.name_de || service.name;
    return service.name_en || service.name;
  };

  // Row status
  const isPast = new Date(reservation.end_time) < new Date();
  const isToday = !isPast && reservation.start_time.startsWith(new Date().toISOString().slice(0, 10));

  // Badge/Status classes ONLY from theme.js
  const isStoredClasses = `bg-success-light text-success-dark dark:bg-success-dark/30 dark:text-success-light`;
  const isNotStoredClasses = `bg-error-light text-error-dark dark:bg-error-dark/30 dark:text-error-light`;

  const approvedClasses = `bg-success-light text-success-dark dark:bg-success-dark/30 dark:text-success-light`;
  const pendingClasses  = `bg-warning-light text-warning-dark dark:bg-warning-dark/30 dark:text-warning-light`;

  const timeSlotClasses = `bg-info-light text-info-dark dark:bg-info-dark/30 dark:text-info-light`;

  // Row bg/opacity by status
  const rowClass = isPast
    ? 'border-b text-sm bg-neutral-lightest dark:bg-neutral-dark/50 text-neutral-medium dark:text-neutral-dark opacity-20'
    : isToday
    ? 'border-b text-sm bg-info-light dark:bg-info-dark/30 hover:bg-info-lightest dark:hover:bg-info-dark/60 group transition-colors duration-200'
    : 'border-b text-sm hover:bg-neutral-lightest dark:hover:bg-neutral-dark group transition-colors duration-200';

  return (
    <div className={`${rowClass} border-neutral-medium dark:border-neutral-dark p-4 grid grid-cols-2 gap-x-4 md:table-row md:p-0`}>

      <div className="col-span-2 mb-2 md:table-cell md:px-3 md:py-2 font-medium text-neutral-darkest dark:text-neutral-lightest">
        {reservation.full_name}
      </div>

      <div className="text-sm text-neutral-dark dark:text-neutral-medium md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.phone || 'Phone'}: </span>
        {reservation.phone || '-'}
      </div>
      
      <div className="text-sm text-neutral-dark dark:text-neutral-medium md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.email || 'Email'}: </span>
        {reservation.email || '-'}
      </div>

      <div className="text-sm text-neutral-dark dark:text-neutral-medium md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.plates || 'Plates'}: </span>
        {reservation.license_plate || '-'}
      </div>

      <div className="text-sm text-neutral-dark dark:text-neutral-medium md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.service || 'Service'}: </span>
        {getTranslatedServiceName(reservation.service)}
      </div>

      <div className="text-sm text-neutral-dark dark:text-neutral-medium md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.stored || 'Stored?'}: </span>
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${reservation.is_stored ? isStoredClasses : isNotStoredClasses}`}>
          {reservation.is_stored ? (labels.yes || 'Yes') : (labels.no || 'No')}
        </span>
      </div>

      {/* Status Cell */}
      <div className="text-sm md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.status || 'Status'}: </span>
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${reservation.is_approved ? approvedClasses : pendingClasses}`}>
          {reservation.is_approved ? (labels.approved || 'Approved') : (labels.pending || 'Pending')}
        </span>
      </div>
      
      {/* Time Slot */}
      <div className="col-span-2 mt-2 md:table-cell md:px-3 md:py-2 md:mt-0">
        <div className={`font-mono text-xs px-2 py-0.5 rounded-full whitespace-nowrap inline-block ${timeSlotClasses}`}>
          {new Date(reservation.start_time).toLocaleString(lang === 'de' ? 'de-CH' : 'en-GB', { 
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
          })}
        </div>
      </div>

      <div className="text-xs text-neutral-medium dark:text-neutral-dark md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.created || 'Created'}: </span>
        {reservation.created_at ? new Date(reservation.created_at).toLocaleString(lang === 'de' ? 'de-CH' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
      </div>

      <div className="col-span-2 mt-2 md:table-cell md:px-3 md:py-2 md:mt-0">
        <div className="flex items-center justify-end space-x-4">
          {!reservation.is_approved && (
            <button
              onClick={() => onApprove(reservation.id)}
              className="text-success-dark hover:text-success-dark/80 dark:text-success-light dark:hover:text-success-light/80"
              aria-label={`Approve ${reservation.full_name}`}
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(reservation.id)}
            className="text-error-dark hover:text-error-dark/80 dark:text-error-light dark:hover:text-error-light/80"
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
