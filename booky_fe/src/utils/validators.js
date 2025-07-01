// utils/validators.js

export function validateFullName(name, msg) {
  if (!name.trim()) return msg;
  return '';
}

export function validatePhone(phone, msg) {
  const re = /^((\+41)|0)\d{8,9}$/;
  if (!re.test(phone)) return msg;
  return '';
}

export function validateEmail(email, msg) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return msg;
  return '';
}

export function validateLicensePlate(lp, msg) {
  if (!lp.trim()) return msg;
  return '';
}

export function validateAllInputs(formData, errorsDict) {
  const errs = {};
  const fn = validateFullName(formData.fullName, errorsDict.fullName);
  if (fn) errs.fullName = fn;
  const ph = validatePhone(formData.phone, errorsDict.phone);
  if (ph) errs.phone = ph;
  const em = validateEmail(formData.email, errorsDict.email);
  if (em) errs.email = em;
  const lp = validateLicensePlate(formData.licensePlate, errorsDict.licensePlate);
  if (lp) errs.licensePlate = lp;
  return errs;
}
