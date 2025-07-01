// BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from '../utils/axios';
import InputField from './InputField';
import ServiceSelect from './ServiceSelect';
import CheckboxField from './CheckboxField';
import DatePickerComponent from './DatePickerComponent';
import TimeSlots from './TimeSlots';
import SubmitButton from './SubmitButton';
import LanguageSwitcher from './LanguageSwitcher';
import { translations } from '../utils/translations';

import {
  validateFullName,
  validatePhone,
  validateEmail,
  validateLicensePlate,
  validateAllInputs
} from '../utils/validators';


export default function BookingForm() {

  const [lang, setLang] = useState('de');
  const t = translations[lang];

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

  const [serviceOptions, setServiceOptions] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);


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

  // povuci servis dinamicki 
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const resp = await axios.get('services/');
        setServiceOptions(
          resp.data.map(s => ({
            value: s.id.toString(),
            label: lang === 'de' ? s.name_de : s.name_en,
          }))
        );
      } catch (err) {
        setServiceOptions([]);
      }
      setLoadingServices(false); 
    };
    setLoadingServices(true); 
    fetchServices();
  }, [lang]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateAllInputs(formData, t.errors);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

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
        start_time: selectedTime,
      };
      const resp = await axios.post('reservations/', payload);
      if (resp.status === 201) navigate('/success', { state: { lang } });
      else alert('Etwas ist schiefgelaufen.');
    } catch (err) {
      console.error('Booking error:', err);
      alert('Fehler beim Buchen.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-4 flex flex-col gap-6">
        {/* Language Switcher */}
        <div className="flex justify-end mb-2">
          <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          {t.bookingTitle}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">

         {/* Full Name */}
          <InputField
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder={t.fullName}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1 mb-0">{errors.fullName}</p>
          )}

          {/* Phone */}
        <InputField
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t.phone}
            error={errors.phone}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1 mb-0">{errors.phone}</p>
          )}

          {/* Email */}
         <InputField
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-Mail"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 mb-0">{errors.email}</p>
          )}


          {/* License Plate */}
          <InputField
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            placeholder={t.licensePlate}
            error={errors.licensePlate}
          />
          {errors.licensePlate && (
            <p className="text-red-500 text-xs mt-1 mb-0">{errors.licensePlate}</p>
          )}

          
          <ServiceSelect
          service={formData.service}
          onChange={handleChange}
          options={serviceOptions}
          loading={loadingServices}
          labelText={t.service}
          placeholder={t.chooseService}
        />
          <CheckboxField
            id="isStored"
            name="isStored"
            checked={formData.isStored}
            onChange={handleChange}
            label={t.isStored}
          />
          <DatePickerComponent
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            label={t.selectDate}
            placeholder={t.datePlaceholder}
            lang={lang}
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
                 lang={lang}
               />
             )
         )}
          <SubmitButton disabled={!formData.service || !selectedDate || !selectedTime}>
          {t.submit}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
