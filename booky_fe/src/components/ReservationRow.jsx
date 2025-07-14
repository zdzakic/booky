import React from 'react';
import { translations } from '../utils/translations';

const ActionButton = ({ title, onClick, children }) => (
  <button className="p-1 hover:bg-gray-100 rounded" title={title} onClick={onClick}>
    {children}
  </button>
);

const ReservationRow = ({ reservation, labels, lang, onView, onEdit, onDelete }) => {
  const t = translations[lang]?.dashboard || {};

  // Dodajemo klasu za isticanje ako je ovo sljedeća rezervacija
  const rowClass = reservation.isNext
    ? 'border-b text-sm hover:bg-blue-50 group bg-blue-50'
    : 'border-b text-sm hover:bg-gray-50 group';

  return (
    <tr key={reservation.id} className={rowClass}>
      <td className="px-3 py-2 font-medium">{reservation.full_name}</td>
      <td className="px-3 py-2">{reservation.phone}</td>
      <td className="px-3 py-2">{reservation.email}</td>
      <td className="px-3 py-2">{reservation.license_plate}</td>
      <td className="px-3 py-2">{reservation.service_name}</td>
      <td className="px-3 py-2">
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${reservation.is_stored ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {reservation.is_stored ? (labels.yes || 'Da') : (labels.no || 'Ne')}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-col gap-1 items-start">
          {reservation.slots.map(slot => (
            <div key={slot.id} className="font-mono text-xs bg-orange-50 text-orange-800 px-2 py-0.5 rounded-full whitespace-nowrap">
              {slot.date} {slot.start_time}
            </div>
          ))}
        </div>
      </td>
      <td className="px-3 py-2 text-gray-400 text-xs">
        {reservation.created ? new Date(reservation.created).toLocaleString(lang === 'de' ? 'de-DE' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
      </td>
      <td className="px-3 py-2 whitespace-nowrap flex gap-2 items-center justify-end">
        <ActionButton title={labels.view || "Pregled"} onClick={() => onView(reservation)}>
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </ActionButton>
        <ActionButton title={labels.edit || "Edit"} onClick={() => onEdit(reservation)}>
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.036 2.036 0 112.881 2.881l-9.071 9.072a4 4 0 01-1.414.942l-4 1.334 1.334-4a4 4 0 01.942-1.414l9.072-9.071z"/>
          </svg>
        </ActionButton>
        <ActionButton title={labels.delete || "Obriši"} onClick={() => onDelete(reservation)}>
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </ActionButton>
      </td>
    </tr>
  );
};

export default ReservationRow;
