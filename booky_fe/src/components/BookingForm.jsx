import { useState, useEffect } from 'react';
import 'react-day-picker/dist/style.css';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Popover } from '@headlessui/react';
import { DayPicker } from 'react-day-picker';
import { useNavigate } from 'react-router-dom';
import axios from '../util/axios';

const BookingForm = () => {

  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    licensePlate: '',
    service: '',
    isStored: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedDate || !selectedTime) {
      alert('Bitte wählen Sie ein Datum und eine Uhrzeit.');
      return;
    }
  
    const payload = {
      full_name: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      license_plate: formData.licensePlate,
      service: parseInt(formData.service),
      is_stored: formData.isStored,
      date: formData.date, // format: '2025-06-21'
      time: formData.time, // format: '14:00'
    };
  
    console.log('Podaci koji se šalju:', payload);
  
    try {
      const response = await axios.post('reservations/', payload);
      if (response.status === 201 || response.status === 200) {
        navigate('/success');
      } else {
        console.error('Unerwartete Antwort:', response);
        alert('Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      console.error('Fehler bei der Buchung:', error);
      alert('Netzwerkfehler oder ungültige Daten.');
    }
  };
  
  

  useEffect(() => {
    if (!selectedDate) return;
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setAvailableSlots([]);
      setSelectedTime(null);
      try {
        const dummySlots = ['09:00', '10:00', '11:30', '13:00', '15:00'];
        await new Promise((resolve) => setTimeout(resolve, 500));
        setAvailableSlots(dummySlots);
      } catch (err) {
        console.error('Error fetching timeslots:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate]);

  const sharedCardClass = "w-full max-w-lg bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-10 flex flex-col gap-6";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className={sharedCardClass}>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Termin buchen</h2>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Vollständiger Name"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-400 focus:ring-0 transition"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Telefonnummer"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-400 focus:ring-0 transition"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-Mail"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-400 focus:ring-0 transition"
          />
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            placeholder="Kennzeichen (z.B. BL-123-AB)"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-400 focus:ring-0 transition"
          />
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-400 focus:ring-0 transition"
          >
            <option value="">Wähle eine Dienstleistung</option>
            <option value="1">Reifenwechsel</option>
            <option value="2">Gummiwechsel auf Felgen</option>
          </select>
          <div className="flex items-center">
            <input
              id="isStored"
              name="isStored"
              type="checkbox"
              checked={formData.isStored}
              onChange={handleChange}
              className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-0"
            />
            <label htmlFor="isStored" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Räder bei uns eingelagert?
            </label>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Datum auswählen
            </label>
            <Popover className="relative">
              <Popover.Panel className="absolute bottom-14 z-10 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg p-4">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={de}
                  fromDate={new Date()}
                  disabled={{ before: new Date() }}
                  modifiersClassNames={{
                    selected: 'bg-orange-500 text-white',
                    today: 'text-orange-500 font-semibold',
                  }}
                  className="rounded-lg"
                />
              </Popover.Panel>
              <Popover.Button className="w-full flex items-center justify-center px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-orange-400 transition">
                <CalendarDays className="h-5 w-5" />
              </Popover.Button>
            </Popover>
            {selectedDate && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                Gewähltes Datum: {format(selectedDate, 'dd.MM.yyyy')}{selectedTime ? ` um ${selectedTime}` : ''}
              </p>
            )}
          </div>
          {selectedDate && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Verfügbare Uhrzeiten
              </label>
              {isLoadingSlots ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Lade Termine...</p>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 rounded-xl border text-sm transition font-medium w-full text-center ${
                        selectedTime === slot
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:border-orange-400'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Keine Termine verfügbar.</p>
              )}
            </div>
          )}
          <button type="submit" disabled={!selectedTime} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition">
            Termin anfragen
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
