// BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
  const [selectedTime, setSelectedTime] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [serviceOptions, setServiceOptions] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [holidays, setHolidays] = useState([]);

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

  // Fetch holidays to disable them in the date picker
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const resp = await axios.get('holidays/');
        setHolidays(resp.data);
      } catch (err) {
        console.error("Failed to fetch holidays for booking form:", err);
        // Non-blocking error toast
        toast.error(t.errors.fetchHolidaysError || 'Could not load holidays.');
      }
    };
    fetchHolidays();
  }, [t.errors.fetchHolidaysError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateAllInputs(formData, t.errors);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    if (!selectedDate || !selectedTime) {
      toast.error(t.errors.selectDateTime || 'Bitte wählen Sie ein Datum und eine Uhrzeit.');
      return;
    }
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
      };
      const resp = await axios.post('reservations/', payload);
      if (resp.status === 201) {
        toast.success(t.successBooking || 'Reservierung erfolgreich erstellt!');
        setTimeout(() => navigate('/success', { state: { lang } }), 1500);
      } else {
        toast.error(t.errors.general || 'Etwas ist schiefgelaufen.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      toast.error(t.errors.bookingFailed || 'Fehler beim Buchen.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 sm:p-8 flex flex-col gap-4">

        <div className="flex justify-end mb-2">
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          {t.bookingTitle}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full" noValidate>

          <div className="flex flex-col md:flex-row md:gap-4">
            <div className="w-full md:w-1/2">
              <InputField
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t.fullName}
                error={errors.fullName}
              />
            </div>
            <div className="w-full md:w-1/2 mt-4 md:mt-0">
              <InputField
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
            holidays={holidays}
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
          <SubmitButton disabled={!formData.service || !selectedDate || !selectedTime}>
            {t.submit}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}