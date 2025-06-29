// BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../util/axios';
import InputField from './InputField';
import ServiceSelect from './ServiceSelect';
import CheckboxField from './CheckboxField';
import DatePickerComponent from './DatePickerComponent';
import TimeSlots from './TimeSlots';

const serviceOptions = [
  { value: '1', label: 'Reifenwechsel' },
  { value: '2', label: 'Gummiwechsel auf Felgen' },
];

export default function BookingForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    licensePlate: '',
    service: '',
    isStored: false,
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  useEffect(() => {
    if (!selectedDate || !formData.service) return;
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setAvailableSlots([]);
      setSelectedTime(null);
      try {
        const dateStr = selectedDate.toISOString().slice(0, 10); // YYYY-MM-DD
        const resp = await axios.get(
          `available-slots/?date=${dateStr}&service=${formData.service}`
        );
        setAvailableSlots(
          resp.data.map(s => ({ time: s.start_time, available: true }))
        );
      } catch (err) {
        console.error('Error fetching timeslots:', err);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, formData.service]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert('Bitte wählen Sie ein Datum und eine Uhrzeit.');
      return;
    }
    try {
      const payload = {
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        license_plate: formData.licensePlate,
        service: parseInt(formData.service, 10),
        is_stored: formData.isStored,
        date: selectedDate.toISOString().slice(0,10),
        start_time: selectedTime,
      };
      const resp = await axios.post('reservations/', payload);
      if (resp.status === 201) navigate('/success');
      else alert('Etwas ist schiefgelaufen.');
    } catch (err) {
      console.error('Booking error:', err);
      alert('Fehler beim Buchen.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-10 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Termin buchen
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <InputField
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Vollständiger Name"
            required
          />
          <InputField
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Telefonnummer"
            required
          />
          <InputField
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-Mail"
            required
          />
          <InputField
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            placeholder="Kennzeichen (z.B. BL-123-AB)"
            required
          />
          <ServiceSelect
            service={formData.service}
            onChange={handleChange}
            options={serviceOptions}
          />
          <CheckboxField
            id="isStored"
            name="isStored"
            checked={formData.isStored}
            onChange={handleChange}
            label="Räder bei uns eingelagert?"
          />
          <DatePickerComponent
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          {selectedDate && (
            <TimeSlots
              slots={availableSlots}
              loading={isLoadingSlots}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
            />
          )}
          <button
            type="submit"
            disabled={!formData.service || !selectedDate || !selectedTime}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Termin anfragen
          </button>
        </form>
      </div>
    </div>
  );
}
