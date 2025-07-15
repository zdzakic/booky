// QuickStats.jsx
import React from 'react';
import StatCard from './StatCard';

const QuickStats = ({ reservationsTodayCount, totalSlotsToday, newClientsToday, t }) => (
  <div className="max-w-7xl w-full mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <StatCard 
      value={reservationsTodayCount} 
      label={t.reservations_today} 
    />
    <StatCard 
      value={totalSlotsToday} 
      label={t.total_slots_today} 
    />
    <StatCard 
      value={newClientsToday} 
      label={t.new_clients_today} 
    />
  </div>
);

export default QuickStats;