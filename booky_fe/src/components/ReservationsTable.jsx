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
      <div className="rounded-b-lg shadow bg-white border-l border-r border-b">
        
        {/* KORAK 1: Menjamo <table> u <div> */}
        {/* Na desktopu koristimo 'md:table' da bi se ponašao kao tabela */}
        <div className="min-w-full md:table">

          {/* KORAK 2: Menjamo <thead> u <div> */}
          {/* Sakrivamo zaglavlje na mobilnom ('hidden'), prikazujemo na desktopu ('md:table-header-group') */}
          <div className="hidden md:table-header-group">
            <div className="md:table-row text-sm text-gray-800 font-medium border-b">
              <div className="md:table-cell px-3 py-2 text-left">{labels.name || 'Name'}</div>
              <div className="md:table-cell px-3 py-2 text-left">{labels.phone || 'Phone'}</div>
              <div className="md:table-cell px-3 py-2 text-left">{labels.email || 'Email'}</div>
              <div className="md:table-cell px-3 py-2 text-left">{labels.plates || 'License Plates'}</div>
              <div className="md:table-cell px-3 py-2 text-left">{labels.service || 'Service'}</div>
              <div className="md:table-cell px-3 py-2 text-left">{labels.stored || 'Stored?'}</div>
              <div className="md:table-cell px-3 py-2 text-left">{labels.status || 'Status'}</div>
              <div className="md:table-cell px-3 py-2 text-left">{labels.slot || 'Time Slot'}</div>
              <div className="md:table-cell px-3 py-2 text-left">{labels.created || 'Created'}</div>
              <div className="md:table-cell px-3 py-2 text-right">{labels.actions || 'Actions'}</div>
            </div>
          </div>

          {/* KORAK 3: Menjamo <tbody> u <div> */}
          {/* Na desktopu se ponaša kao 'table-row-group' */}
          <div className="md:table-row-group">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationsTable;
