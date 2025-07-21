// BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import apiClient from '../utils/apiClient';
import InputField from './InputField';
import ServiceSelect from './ServiceSelect';
import CheckBoxField from './CheckBoxField';
import DatePickerComponent from './DatePickerComponent';
import TimeSlots from './TimeSlots';
import SubmitButton from './SubmitButton';
import LanguageSwitcher from './LanguageSwitcher';
import AnimatedText from './ui/AnimatedText';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import {
  validateFullName,
  validatePhone,
  validateEmail,
  validateLicensePlate,
  validateAllInputs
} from '../utils/validators';


export default function BookingForm() {

  const { lang, setLang } = useLanguage();
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
  const [selectedTime, setSelectedTime] = useState(null);
  const [errors, setErrors] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [serviceOptions, setServiceOptions] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]);

  // Fetch disabled dates
  useEffect(() => {
  const fetchDisabledDates = async () => {
    try {
      // Broj dana za koji predviđamo disabled datume
      const daysToCheck = 90;
      const res = await apiClient.get(`/disabled-dates/?days=${daysToCheck}`);
      setDisabledDates(res.data.disabled_dates);
    } catch (err) {
      console.error('Error fetching disabled dates:', err);
    }
  };

  fetchDisabledDates();
}, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

    // Reset selected time if date or service changes
  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate, formData.service]);



  // Fetch avialable dates 
//   useEffect(() => {
//   const fetchUnavailableDates = async () => {
//     const serviceId = formData.service;
//     if (!serviceId) return;

//     const today = new Date();
//     const daysToCheck = 30;
//     const unavailable = [];

//     for (let i = 0; i < daysToCheck; i++) {
//       const date = new Date(today);
//       date.setDate(date.getDate() + i);
//       const isoDate = date.toISOString().split('T')[0];

//       try {
//         const res = await apiClient.get(`/availability/?service=${serviceId}&date=${isoDate}`);
//         if (!res.data || res.data.length === 0) {
//           unavailable.push(isoDate);
//         }
//       } catch (err) {
//         console.error('Error checking availability for', isoDate);
//       }
//     }

//     setDisabledDates(unavailable);
//     };

//     fetchUnavailableDates();
//     }, [formData.service]);


  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get('/services/');
        setServiceOptions(
          response.data.map(s => ({
            value: s.id.toString(),
            label: lang === 'de' ? s.name_de : s.name_en,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };
    fetchServices();
  }, [lang]);

    useEffect(() => {
  setIsInitialLoading(false);
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateAllInputs(formData, t.errors);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    if (!selectedDate || !selectedTime) {
      toast.error(t.errors.selectDateTime || 'Bitte wählen Sie ein Datum und eine Uhrzeit.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Combine date and time into a single ISO 8601 string for the backend
      const [hours, minutes] = selectedTime.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const payload = {
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        license_plate: formData.licensePlate,
        service: parseInt(formData.service, 10),
        start_time: startTime.toISOString(), // Send the combined datetime string
        is_stored: formData.isStored, // FIX: Add isStored value to the payload
      };
      await apiClient.post('/reservations/', payload);
      toast.success(t.successBooking || 'Reservierung erfolgreich erstellt!');
      setTimeout(() => navigate('/success', { state: { lang } }), 1500);
    } catch (error) {
      console.error('Booking submission failed:', error);
    //   console.log('Full error response:', error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4">
      {isInitialLoading ? (
        <Loader2 className="animate-spin text-gray-500 dark:text-gray-400" size={48} />
      ) : (
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
          <div className="flex justify-end mb-2">
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <AnimatedText 
              tag="h2" 
              text={`${t.bookingTitle} - SCHMIDICARS`} 
              className="text-3xl font-bold text-gray-900 dark:text-white" 
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 w-full" noValidate>
            <div className="flex flex-col md:flex-row md:gap-4">
              <div className="w-full md:w-1/2">
                <InputField
                 label={t.fullName}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={t.fullName}
                  error={errors.fullName}
                />
              </div>
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <InputField
                 label={t.phone}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t.phone}
                  error={errors.phone}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:gap-4">
              <div className="w-full md:w-1/2">
                <InputField
                 label={t.email}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="E-Mail"
                  error={errors.email}
                />
              </div>
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <InputField
                 label={t.licensePlate}
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  placeholder={t.licensePlate}
                  error={errors.licensePlate}
                />
              </div>
            </div>
            <ServiceSelect
              service={formData.service}
              onChange={handleChange}
              options={serviceOptions}
              labelText={<AnimatedText text={t.service} />}
              placeholder={t.chooseService}
            />
            <CheckBoxField
              id="isStored"
              name="isStored"
              checked={formData.isStored}
              onChange={handleChange}
              label={<AnimatedText text={t.isStored} />}
            />
            <DatePickerComponent
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              label={<AnimatedText text={t.selectDate} />}
              placeholder={t.datePlaceholder}
              lang={lang}
              disabledDates={disabledDates}
            />
            {selectedDate && formData.service && (
              <TimeSlots
                selectedDate={selectedDate}
                serviceId={formData.service}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                lang={lang}
              />
            )}
            <SubmitButton disabled={!formData.service || !selectedDate || !selectedTime || isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t.submit}
            </SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}