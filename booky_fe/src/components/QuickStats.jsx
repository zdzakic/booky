// QuickStats.jsx
import React from 'react';
import StatCard from './ui/StatCard';
import { theme } from '../config/theme';

const QuickStats = ({ reservationsTodayCount, unapprovedCount, reservationsThisWeekCount, t }) => (
  <div className="max-w-7xl w-full mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <StatCard 
      value={reservationsTodayCount} 
      label={t.reservations_today} 
      color={theme.colors.primary}
    />
    <StatCard 
      value={unapprovedCount} 
      label={t.pending_approval} 
      color={theme.colors.warning}
    />
    <StatCard 
      value={reservationsThisWeekCount} 
      label={t.reservations_this_week} 
      color={theme.colors.info}
    />
  </div>
);

export default QuickStats;