// QuickStats.jsx
import React from 'react';
import StatCard from './ui/StatCard';
import { theme } from '../config/theme';

const QuickStats = ({ reservationsTodayCount, totalSlotsToday, newClientsToday, t }) => (
  <div className="max-w-7xl w-full mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <StatCard 
      value={reservationsTodayCount} 
      label={t.reservations_today} 
      color={theme.colors.primary}
    />
    <StatCard 
      value={totalSlotsToday} 
      label={t.total_slots_today} 
      color={theme.colors.success}
    />
    <StatCard 
      value={newClientsToday} 
      label={t.new_clients_today} 
      color={theme.colors.info}
    />
  </div>
);

export default QuickStats;