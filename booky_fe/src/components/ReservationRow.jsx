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
    // KORAK 1: Menjamo <tr> u <div> i dodajemo klase za mobilni prikaz (grid)
    // Na mobilnom: 'grid grid-cols-2 gap-x-4' - dve kolone sa razmakom
    // Na desktopu ('md:'): vraćamo 'table-row' da se ponaša kao red u tabeli
    <div className={`${rowClass} border-b p-4 grid grid-cols-2 gap-x-4 md:table-row md:p-0`}>

      {/* --- Ime i prezime --- */}
      {/* Na mobilnom: zauzima celu širinu ('col-span-2') */}
      {/* Na desktopu: ponaša se kao ćelija ('md:table-cell') */}
      <div className="col-span-2 mb-2 md:table-cell md:px-3 md:py-2 font-medium">
        {reservation.full_name}
      </div>

      {/* --- Telefon --- */}
      {/* Prikazujemo labelu samo na mobilnom ('md:hidden') */}
      <div className="text-sm text-gray-600 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.phone || 'Phone'}: </span>
        {reservation.phone || '-'}
      </div>
      
      {/* --- Email --- */}
      <div className="text-sm text-gray-600 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.email || 'Email'}: </span>
        {reservation.email || '-'}
      </div>

      {/* --- Tablice --- */}
      <div className="text-sm text-gray-600 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.plates || 'Plates'}: </span>
        {reservation.license_plate || '-'}
      </div>

      {/* --- Usluga --- */}
      <div className="text-sm text-gray-600 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.service || 'Service'}: </span>
        {reservation.service_name}
      </div>

      {/* --- Status (Stored) --- */}
      <div className="text-sm md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">{labels.stored || 'Stored?'}: </span>
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${reservation.is_stored ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {reservation.is_stored ? (labels.yes || 'Yes') : (labels.no || 'No')}
        </span>
      </div>
      
      {/* --- Vreme termina --- */}
      <div className="col-span-2 mt-2 md:table-cell md:px-3 md:py-2 md:mt-0">
        <div className="flex flex-wrap gap-1 items-center">
          {reservation.slots.map(slot => (
            <div key={slot.id} className="font-mono text-xs bg-orange-50 text-orange-800 px-2 py-0.5 rounded-full whitespace-nowrap">
              {slot.date} {slot.start_time}
            </div>
          ))}
        </div>
      </div>

      {/* --- Kreirano --- */}
      <div className="text-xs text-gray-400 md:table-cell md:px-3 md:py-2">
        <span className="font-semibold md:hidden">Kreirano: </span>
        {reservation.created ? new Date(reservation.created).toLocaleString(lang === 'de' ? 'de-DE' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
      </div>

      {/* --- Akcije --- */}
      {/* Na mobilnom zauzima celu širinu i poravnava na početak */}
      <div className="col-span-2 mt-2 md:table-cell md:px-3 md:py-2 md:mt-0">
        <div className="flex gap-2 items-center justify-start md:justify-end">
          {/* ActionButton komponente ostaju iste */}
          <ActionButton title={labels.view || "View"} onClick={() => onView(reservation)}>
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>
          </ActionButton>
          <ActionButton title={labels.edit || "Edit"} onClick={() => onEdit(reservation)}>
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.036 2.036 0 112.881 2.881l-9.071 9.072a4 4 0 01-1.414.942l-4 1.334 1.334-4a4 4 0 01.942-1.414l9.072-9.071z"/></svg>
          </ActionButton>
          <ActionButton title={labels.delete || "Delete"} onClick={() => onDelete(reservation)}>
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default ReservationRow;
