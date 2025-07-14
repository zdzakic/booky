import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { translations } from '../utils/translations';
import LanguageSwitcher from './LanguageSwitcher';

// Helper: grupiše termine na danas/sutra/ostalo
function groupByDay(reservations) {
  const todayStr = new Date().toISOString().slice(0, 10); // npr. "2025-07-02"
  let today = [], future = [];
  reservations.forEach(r => {
    r.slots.forEach((slot, idx) => {
      const obj = { ...r, slot, slotIndex: idx };
      if (slot.date === todayStr) {
        today.push(obj);
      } else {
        future.push(obj);
      }
    });
  });
  // Sortiraj po datumu i vremenu
  today.sort((a, b) => a.slot.start_time.localeCompare(b.slot.start_time));
  future.sort((a, b) => (a.slot.date + a.slot.start_time).localeCompare(b.slot.date + b.slot.start_time));
  return { today, future };
}

const ReservationsDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('de');

  useEffect(() => {
    axios.get('/reservations/lists/')
      .then(res => {
        setReservations(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const t = translations[lang]?.dashboard || {};

  // Grupisanje termina po danima
  const { today, future } = groupByDay(reservations);

  if (loading) return <div className="pt-24 text-center text-lg font-semibold text-gray-500">Laden...</div>;

  // Akcije za dugmad (dodaj kasnije prave funkcije)
  const handleView = (row) => alert(`${t.view || 'Pregled'} rezervacije: ${row.full_name}`);
  const handleEdit = (row) => alert(`${t.edit || 'Izmjena'} rezervacije: ${row.full_name}`);
  const handleDelete = (row) => {
    if (window.confirm(t.delete_confirm || 'Obriši ovu rezervaciju?')) {
      alert('Obrisano! (stub)');
    }
  };

  // Render redova
  const renderRows = (rows) =>
    rows.map((row, i) => (
      <tr key={`${row.id}-${row.slotIndex}`} className="border-b text-sm hover:bg-gray-50 group">
        {/* Samo za prvi slot prikazujemo osnovne podatke */}
        {row.slotIndex === 0 ? (
          <>
            <td className="px-3 py-2 font-medium">{row.full_name}</td>
            <td className="px-3 py-2">{row.phone}</td>
            <td className="px-3 py-2">{row.email}</td>
            <td className="px-3 py-2">{row.license_plate}</td>
            <td className="px-3 py-2">{row.service_name}</td>
            <td className="px-3 py-2">
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${row.is_stored ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {row.is_stored ? t.yes || 'Da' : t.no || 'Ne'}
              </span>
            </td>
          </>
        ) : (
          <>
            <td /><td /><td /><td /><td /><td />
          </>
        )}
        {/* Termin */}
        <td className="px-3 py-2 whitespace-nowrap font-mono flex items-center gap-1">
          <svg className="w-4 h-4 text-orange-400 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {row.slot.date} {row.slot.start_time}
        </td>
        {/* Kreirano */}
        {row.slotIndex === 0 ? (
          <td className="px-3 py-2 text-gray-400 text-xs">
            {row.created ? new Date(row.created).toLocaleString(lang === 'de' ? 'de-DE' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
          </td>
        ) : <td />}
        {/* Dugmad */}
        <td className="px-3 py-2 whitespace-nowrap flex gap-2 items-center justify-end">
          <button className="p-1 hover:bg-gray-100 rounded" title={t.view || "Pregled"} onClick={() => handleView(row)}>
            {/* Oko (view) */}
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button className="p-1 hover:bg-gray-100 rounded" title={t.edit || "Edit"} onClick={() => handleEdit(row)}>
            {/* Olovka (edit) */}
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.036 2.036 0 112.881 2.881l-9.071 9.072a4 4 0 01-1.414.942l-4 1.334 1.334-4a4 4 0 01.942-1.414l9.072-9.071z"/>
            </svg>
          </button>
          <button className="p-1 hover:bg-gray-100 rounded" title={t.delete || "Obriši"} onClick={() => handleDelete(row)}>
            {/* X (delete) */}
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </td>
      </tr>
    ));

  return (
    <div className="font-sans bg-gray-50 min-h-screen pt-8 px-2">
      <div className="flex justify-between items-center max-w-7xl w-full mx-auto mb-5">
        <h2 className="text-2xl font-bold">{t.all_reservations || 'Sve rezervacije'}</h2>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>
      <div className="max-w-7xl w-full mx-auto rounded-xl shadow bg-white overflow-x-auto border">
        <table className="min-w-full">
          <thead>
            <tr className="text-sm text-gray-800 font-medium border-b">
              <th className="px-3 py-2 text-left">{t.name || 'Name'}</th>
              <th className="px-3 py-2 text-left">{t.phone || 'Phone'}</th>
              <th className="px-3 py-2 text-left">{t.email || 'Email'}</th>
              <th className="px-3 py-2 text-left">{t.plates || 'License Plates'}</th>
              <th className="px-3 py-2 text-left">{t.service || 'Service'}</th>
              <th className="px-3 py-2 text-left">{t.stored || 'Stored?'}</th>
              <th className="px-3 py-2 text-left">{t.slot || 'Time Slot'}</th>
              <th className="px-3 py-2 text-left">{t.created || 'Created'}</th>
              <th className="px-3 py-2 text-right">{t.actions || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {today.length > 0 && (
              <>
                <tr>
                  <td colSpan="100%" className="bg-gray-100 text-sm font-semibold text-gray-700 py-2 pl-3">
                    {t.today || 'Today'}
                  </td>
                </tr>
                {renderRows(today)}
              </>
            )}
            {future.length > 0 && (
              <>
                <tr>
                  <td colSpan="100%" className="bg-gray-100 text-sm font-semibold text-gray-700 py-2 pl-3">
                    {t.upcoming_days || 'Upcoming Days'}
                  </td>
                </tr>
                {renderRows(future)}
              </>
            )}
            {today.length === 0 && future.length === 0 && (
              <tr>
                <td colSpan="100%" className="py-6 text-center text-gray-400">
                  {t.no_reservations || 'No reservations found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationsDashboard;
