import React from 'react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';


const HolidaysTable = ({ holidays, labels, onDelete }) => {
  const { lang } = useLanguage();
  const localeMap = { de, en: enUS };
  const currentLocale = localeMap[lang] || de;

  return (
    <div className="bg-neutral-white dark:bg-neutral-darker shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-light dark:divide-neutral-dark">
          <thead className="bg-neutral-lightest dark:bg-neutral-dark/50 hidden md:table-header-group">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark dark:text-neutral-light uppercase tracking-wider">
                {labels.holiday_name_header || 'Holiday Name'}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark dark:text-neutral-light uppercase tracking-wider">
                {labels.holiday_date_header || 'Date'}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark dark:text-neutral-light uppercase tracking-wider">
                {labels.holiday_created_by_header || 'Created By'}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-dark dark:text-neutral-light uppercase tracking-wider">
                {labels.holiday_actions_header || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-neutral-white dark:bg-neutral-darker divide-y divide-neutral-light dark:divide-neutral-dark">
          {/* <tbody className="bg-neutral-white dark:bg-neutral-darker"> */}
            {holidays.map((holiday) => (
              <tr key={holiday.id} className="block mb-4 border rounded-lg md:table-row md:mb-0">
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-neutral-darkest dark:text-white block md:table-cell">
                  <span className="font-bold md:hidden">{labels.holiday_name_header || 'Holiday Name'}: </span>
                  {holiday.name}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-neutral-dark dark:text-neutral-light block md:table-cell">
                  <span className="font-bold md:hidden">{labels.holiday_date_header || 'Date'}: </span>
                  {format(new Date(holiday.date), 'dd.MM.yyyy', { locale: currentLocale })}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-neutral-dark dark:text-neutral-light block md:table-cell">
                  <span className="font-bold md:hidden">{labels.holiday_created_by_header || 'Created By'}: </span>
                  {holiday.created_by_username || 'N/A'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium block md:table-cell">
                  <button 
                    onClick={() => onDelete(holiday)}
                    className="text-error hover:text-error-dark transition-colors"
                    aria-label={`Delete ${holiday.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
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
