import React from 'react';

const ServiceSelect = ({ service, onChange, options = [], loading }) => (
  <div>
    <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
      Dienstleistung auswählen
    </label>
    <select
      name="service"
      value={service}
      onChange={onChange}
      required
      disabled={loading}
      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400 focus:ring-0 transition"
    >
      <option value="">Wähle eine Dienstleistung</option>
      {loading
        ? <option>Lade Services...</option>
        : options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
      }
    </select>
  </div>
);

export default ServiceSelect;
