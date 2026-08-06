const rules = {
  required: (value) => {
    if (typeof value === 'boolean') {
      return value ? null : 'This field is required.';
    }
    if (value === undefined || value === null) return 'This field is required.';
    const stringValue = String(value).trim();
    return stringValue !== '' ? null : 'This field is required.';
  },

  email: (value) => {
    if (!value) return 'Please enter a valid email address.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address.';
  },

  strictNumeric: (value) => {
    if (!value) return 'Please enter numbers only.';
    const numericRegex = /^\d+$/;
    return numericRegex.test(value) ? null : 'Must be a whole number.';
  },

  passwordStrict: (value) => {
    if (!value) return 'Must contain 8 chars, 1 lowercase, 1 uppercase, 1 number, and 1 symbol.';
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return regex.test(value)
      ? null
      : 'Must contain 8 chars, 1 lowercase, 1 uppercase, 1 number, and 1 symbol.';
  },

  minLength: (n) => (value) => {
    const str = value !== undefined && value !== null ? value.toString() : '';
    return str.length >= Number(n) ? null : `Must be at least ${n} characters long.`;
  },

  maxLength: (n) => (value) => {
    const str = value !== undefined && value !== null ? value.toString() : '';
    return str.length <= Number(n) ? null : `Must be no more than ${n} characters long.`;
  },

  match: (targetField) => (value, allData) => {
    const targetValue = allData ? allData[targetField] : undefined;
    return value === targetValue ? null : 'Fields do not match.';
  },
  alphaNumeric: (value) => {
    if (!value) return 'Only letters and numbers are allowed.';
    const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
    return alphaNumericRegex.test(value) ? null : 'Only letters and numbers are allowed.';
  },
  safeText: (value) => {
    if (!value) return null;
    const unsafeRegex = /[<>'";]|--/;
    return unsafeRegex.test(value) ? 'Invalid characters detected.' : null;
  },
  urlValid: (value) => {
    if (!value) return 'Please enter a valid URL.';
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:' ? null : 'Please enter a valid URL.';
    } catch (_) {
      return 'Please enter a valid URL.';
    }
  },
  date: (value) => {
    if (!value) return 'Please enter a valid date.';
    const timestamp = Date.parse(value);
    return !isNaN(timestamp) ? null : 'Please enter a valid date.';
  },

  dateBefore: (targetField) => (value, allData) => {
    if (!value) return 'Date must be earlier than the target date.';
    const currentValue = Date.parse(value);
    const targetValue = allData && allData[targetField] ? Date.parse(allData[targetField]) : NaN;

    if (isNaN(currentValue) || isNaN(targetValue)) {
      return 'Please enter valid dates for comparison.';
    }
    return currentValue < targetValue ? null : `Date must be before ${targetField}.`;
  },

  dateAfter: (targetField) => (value, allData) => {
    if (!value) return 'Date must be later than the target date.';
    const currentValue = Date.parse(value);
    const targetValue = allData && allData[targetField] ? Date.parse(allData[targetField]) : NaN;

    if (isNaN(currentValue) || isNaN(targetValue)) {
      return 'Please enter valid dates for comparison.';
    }
    return currentValue > targetValue ? null : `Date must be after ${targetField}.`;
  },
  checked: (value, allData, element) => {
    if (element && typeof element.checked === 'boolean') {
      return element.checked ? null : 'You must accept the terms to continue.';
    }
    return value ? null : 'You must accept the terms to continue.';
  },
  phone: (value) => {
    if (!value) return 'Please enter a valid phone number.';
    const phoneRegex = /^[\+]?[(]?\d{3}[)]?[-\s\.]?\d{3}[-\s\.]?\d{4,6}$/;
    return phoneRegex.test(value) ? null : 'Please enter a valid phone number.';
  },
};

module.exports = { rules };