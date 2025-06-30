// BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from '../util/axios';
import InputField from './InputField';
import ServiceSelect from './ServiceSelect';
import CheckboxField from './CheckboxField';
import DatePickerComponent from './DatePickerComponent';
import TimeSlots from './TimeSlots';
import SubmitButton from './SubmitButton';
import {
  validateFullName,
  validatePhone,
  validateEmail,
  validateLicensePlate,
  validateAllInputs
} from '../util/validators';

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
  const [errors, setErrors] = useState({});
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
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const resp = await axios.get(
          `all-slots-status/?date=${dateStr}&service=${formData.service}`
        );
        setAvailableSlots(
          resp.data.map(s => ({ time: s.start_time, enabled: s.enabled }))
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

    // 1) Validate full name
    const nameError = validateFullName(formData.fullName);
    if (nameError) {
      setErrors({ fullName: nameError });
      return;
    }

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
        date: format(selectedDate, 'yyyy-MM-dd'), 
        start_time: `${selectedTime}:00`,
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
           isLoadingSlots
             ? (
               <div className="flex justify-center py-4">
                 <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
               </div>
             ) : (
               <TimeSlots
                 slots={availableSlots}
                 loading={isLoadingSlots}
                 selectedTime={selectedTime}
                 setSelectedTime={setSelectedTime}
               />
             )
         )}
          <SubmitButton disabled={!formData.service || !selectedDate || !selectedTime}>
          Termin anfragen
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
