import React from 'react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const HolidaysTable = ({ holidays, labels, lang, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 hidden md:table-header-group">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                {labels.holiday_name_header || 'Holiday Name'}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                {labels.holiday_date_header || 'Date'}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                {labels.holiday_actions_header || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {holidays.map((holiday) => (
              <tr key={holiday.id} className="block mb-4 border rounded-lg md:table-row md:mb-0">
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white block md:table-cell">
                  <span className="font-bold md:hidden">{labels.holiday_name_header || 'Holiday Name'}: </span>
                  {holiday.name}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 block md:table-cell">
                  <span className="font-bold md:hidden">{labels.holiday_date_header || 'Date'}: </span>
                  {format(new Date(holiday.date), 'dd.MM.yyyy')}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium block md:table-cell">
                  <button 
                    onClick={() => onDelete(holiday)}
                    className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"
                    aria-label={`Delete ${holiday.name}`}>
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HolidaysTable;
