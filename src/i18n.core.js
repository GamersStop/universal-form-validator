/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Core i18n engine containing default English dictionary only for ultra-lean (<4KB) core bundle.
 */

const defaultDictionaries = {
  en: {
    required: 'This field is required.',
    email: 'Please enter a valid email address.',
    strictNumeric_empty: 'Please enter numbers only.',
    strictNumeric: 'Must be a whole number.',
    passwordStrict: 'Must contain 8 chars, 1 lowercase, 1 uppercase, 1 number, and 1 symbol.',
    minLength: 'Must be at least {0} characters long.',
    maxLength: 'Must be no more than {0} characters long.',
    match: 'Fields do not match.',
    sameAs: 'Fields do not match.',
    alphaNumeric: 'Only letters and numbers are allowed.',
    safeText: 'Invalid characters detected.',
    urlValid: 'Please enter a valid URL.',
    date: 'Please enter a valid date.',
    dateBefore: 'Date must be before {0}.',
    dateAfter: 'Date must be after {0}.',
    checked: 'You must accept the terms to continue.',
    phone: 'Please enter a valid phone number.',
    alphaLetters: 'Must contain letters only.',
    fileType: 'File type not allowed. Allowed types: {0}',
    fileSize: 'File must be smaller than {0}MB.',
    creditCard: 'Please enter a valid credit card number.',
    oneOf: 'Please select a valid option.',
    dateTime: 'Please enter a valid date and time.',
    dateTimeAfter: 'End date and time must be after the start date and time.',
    minDate: 'Date must be today or in the future.',
    maxDate: 'Date must be today or in the past.',
    minDateTime: 'Date and time must be now or in the future.',
    maxDateTime: 'Date and time must be now or in the past.',
    pattern: 'Please match the requested format.',
    remote: 'Validation failed.',
    numeric: 'Must be a valid number.',
    min: 'Must be at least {0}.',
    max: 'Must be no more than {0}.',
    between: 'Must be between {0} and {1}.',
    regex: 'Please match the requested format.',
    json: 'Must be valid JSON.',
    uuid: 'Must be a valid UUID.',
    ip: 'Must be a valid IP address.',
    ipv4: 'Must be a valid IPv4 address.',
    ipv6: 'Must be a valid IPv6 address.'
  }
};

const dictionaries = { ...defaultDictionaries };
let globalLocale = 'en';

const setGlobalLocale = (localeCode) => {
  if (typeof localeCode === 'string' && localeCode.trim()) {
    globalLocale = localeCode.trim().toLowerCase();
  }
};

const getGlobalLocale = () => globalLocale;

const registerLocale = (localeCode, messages) => {
  if (typeof localeCode !== 'string' || !messages || typeof messages !== 'object') return;
  const code = localeCode.trim().toLowerCase();
  if (['__proto__', 'constructor', 'prototype'].includes(code)) return;
  dictionaries[code] = { ...(dictionaries[code] || {}), ...messages };
};

const extractCleanLabelText = (labelNode) => {
  if (!labelNode) return '';
  try {
    const clone = labelNode.cloneNode(true);
    const nested = clone.querySelectorAll('input, select, textarea, button, .uv-error-text');
    nested.forEach(ctrl => ctrl.remove());
    let text = clone.textContent || '';
    return text.replace(/\s+/g, ' ').replace(/[\s:*]+$/, '').trim();
  } catch (e) {
    return (labelNode.textContent || '').replace(/\s+/g, ' ').replace(/[\s:*]+$/, '').trim();
  }
};

const deriveFieldLabel = (element, context) => {
  if (context && typeof context === 'object') {
    if (typeof context.label === 'string' && context.label.trim()) return context.label.trim();
    if (typeof context.field === 'string' && context.field.trim()) return context.field.trim();
  }
  if (element) {
    if (typeof element === 'string' && element.trim()) return element.trim();
    if (typeof element === 'object') {
      if (typeof element.label === 'string' && element.label.trim()) return element.label.trim();
      if (typeof element.field === 'string' && element.field.trim()) return element.field.trim();
      if (typeof element.getAttribute === 'function') {
        const dataLabel = element.getAttribute('data-label');
        if (dataLabel && dataLabel.trim()) return dataLabel.trim();
        const id = element.id || element.getAttribute('id');
        const doc = element.ownerDocument || (typeof document !== 'undefined' ? document : null);
        if (id && doc && typeof doc.querySelector === 'function') {
          const labelEl = doc.querySelector(`label[for="${id}"]`);
          if (labelEl) {
            const labelText = extractCleanLabelText(labelEl);
            if (labelText) return labelText;
          }
        }
        const parentLabel = typeof element.closest === 'function' ? element.closest('label') : null;
        if (parentLabel) {
          const labelText = extractCleanLabelText(parentLabel);
          if (labelText) return labelText;
        }
        const name = element.getAttribute('name') || element.name;
        if (name && name.trim()) return name.trim();
        const placeholder = element.getAttribute('placeholder');
        if (placeholder && placeholder.trim()) return placeholder.trim();
        if (id && id.trim()) return id.trim();
      }
    }
  }
  return '';
};

const interpolate = (template, params = [], tokens = {}) => {
  if (typeof template !== 'string') return '';
  let result = template;
  if (Array.isArray(params)) {
    params.forEach((param, idx) => {
      result = result.replace(new RegExp(`\\{${idx}\\}`, 'g'), String(param));
    });
  } else if (params !== null && typeof params === 'object') {
    Object.keys(params).forEach(key => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(params[key]));
    });
  }
  if (tokens && typeof tokens === 'object') {
    Object.keys(tokens).forEach(key => {
      if (tokens[key] !== undefined && tokens[key] !== null) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(tokens[key]));
      }
    });
  }
  return result;
};

const getMessage = (ruleKey, params = [], localeCode, tokens = {}) => {
  let activeLocale = 'en';
  const normalizedTokens = typeof tokens === 'string' ? { field: tokens } : { ...(tokens || {}) };
  if (typeof localeCode === 'string') {
    activeLocale = localeCode || globalLocale || 'en';
  } else if (localeCode && typeof localeCode === 'object') {
    activeLocale = localeCode.locale || globalLocale || 'en';
    if (localeCode.field && !normalizedTokens.field) normalizedTokens.field = localeCode.field;
    if (localeCode.label && !normalizedTokens.label) normalizedTokens.label = localeCode.label;
  }
  const activeCode = (activeLocale || 'en').toLowerCase();
  const dict = dictionaries[activeCode] || dictionaries['en'] || defaultDictionaries.en;
  const template = dict[ruleKey] || dictionaries.en[ruleKey] || defaultDictionaries.en[ruleKey] || ruleKey;
  if (!normalizedTokens.field && normalizedTokens.label) {
    normalizedTokens.field = normalizedTokens.label;
  }
  return interpolate(template, params, normalizedTokens);
};

module.exports = {
  getGlobalLocale,
  setGlobalLocale,
  registerLocale,
  getMessage,
  interpolate,
  deriveFieldLabel,
  extractCleanLabelText,
  dictionaries
};
