import React from 'react';
import ReservationRow from './ReservationRow';

const ReservationsTable = ({ title, reservations, labels, lang, onView, onEdit, onDelete }) => {
  if (!reservations || reservations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="bg-gray-100 text-sm font-semibold text-gray-700 py-2 pl-3 rounded-t-lg">
        {title}
      </h3>
      <div className="rounded-b-lg shadow bg-white overflow-x-auto border-l border-r border-b">
        <table className="min-w-full">
          <thead>
            <tr className="text-sm text-gray-800 font-medium border-b">
              <th className="px-3 py-2 text-left">{labels.name || 'Name'}</th>
              <th className="px-3 py-2 text-left">{labels.phone || 'Phone'}</th>
              <th className="px-3 py-2 text-left">{labels.email || 'Email'}</th>
              <th className="px-3 py-2 text-left">{labels.plates || 'License Plates'}</th>
              <th className="px-3 py-2 text-left">{labels.service || 'Service'}</th>
              <th className="px-3 py-2 text-left">{labels.stored || 'Stored?'}</th>
              <th className="px-3 py-2 text-left">{labels.slot || 'Time Slot'}</th>
              <th className="px-3 py-2 text-left">{labels.created || 'Created'}</th>
              <th className="px-3 py-2 text-right">{labels.actions || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(res => (
              <ReservationRow
                key={res.id}
                reservation={res}
                labels={labels}
                lang={lang}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationsTable;
