// utils/validators.js
import {CANTON_ABBREVIATIONS} from './constants';

export function validateFullName(name, msg) {
  if (!name.trim()) return msg;
  return '';
}

export function validatePhone(phone, msg) {
  const phoneWithoutSpaces = phone.replace(/\s/g, '');
  const re = /^((\+41|0041)0?|0)?\d{7,9}$/;
  if (!re.test(phoneWithoutSpaces)) return msg;
  return '';
}

export function validateEmail(email, msg) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return msg;
  return '';
}

export function validateLicensePlate(lp, msg) {
  const regex = new RegExp(`^(${CANTON_ABBREVIATIONS.join('|')})[\\s-]?\\d{1,6}$`, 'i');
  if (!regex.test(lp.trim())) return msg;
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
