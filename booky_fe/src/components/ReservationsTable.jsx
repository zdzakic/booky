import React from 'react';
import ReservationRow from './ReservationRow';

const ReservationsTable = ({ title, reservations, labels, lang, onApprove, onDelete }) => {
  if (!reservations || reservations.length === 0) {
    return null;
  }

   return (
    <div className="mb-8 shadow-md rounded-lg overflow-hidden">
      {/* {title && <h3 className="p-4 text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>} */}
      <div className="md:table w-full border-collapse text-left">
        <div className="hidden md:table-header-group bg-gray-50 dark:bg-gray-700/50">
          <div className="md:table-row">
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-gray-600 dark:text-gray-300 uppercase">{labels.name || 'Name'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-gray-600 dark:text-gray-300 uppercase">{labels.phone || 'Phone'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-gray-600 dark:text-gray-300 uppercase">{labels.email || 'Email'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-gray-600 dark:text-gray-300 uppercase">{labels.plates || 'Plates'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-gray-600 dark:text-gray-300 uppercase">{labels.service || 'Service'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-gray-600 dark:text-gray-300 uppercase">{labels.stored || 'Stored'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-gray-600 dark:text-gray-300 uppercase">{labels.status || 'Status'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-gray-600 dark:text-gray-300 uppercase">{labels.timeslot || 'Time Slot'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-gray-600 dark:text-gray-300 uppercase">{labels.created || 'Created'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-gray-600 dark:text-gray-300 text-right uppercase">{labels.actions || 'Actions'}</div>
          </div>
        </div>
        <div className="md:table-row-group">
          {reservations.map(reservation => (
            <ReservationRow
              key={reservation.id}
              reservation={reservation}
              labels={labels}
              lang={lang}
              onApprove={onApprove}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReservationsTable;
