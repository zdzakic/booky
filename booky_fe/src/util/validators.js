// utils/validators.js

export function validateFullName(name) {
  if (!name.trim()) return 'Bitte geben Sie Ihren Namen ein.';
  return '';
}

export function validatePhone(phone) {
  const re = /^((\+41)|0)\d{8,9}$/;
  if (!re.test(phone)) return 'Ungültige Schweizer Telefonnummer.';
  return '';
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Ungültige E-Mail-Adresse.';
  return '';
}

export function validateLicensePlate(lp) {
  if (!lp.trim()) return 'Bitte geben Sie das Kennzeichen ein.';
  return '';
}


// Validate all input fields only
export function validateAllInputs(formData) {
  const errs = {};
  const fn = validateFullName(formData.fullName);
  if (fn) errs.fullName = fn;
  const ph = validatePhone(formData.phone);
  if (ph) errs.phone = ph;
  const em = validateEmail(formData.email);
  if (em) errs.email = em;
  const lp = validateLicensePlate(formData.licensePlate);
  if (lp) errs.licensePlate = lp;
  return errs;
}
