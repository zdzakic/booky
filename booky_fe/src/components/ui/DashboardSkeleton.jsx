import React from 'react';

const SkeletonCard = () => (
  <div className="bg-gray-200 dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-8 bg-gray-400 dark:bg-gray-600 rounded w-1/2"></div>
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="w-full p-4">
      {/* Skeleton for QuickStats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Skeleton for Search Bar */}
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6 animate-pulse w-full max-w-md"></div>

      {/* Skeleton for Table */}
      <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md animate-pulse">
        {/* Table Header */}
        <div className="h-14 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
        {/* Table Rows */}
        <div className="space-y-4 p-4">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
