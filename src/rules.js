/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Core validation rules engine supporting declarative schema validation,
 *              dynamic rule factories, and hardened security against prototype pollution.
 */

const { getMessage, deriveFieldLabel } = require('./i18n');

const resolveLocale = (element, context) => {
  let localeCode;
  if (typeof context === 'string') {
    localeCode = context;
  } else if (context && typeof context.locale === 'string') {
    localeCode = context.locale;
  } else if (typeof element === 'string') {
    localeCode = element;
  } else if (element && typeof element.locale === 'string') {
    localeCode = element.locale;
  } else if (element && typeof element.getAttribute === 'function') {
    const attr = element.getAttribute('data-locale') || (element.form && typeof element.form.getAttribute === 'function' && element.form.getAttribute('data-locale'));
    if (attr) localeCode = attr;
  }

  const label = deriveFieldLabel(element, context);

  return {
    locale: localeCode,
    field: label,
    label: label,
    toString: () => localeCode || ''
  };
};

const rules = {
  /**
   * Validates that a field is not empty, handling booleans, strings, and standard values.
   */
  required: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (typeof value === 'boolean') {
      return value ? null : getMessage('required', [], loc);
    }
    if (value === undefined || value === null) return getMessage('required', [], loc);
    if (Array.isArray(value)) {
      return value.length > 0 ? null : getMessage('required', [], loc);
    }
    const stringValue = String(value).trim();
    return stringValue !== '' ? null : getMessage('required', [], loc);
  },

  /**
   * Validates standard email address formatting.
   */
  email: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('email', [], loc);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : getMessage('email', [], loc);
  },

  /**
   * Validates strictly numeric string input (whole numbers only).
   */
  strictNumeric: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('strictNumeric_empty', [], loc);
    const numericRegex = /^\d+$/;
    return numericRegex.test(value) ? null : getMessage('strictNumeric', [], loc);
  },

  /**
   * Validates complex password requirements (min 8 chars, 1 lower, 1 upper, 1 number, 1 symbol).
   */
  passwordStrict: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    const msg = getMessage('passwordStrict', [], loc);
    if (!value) return msg;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return regex.test(value) ? null : msg;
  },

  /**
   * Factory rule: Ensures string length meets or exceeds minimum length requirement.
   */
  minLength: (n) => (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    const str = value !== undefined && value !== null ? value.toString() : '';
    return str.length >= Number(n) ? null : getMessage('minLength', [n], loc);
  },

  /**
   * Factory rule: Ensures string length does not exceed maximum length requirement.
   */
  maxLength: (n) => (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    const str = value !== undefined && value !== null ? value.toString() : '';
    return str.length <= Number(n) ? null : getMessage('maxLength', [n], loc);
  },

  /**
   * Factory rule: Compares current field value against a target field value for matching (e.g., password confirmation).
   */
  match: (targetField) => (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    const targetValue = allData ? allData[targetField] : undefined;
    return value === targetValue ? null : getMessage('match', [targetField], loc);
  },

  /**
   * Validates alphanumeric strings (letters and numbers only).
   */
  alphaNumeric: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('alphaNumeric', [], loc);
    const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
    return alphaNumericRegex.test(value) ? null : getMessage('alphaNumeric', [], loc);
  },

  /**
   * Sanitizes and restricts basic unsafe script/SQL injection characters.
   */
  safeText: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return null;
    const unsafeRegex = /[<>'";]|--/;
    return unsafeRegex.test(value) ? getMessage('safeText', [], loc) : null;
  },

  /**
   * Validates proper HTTP/HTTPS URL syntax.
   */
  urlValid: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('urlValid', [], loc);
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:' ? null : getMessage('urlValid', [], loc);
    } catch (_) {
      return getMessage('urlValid', [], loc);
    }
  },

  /**
   * Validates standard calendar date strings.
   */
  date: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('date', [], loc);
    const timestamp = Date.parse(value);
    return !isNaN(timestamp) ? null : getMessage('date', [], loc);
  },

  /**
   * Factory rule: Ensures a date occurs before a specified target date field.
   */
  dateBefore: (targetField) => (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return 'Date must be earlier than the target date.';
    const currentValue = Date.parse(value);
    const targetValue = allData && allData[targetField] ? Date.parse(allData[targetField]) : NaN;

    if (isNaN(currentValue) || isNaN(targetValue)) {
      return 'Please enter valid dates for comparison.';
    }
    return currentValue < targetValue ? null : getMessage('dateBefore', [targetField], loc);
  },

  /**
   * Factory rule: Ensures a date occurs after a specified target date field.
   */
  dateAfter: (targetField) => (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return 'Date must be later than the target date.';
    const currentValue = Date.parse(value);
    const targetValue = allData && allData[targetField] ? Date.parse(allData[targetField]) : NaN;

    if (isNaN(currentValue) || isNaN(targetValue)) {
      return 'Please enter valid dates for comparison.';
    }
    return currentValue > targetValue ? null : getMessage('dateAfter', [targetField], loc);
  },

  /**
   * Validates checkbox selection state.
   */
  checked: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (element && typeof element.checked === 'boolean') {
      return element.checked ? null : getMessage('checked', [], loc);
    }
    return value ? null : getMessage('checked', [], loc);
  },

  /**
   * Validates standard international and domestic phone number formats.
   */
  phone: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('phone', [], loc);
    const phoneRegex = /^[\+]?[(]?\d{3}[)]?[-\s\.]?\d{3}[-\s\.]?\d{4,6}$/;
    return phoneRegex.test(value) ? null : getMessage('phone', [], loc);
  },

  /**
   * Validates alphabetical strings containing letters and spaces only.
   */
  alphaLetters: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return null;
    const alphaRegex = /^[A-Za-z\s]+$/;
    return alphaRegex.test(value) ? null : getMessage('alphaLetters', [], loc);
  },

  /**
   * Factory rule: Validates uploaded file extensions and MIME types against an allowed whitelist.
   */
  fileType: (allowedTypes) => (files, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!files || files.length === 0) return null;

    const typesArray = allowedTypes.split(',').map(t => t.trim().toLowerCase());

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      const mimeType = file.type.toLowerCase();

      const isValid = typesArray.includes(extension) || typesArray.includes(mimeType);
      if (!isValid) return getMessage('fileType', [allowedTypes], loc);
    }
    return null;
  },

  /**
   * Factory rule: Validates that uploaded file sizes do not exceed specified megabyte limits.
   */
  fileSize: (maxMB) => (files, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!files || files.length === 0) return null;

    const maxBytes = parseFloat(maxMB) * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxBytes) {
        return getMessage('fileSize', [maxMB], loc);
      }
    }
    return null;
  },

  /**
   * Validates credit card number authenticity using the Luhn algorithm.
   */
  creditCard: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('creditCard', [], loc);
    const sanitized = String(value).replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(sanitized)) {
      return getMessage('creditCard', [], loc);
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

    return (sum % 10 === 0) ? null : getMessage('creditCard', [], loc);
  },

  /**
   * Factory rule: Ensures selected value belongs to an allowed whitelist (dropdowns/radio groups).
   */
  oneOf: (allowedValues) => {
    const list = typeof allowedValues === 'string'
      ? allowedValues.split(',').map(v => v.trim())
      : allowedValues;

    return (value, allData, element, context) => {
      const loc = resolveLocale(element, context);
      if (!value) return getMessage('oneOf', [], loc);
      const isValid = Array.isArray(list) ? list.includes(value) : Object.values(list).includes(value);
      return isValid ? null : getMessage('oneOf', [], loc);
    };
  },

  /**
   * Validates standard ISO date-time formatting for datetime-local inputs.
   */
  dateTime: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('dateTime', [], loc);
    const d = new Date(value);
    return (!isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/.test(value))
      ? null
      : getMessage('dateTime', [], loc);
  },

  /**
   * Factory rule: Ensures a datetime-local value occurs strictly after a target start datetime field.
   */
  dateTimeAfter: (startDateField) => {
    return (value, allData, element, context) => {
      const loc = resolveLocale(element, context);
      if (!value) return 'Please select a valid date and time.';
      const startValue = allData ? allData[startDateField] : undefined;

      if (!startValue) return null;

      const startTime = new Date(startValue).getTime();
      const endTime = new Date(value).getTime();

      if (isNaN(startTime) || isNaN(endTime)) {
        return 'Please enter valid date and time values.';
      }

      return endTime > startTime ? null : getMessage('dateTimeAfter', [], loc);
    };
  },

  /**
   * Validates that a date is greater than or equal to the current system date (sysdate).
   */
  minDate: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('date', [], loc);
    const inputDate = new Date(value);
    if (isNaN(inputDate.getTime())) return getMessage('date', [], loc);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate >= today ? null : getMessage('minDate', [], loc);
  },

  /**
   * Validates that a date is less than or equal to the current system date (sysdate).
   */
  maxDate: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('date', [], loc);
    const inputDate = new Date(value);
    if (isNaN(inputDate.getTime())) return getMessage('date', [], loc);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate <= today ? null : getMessage('maxDate', [], loc);
  },

  /**
   * Validates that a datetime-local value is greater than or equal to the current system timestamp.
   */
  minDateTime: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('dateTime', [], loc);
    const inputTime = new Date(value).getTime();
    if (isNaN(inputTime)) return getMessage('dateTime', [], loc);
    const now = new Date().getTime();

    return inputTime >= now ? null : getMessage('minDateTime', [], loc);
  },

  /**
   * Validates that a datetime-local value is less than or equal to the current system timestamp.
   */
  maxDateTime: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (!value) return getMessage('dateTime', [], loc);
    const inputTime = new Date(value).getTime();
    if (isNaN(inputTime)) return getMessage('dateTime', [], loc);
    const now = new Date().getTime();

    return inputTime <= now ? null : getMessage('maxDateTime', [], loc);
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
   * Factory rule: Validates an input value asynchronously by querying a remote endpoint.
   * Syntax: remote:url[,paramName]
   */
  remote: (ruleArg, options = {}) => {
    let url = ruleArg || '';
    let paramName = 'value';
    const commaIdx = url.indexOf(',');
    if (commaIdx !== -1) {
      paramName = url.slice(commaIdx + 1).trim();
      url = url.slice(0, commaIdx).trim();
    }

    return async (value) => {
      if (value === undefined || value === null || String(value).trim() === '') {
        return null;
      }

      if (typeof fetch !== 'function') {
        return 'Remote validation unavailable in current environment.';
      }

      const separator = url.includes('?') ? '&' : '?';
      const requestUrl = `${url}${separator}${encodeURIComponent(paramName)}=${encodeURIComponent(value)}`;

      try {
        const fetchOptions = {
          method: 'GET',
          headers: { 'Accept': 'application/json, text/plain, */*' },
          ...options
        };

        const response = await fetch(requestUrl, fetchOptions);

        if (!response.ok) {
          try {
            const json = await response.json();
            return (json && json.message) ? json.message : 'Validation failed.';
          } catch (e) {
            return 'Validation failed.';
          }
        }

        const contentType = response.headers && typeof response.headers.get === 'function'
          ? response.headers.get('content-type')
          : '';

        if (contentType && contentType.includes('application/json')) {
          const json = await response.json();
          if (json && json.valid === false) {
            return json.message || 'Validation failed.';
          }
        }

        return null;
      } catch (err) {
        if (err && (err.name === 'AbortError' || err.code === 20)) {
          return null;
        }
        return 'Remote validation error.';
      }
    };
  },

  /**
   * Factory rule: Field is required only if targetField matches expectedValue.
   * Syntax: requiredIf:targetField,expectedValue
   */
  requiredIf: (ruleArg) => {
    let targetField = '';
    let expectedValue = '';
    const commaIdx = (ruleArg || '').indexOf(',');
    if (commaIdx !== -1) {
      targetField = ruleArg.slice(0, commaIdx).trim();
      expectedValue = ruleArg.slice(commaIdx + 1).trim();
    }

    return (value, allData) => {
      if (!allData || !targetField) return null;
      const targetVal = allData[targetField];
      const matches = String(targetVal !== undefined && targetVal !== null ? targetVal : '') === expectedValue;
      if (matches) {
        return rules.required(value);
      }
      return null;
    };
  },

  /**
   * Factory rule: Field is required if targetField has any non-empty value.
   * Syntax: requiredWith:targetField
   */
  requiredWith: (targetField) => {
    const field = (targetField || '').trim();
    return (value, allData) => {
      if (!allData || !field) return null;
      const targetVal = allData[field];
      const hasValue = targetVal !== undefined && targetVal !== null && String(targetVal).trim() !== '' &&
        (!Array.isArray(targetVal) || targetVal.length > 0);
      if (hasValue) {
        return rules.required(value);
      }
      return null;
    };
  },

  /**
   * Factory rule: Field is required if targetField is empty or missing.
   * Syntax: requiredWithout:targetField
   */
  requiredWithout: (targetField) => {
    const field = (targetField || '').trim();
    return (value, allData) => {
      if (!allData || !field) return rules.required(value);
      const targetVal = allData[field];
      const isEmpty = targetVal === undefined || targetVal === null || String(targetVal).trim() === '' ||
        (Array.isArray(targetVal) && targetVal.length === 0);
      if (isEmpty) {
        return rules.required(value);
      }
      return null;
    };
  },

  /**
   * Declarative rule marker for auto-binder re-evaluation dependencies.
   */
  dependsOn: () => () => null,

  /**
   * Validates numeric input (integers, negative numbers, floating-point decimals).
   */
  numeric: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const str = String(value).trim();
    return /^-?\d+(\.\d+)?$/.test(str) ? null : getMessage('numeric', [], loc);
  },

  /**
   * Factory rule: Validates numeric value is >= minimum threshold.
   */
  min: (minVal) => (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const num = Number(value);
    const limit = Number(minVal);
    if (isNaN(num) || isNaN(limit) || num < limit) {
      return getMessage('min', [minVal], loc);
    }
    return null;
  },

  /**
   * Factory rule: Validates numeric value is <= maximum threshold.
   */
  max: (maxVal) => (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const num = Number(value);
    const limit = Number(maxVal);
    if (isNaN(num) || isNaN(limit) || num > limit) {
      return getMessage('max', [maxVal], loc);
    }
    return null;
  },

  /**
   * Factory rule: Validates numeric value is between min and max inclusive.
   */
  between: (rangeArg) => {
    const commaIdx = (rangeArg || '').indexOf(',');
    const minVal = commaIdx !== -1 ? Number(rangeArg.slice(0, commaIdx).trim()) : NaN;
    const maxVal = commaIdx !== -1 ? Number(rangeArg.slice(commaIdx + 1).trim()) : NaN;

    return (value, allData, element, context) => {
      const loc = resolveLocale(element, context);
      if (value === undefined || value === null || String(value).trim() === '') return null;
      const num = Number(value);
      if (isNaN(num) || isNaN(minVal) || isNaN(maxVal) || num < minVal || num > maxVal) {
        return getMessage('between', [minVal, maxVal], loc);
      }
      return null;
    };
  },

  /**
   * Factory rule: Alias for match rule.
   */
  sameAs: (targetField) => {
    return (value, allData, element, context) => {
      const loc = resolveLocale(element, context);
      if (!allData || !targetField) return null;
      return value === allData[targetField] ? null : getMessage('sameAs', [targetField], loc);
    };
  },

  /**
   * Factory rule: Safe regular expression evaluator supporting flags.
   * Syntax: regex:pattern[,flags]
   */
  regex: (ruleArg) => {
    let pattern = ruleArg || '';
    let flags = undefined;

    const lastComma = pattern.lastIndexOf(',');
    if (lastComma !== -1) {
      const possibleFlags = pattern.slice(lastComma + 1).trim();
      if (/^[gimsuy]+$/.test(possibleFlags)) {
        flags = possibleFlags;
        pattern = pattern.slice(0, lastComma);
      }
    }

    return (value, allData, element, context) => {
      const loc = resolveLocale(element, context);
      if (value === undefined || value === null || String(value).trim() === '') return null;
      try {
        const re = new RegExp(pattern, flags);
        return re.test(String(value)) ? null : getMessage('regex', [], loc);
      } catch (e) {
        return 'Invalid validation pattern configuration.';
      }
    };
  },

  /**
   * Validates string contains valid parseable JSON.
   */
  json: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (value === undefined || value === null || String(value).trim() === '') return null;
    try {
      const parsed = JSON.parse(String(value));
      return (typeof parsed === 'object' && parsed !== null) ? null : getMessage('json', [], loc);
    } catch (e) {
      return getMessage('json', [], loc);
    }
  },

  /**
   * Validates valid RFC UUID format (v1–v5).
   */
  uuid: (value, allData, element, context) => {
    const loc = resolveLocale(element, context);
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(String(value).trim()) ? null : getMessage('uuid', [], loc);
  },

  /**
   * Factory rule / validator for IPv4 or IPv6 network addresses.
   * Syntax: ip or ip:v4 or ip:v6
   */
  ip: (arg = '') => {
    const isIPv4 = (str) => {
      const p = str.split('.');
      return p.length === 4 && p.every(n => /^\d{1,3}$/.test(n) && Number(n) <= 255);
    };
    const isIPv6 = (str) => {
      if (!str || str.length < 2) return false;
      const p = str.split('::');
      if (p.length > 2) return false;
      if (p.length === 2) {
        const l = p[0] ? p[0].split(':') : [];
        const r = p[1] ? p[1].split(':') : [];
        return l.length + r.length <= 7 && [...l, ...r].every(h => /^[0-9a-fA-F]{1,4}$/.test(h));
      }
      const c = str.split(':');
      return c.length === 8 && c.every(h => /^[0-9a-fA-F]{1,4}$/.test(h));
    };

    const checkIp = (val, ver, context) => {
      const loc = resolveLocale(context);
      if (val === undefined || val === null || String(val).trim() === '') return null;
      const str = String(val).trim();
      const v = String(ver || '').toLowerCase();
      if (v === 'v4' || v === '4') {
        return isIPv4(str) ? null : getMessage('ipv4', [], loc);
      }
      if (v === 'v6' || v === '6') {
        return isIPv6(str) ? null : getMessage('ipv6', [], loc);
      }
      return (isIPv4(str) || isIPv6(str)) ? null : getMessage('ip', [], loc);
    };

    if (typeof arg === 'string' && (['v4', 'v6', '4', '6'].includes(arg.toLowerCase()))) {
      return (val, allData, element, context) => checkIp(val, arg, resolveLocale(element, context));
    }

    return checkIp(arg, '');
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