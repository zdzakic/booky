// QuickStats.jsx
import React from 'react';
import StatCard from './ui/StatCard';

const QuickStats = ({ reservationsTodayCount, unapprovedCount, reservationsThisWeekCount, t }) => (
  <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <StatCard 
      value={reservationsTodayCount} 
      label={t.reservations_today} 
      color="primary"
    />
    <StatCard 
      value={unapprovedCount} 
      label={t.pending_approval} 
      color="warning"
    />
    <StatCard 
      value={reservationsThisWeekCount} 
      label={t.reservations_this_week} 
      color="info"
    />
  </div>
);

export default QuickStats;