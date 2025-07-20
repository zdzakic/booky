import React from 'react';
import ReservationRow from './ReservationRow';

const ReservationsTable = ({ title, reservations, labels, lang, onApprove, onDelete }) => {
  if (!reservations || reservations.length === 0) {
    return null;
  }

   return (
    <div className="mb-8 shadow-md rounded-lg overflow-hidden bg-neutral-white dark:bg-neutral-darker">
      {/* {title && <h3 className="p-4 text-lg font-semibold text-neutral-dark dark:text-neutral-light">{title}</h3>} */}
      <div className="md:table w-full border-collapse text-left">
        <div className="hidden md:table-header-group bg-neutral-lightest dark:bg-neutral-dark/50">
          <div className="md:table-row">
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-neutral-dark dark:text-neutral-light uppercase">{labels.name || 'Name'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-neutral-dark dark:text-neutral-light uppercase">{labels.phone || 'Phone'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-neutral-dark dark:text-neutral-light uppercase">{labels.email || 'Email'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-neutral-dark dark:text-neutral-light uppercase">{labels.plates || 'Plates'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-neutral-dark dark:text-neutral-light uppercase">{labels.service || 'Service'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-neutral-dark dark:text-neutral-light uppercase">{labels.stored || 'Stored'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-neutral-dark dark:text-neutral-light uppercase">{labels.status || 'Status'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-neutral-dark dark:text-neutral-light uppercase">{labels.timeslot || 'Time Slot'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-neutral-dark dark:text-neutral-light uppercase">{labels.created || 'Created'}</div>
            <div className="md:table-cell px-3 py-2 font-medium text-xs text-neutral-dark dark:text-neutral-light text-right uppercase">{labels.actions || 'Actions'}</div>
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
