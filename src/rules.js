/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Core validation rules engine supporting declarative schema validation,
 *              dynamic rule factories, and hardened security against prototype pollution.
 */

const rules = {
  /**
   * Validates that a field is not empty, handling booleans, strings, and standard values.
   */
  required: (value) => {
    if (typeof value === 'boolean') {
      return value ? null : 'This field is required.';
    }
    if (value === undefined || value === null) return 'This field is required.';
    const stringValue = String(value).trim();
    return stringValue !== '' ? null : 'This field is required.';
  },

  /**
   * Validates standard email address formatting.
   */
  email: (value) => {
    if (!value) return 'Please enter a valid email address.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address.';
  },

  /**
   * Validates strictly numeric string input (whole numbers only).
   */
  strictNumeric: (value) => {
    if (!value) return 'Please enter numbers only.';
    const numericRegex = /^\d+$/;
    return numericRegex.test(value) ? null : 'Must be a whole number.';
  },

  /**
   * Validates complex password requirements (min 8 chars, 1 lower, 1 upper, 1 number, 1 symbol).
   */
  passwordStrict: (value) => {
    if (!value) return 'Must contain 8 chars, 1 lowercase, 1 uppercase, 1 number, and 1 symbol.';
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return regex.test(value)
      ? null
      : 'Must contain 8 chars, 1 lowercase, 1 uppercase, 1 number, and 1 symbol.';
  },

  /**
   * Factory rule: Ensures string length meets or exceeds minimum length requirement.
   */
  minLength: (n) => (value) => {
    const str = value !== undefined && value !== null ? value.toString() : '';
    return str.length >= Number(n) ? null : `Must be at least ${n} characters long.`;
  },

  /**
   * Factory rule: Ensures string length does not exceed maximum length requirement.
   */
  maxLength: (n) => (value) => {
    const str = value !== undefined && value !== null ? value.toString() : '';
    return str.length <= Number(n) ? null : `Must be no more than ${n} characters long.`;
  },

  /**
   * Factory rule: Compares current field value against a target field value for matching (e.g., password confirmation).
   */
  match: (targetField) => (value, allData) => {
    const targetValue = allData ? allData[targetField] : undefined;
    return value === targetValue ? null : 'Fields do not match.';
  },

  /**
   * Validates alphanumeric strings (letters and numbers only).
   */
  alphaNumeric: (value) => {
    if (!value) return 'Only letters and numbers are allowed.';
    const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
    return alphaNumericRegex.test(value) ? null : 'Only letters and numbers are allowed.';
  },

  /**
   * Sanitizes and restricts basic unsafe script/SQL injection characters.
   */
  safeText: (value) => {
    if (!value) return null;
    const unsafeRegex = /[<>'";]|--/;
    return unsafeRegex.test(value) ? 'Invalid characters detected.' : null;
  },

  /**
   * Validates proper HTTP/HTTPS URL syntax.
   */
  urlValid: (value) => {
    if (!value) return 'Please enter a valid URL.';
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:' ? null : 'Please enter a valid URL.';
    } catch (_) {
      return 'Please enter a valid URL.';
    }
  },

  /**
   * Validates standard calendar date strings.
   */
  date: (value) => {
    if (!value) return 'Please enter a valid date.';
    const timestamp = Date.parse(value);
    return !isNaN(timestamp) ? null : 'Please enter a valid date.';
  },

  /**
   * Factory rule: Ensures a date occurs before a specified target date field.
   */
  dateBefore: (targetField) => (value, allData) => {
    if (!value) return 'Date must be earlier than the target date.';
    const currentValue = Date.parse(value);
    const targetValue = allData && allData[targetField] ? Date.parse(allData[targetField]) : NaN;

    if (isNaN(currentValue) || isNaN(targetValue)) {
      return 'Please enter valid dates for comparison.';
    }
    return currentValue < targetValue ? null : `Date must be before ${targetField}.`;
  },

  /**
   * Factory rule: Ensures a date occurs after a specified target date field.
   */
  dateAfter: (targetField) => (value, allData) => {
    if (!value) return 'Date must be later than the target date.';
    const currentValue = Date.parse(value);
    const targetValue = allData && allData[targetField] ? Date.parse(allData[targetField]) : NaN;

    if (isNaN(currentValue) || isNaN(targetValue)) {
      return 'Please enter valid dates for comparison.';
    }
    return currentValue > targetValue ? null : `Date must be after ${targetField}.`;
  },

  /**
   * Validates checkbox selection state.
   */
  checked: (value, allData, element) => {
    if (element && typeof element.checked === 'boolean') {
      return element.checked ? null : 'You must accept the terms to continue.';
    }
    return value ? null : 'You must accept the terms to continue.';
  },

  /**
   * Validates standard international and domestic phone number formats.
   */
  phone: (value) => {
    if (!value) return 'Please enter a valid phone number.';
    const phoneRegex = /^[\+]?[(]?\d{3}[)]?[-\s\.]?\d{3}[-\s\.]?\d{4,6}$/;
    return phoneRegex.test(value) ? null : 'Please enter a valid phone number.';
  },

  /**
   * Validates alphabetical strings containing letters and spaces only.
   */
  alphaLetters: (value) => {
    if (!value) return null;
    const alphaRegex = /^[A-Za-z\s]+$/;
    return alphaRegex.test(value) ? null : 'Must contain letters only.';
  },

  /**
   * Factory rule: Validates uploaded file extensions and MIME types against an allowed whitelist.
   */
  fileType: (allowedTypes) => (files) => {
    if (!files || files.length === 0) return null;

    const typesArray = allowedTypes.split(',').map(t => t.trim().toLowerCase());

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      const mimeType = file.type.toLowerCase();

      const isValid = typesArray.includes(extension) || typesArray.includes(mimeType);
      if (!isValid) return `File type not allowed. Allowed types: ${allowedTypes}`;
    }
    return null;
  },

  /**
   * Factory rule: Validates that uploaded file sizes do not exceed specified megabyte limits.
   */
  fileSize: (maxMB) => (files) => {
    if (!files || files.length === 0) return null;

    const maxBytes = parseFloat(maxMB) * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxBytes) {
        return `File must be smaller than ${maxMB}MB.`;
      }
    }
    return null;
  },

  /**
   * Validates credit card number authenticity using the Luhn algorithm.
   */
  creditCard: (value) => {
    if (!value) return 'Please enter a valid credit card number.';
    const sanitized = String(value).replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(sanitized)) {
      return 'Please enter a valid credit card number.';
    }
    let sum = 0;
    let shouldDouble = false;
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return (sum % 10 === 0) ? null : 'Please enter a valid credit card number.';
  },

  /**
   * Factory rule: Ensures selected value belongs to an allowed whitelist (dropdowns/radio groups).
   */
  oneOf: (allowedValues) => {
    const list = typeof allowedValues === 'string'
      ? allowedValues.split(',').map(v => v.trim())
      : allowedValues;

    return (value) => {
      if (!value) return 'Please select a valid option.';
      const isValid = Array.isArray(list) ? list.includes(value) : Object.values(list).includes(value);
      return isValid ? null : 'Please select a valid option.';
    };
  },

  /**
   * Validates standard ISO date-time formatting for datetime-local inputs.
   */
  dateTime: (value) => {
    if (!value) return 'Please enter a valid date and time.';
    const d = new Date(value);
    return (!isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/.test(value))
      ? null
      : 'Please enter a valid date and time.';
  },

  /**
   * Factory rule: Ensures a datetime-local value occurs strictly after a target start datetime field.
   */
  dateTimeAfter: (startDateField) => {
    return (value, allData) => {
      if (!value) return 'Please select a valid date and time.';
      const startValue = allData ? allData[startDateField] : undefined;

      if (!startValue) return null;

      const startTime = new Date(startValue).getTime();
      const endTime = new Date(value).getTime();

      if (isNaN(startTime) || isNaN(endTime)) {
        return 'Please enter valid date and time values.';
      }

      return endTime > startTime ? null : 'End date and time must be after the start date and time.';
    };
  },

  /**
   * Validates that a date is greater than or equal to the current system date (sysdate).
   */
  minDate: (value) => {
    if (!value) return 'Please enter a valid date.';
    const inputDate = new Date(value);
    if (isNaN(inputDate.getTime())) return 'Please enter a valid date.';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate >= today ? null : 'Date must be today or in the future.';
  },

  /**
   * Validates that a date is less than or equal to the current system date (sysdate).
   */
  maxDate: (value) => {
    if (!value) return 'Please enter a valid date.';
    const inputDate = new Date(value);
    if (isNaN(inputDate.getTime())) return 'Please enter a valid date.';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate <= today ? null : 'Date must be today or in the past.';
  },

  /**
   * Validates that a datetime-local value is greater than or equal to the current system timestamp.
   */
  minDateTime: (value) => {
    if (!value) return 'Please enter a valid date and time.';
    const inputTime = new Date(value).getTime();
    if (isNaN(inputTime)) return 'Please enter a valid date and time.';
    const now = new Date().getTime();

    return inputTime >= now ? null : 'Date and time must be now or in the future.';
  },

  /**
   * Validates that a datetime-local value is less than or equal to the current system timestamp.
   */
  maxDateTime: (value) => {
    if (!value) return 'Please enter a valid date and time.';
    const inputTime = new Date(value).getTime();
    if (isNaN(inputTime)) return 'Please enter a valid date and time.';
    const now = new Date().getTime();

    return inputTime <= now ? null : 'Date and time must be now or in the past.';
  },

  /**
   * Factory rule: Escape hatch validator matching input against custom regular expression strings.
   */
  pattern: (regexString) => {
    return (value) => {
      if (!value) return null;

      try {
        const regex = new RegExp(regexString);
        return regex.test(String(value)) ? null : 'Please match the requested format.';
      } catch (e) {
        return 'Invalid validation pattern configuration.';
      }
    };
  },

  /**
   * Securely registers custom project-specific validation rules while blocking prototype pollution vectors.
   */
  register(ruleName, validatorFn) {
    if (typeof ruleName !== 'string' || typeof validatorFn !== 'function') {
      throw new Error('TypeError: Rule name must be a string and validatorFn must be a function.');
    }
    const key = ruleName.toLowerCase();
    const forbidden = ['__proto__', 'constructor', 'prototype'];
    if (forbidden.includes(key)) {
      throw new Error(`SecurityError: Cannot register forbidden property '${ruleName}'`);
    }
    this[key] = validatorFn;
  }
};

/**
 * Prototype-safe rule definition retriever protecting against built-in method hijacking.
 */
const getRuleDefinition = (rulesObj, ruleName) => {
  if (!ruleName || typeof ruleName !== 'string') return null;
  const key = ruleName.toLowerCase();
  const forbidden = ['__proto__', 'constructor', 'prototype'];
  if (forbidden.includes(key)) return null;

  if (Object.prototype.hasOwnProperty.call(rulesObj, key)) {
    return rulesObj[key];
  }
  if (Object.prototype.hasOwnProperty.call(rulesObj, ruleName)) {
    return rulesObj[ruleName];
  }
  return null;
};

module.exports = { rules, getRuleDefinition };