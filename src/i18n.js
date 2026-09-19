/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Internationalization (i18n) dictionary and dynamic localization engine.
 *              Supports built-in locales (en, es, fr, de, hi, zh), custom locale registration,
 *              and positional parameter interpolation.
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
  },
  es: {
    required: 'Este campo es obligatorio.',
    email: 'Por favor, introduzca una dirección de correo electrónico válida.',
    strictNumeric_empty: 'Por favor, introduzca solo números.',
    strictNumeric: 'Debe ser un número entero.',
    passwordStrict: 'Debe contener 8 caracteres, 1 minúscula, 1 mayúscula, 1 número y 1 símbolo.',
    minLength: 'Debe tener al menos {0} caracteres.',
    maxLength: 'No debe tener más de {0} caracteres.',
    match: 'Los campos no coinciden.',
    sameAs: 'Los campos no coinciden.',
    alphaNumeric: 'Solo se permiten letras y números.',
    safeText: 'Caracteres no válidos detectados.',
    urlValid: 'Por favor, introduzca una URL válida.',
    date: 'Por favor, introduzca una fecha válida.',
    dateBefore: 'La fecha debe ser anterior a {0}.',
    dateAfter: 'La fecha debe ser posterior a {0}.',
    checked: 'Debe aceptar los términos para continuar.',
    phone: 'Por favor, introduzca un número de teléfono válido.',
    alphaLetters: 'Debe contener solo letras.',
    fileType: 'Tipo de archivo no permitido. Tipos permitidos: {0}',
    fileSize: 'El archivo debe ser menor que {0}MB.',
    creditCard: 'Por favor, introduzca un número de tarjeta de crédito válido.',
    oneOf: 'Por favor, seleccione una opción válida.',
    dateTime: 'Por favor, introduzca una fecha y hora válidas.',
    dateTimeAfter: 'La fecha y hora final debe ser posterior a la fecha y hora inicial.',
    minDate: 'La fecha debe ser hoy o en el futuro.',
    maxDate: 'La fecha debe ser hoy o en el pasado.',
    minDateTime: 'La fecha y hora debe ser ahora o en el futuro.',
    maxDateTime: 'La fecha y hora debe ser ahora o en el pasado.',
    pattern: 'Por favor, coincida con el formato solicitado.',
    remote: 'La validación falló.',
    numeric: 'Debe ser un número válido.',
    min: 'Debe ser al menos {0}.',
    max: 'No debe ser mayor que {0}.',
    between: 'Debe estar entre {0} y {1}.',
    regex: 'Por favor, coincida con el formato solicitado.',
    json: 'Debe ser un JSON válido.',
    uuid: 'Debe ser un UUID válido.',
    ip: 'Debe ser una dirección IP válida.',
    ipv4: 'Debe ser una dirección IPv4 válida.',
    ipv6: 'Debe ser una dirección IPv6 válida.'
  },
  fr: {
    required: 'Ce champ est obligatoire.',
    email: 'Veuillez saisir une adresse e-mail valide.',
    strictNumeric_empty: 'Veuillez saisir uniquement des chiffres.',
    strictNumeric: 'Doit être un nombre entier.',
    passwordStrict: 'Doit contenir 8 caractères, 1 minuscule, 1 majuscule, 1 chiffre et 1 symbole.',
    minLength: 'Doit contenir au moins {0} caractères.',
    maxLength: 'Ne doit pas dépasser {0} caractères.',
    match: 'Les champs ne correspondent pas.',
    sameAs: 'Les champs ne correspondent pas.',
    alphaNumeric: 'Seuls les chiffres et les lettres sont autorisés.',
    safeText: 'Caractères non valides détectés.',
    urlValid: 'Veuillez saisir une URL valide.',
    date: 'Veuillez saisir une date valide.',
    dateBefore: 'La date doit être antérieure à {0}.',
    dateAfter: 'La date doit être postérieure à {0}.',
    checked: 'Vous devez accepter les conditions pour continuer.',
    phone: 'Veuillez saisir un numéro de téléphone valide.',
    alphaLetters: 'Ne doit contenir que des lettres.',
    fileType: 'Type de fichier non autorisé. Types autorisés: {0}',
    fileSize: 'Le fichier doit être inférieur à {0}Mo.',
    creditCard: 'Veuillez saisir un numéro de carte de crédit valide.',
    oneOf: 'Veuillez sélectionner une option valide.',
    dateTime: 'Veuillez saisir une date et une heure valides.',
    dateTimeAfter: 'La date et l heure de fin doivent être postérieures à la date et l heure de début.',
    minDate: 'La date doit être aujourd hui ou dans le futur.',
    maxDate: 'La date doit être aujourd hui ou dans le passé.',
    minDateTime: 'La date et l heure doivent être actuelles ou futures.',
    maxDateTime: 'La date et l heure doivent être actuelles ou passées.',
    pattern: 'Veuillez respecter le format demandé.',
    remote: 'La validation a échoué.',
    numeric: 'Doit être un nombre valide.',
    min: 'Doit être au moins {0}.',
    max: 'Ne doit pas dépasser {0}.',
    between: 'Doit être compris entre {0} et {1}.',
    regex: 'Veuillez respecter le format demandé.',
    json: 'Doit être un JSON valide.',
    uuid: 'Doit être un UUID valide.',
    ip: 'Doit être une adresse IP valide.',
    ipv4: 'Doit être une adresse IPv4 valide.',
    ipv6: 'Doit être une adresse IPv6 valide.'
  },
  de: {
    required: 'Dieses Feld ist erforderlich.',
    email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    strictNumeric_empty: 'Bitte geben Sie nur Zahlen ein.',
    strictNumeric: 'Muss eine ganze Zahl sein.',
    passwordStrict: 'Muss 8 Zeichen, 1 Kleinbuchstaben, 1 Großbuchstaben, 1 Zahl und 1 Symbol enthalten.',
    minLength: 'Muss mindestens {0} Zeichen lang sein.',
    maxLength: 'Darf nicht mehr als {0} Zeichen lang sein.',
    match: 'Felder stimmen nicht überein.',
    sameAs: 'Felder stimmen nicht überein.',
    alphaNumeric: 'Nur Buchstaben und Zahlen sind erlaubt.',
    safeText: 'Ungültige Zeichen erkannt.',
    urlValid: 'Bitte geben Sie eine gültige URL ein.',
    date: 'Bitte geben Sie ein gültiges Datum ein.',
    dateBefore: 'Datum muss vor {0} liegen.',
    dateAfter: 'Datum muss nach {0} liegen.',
    checked: 'Sie müssen die Bedingungen akzeptieren, um fortzufahren.',
    phone: 'Bitte geben Sie eine gültige Telefonnummer ein.',
    alphaLetters: 'Darf nur Buchstaben enthalten.',
    fileType: 'Dateityp nicht erlaubt. Erlaubte Typen: {0}',
    fileSize: 'Datei muss kleiner als {0}MB sein.',
    creditCard: 'Bitte geben Sie eine gültige Kreditkartennummer ein.',
    oneOf: 'Bitte wählen Sie eine gültige Option.',
    dateTime: 'Bitte geben Sie ein gültiges Datum und eine Uhrzeit ein.',
    dateTimeAfter: 'Enddatum und -uhrzeit müssen nach dem Startdatum und der -uhrzeit liegen.',
    minDate: 'Datum muss heute oder in der Zukunft liegen.',
    maxDate: 'Datum muss heute oder in der Vergangenheit liegen.',
    minDateTime: 'Datum und Uhrzeit müssen jetzt oder in der Zukunft liegen.',
    maxDateTime: 'Datum und Uhrzeit müssen jetzt oder in der Vergangenheit liegen.',
    pattern: 'Bitte halten Sie sich an das geforderte Format.',
    remote: 'Validierung fehlgeschlagen.',
    numeric: 'Muss eine gültige Zahl sein.',
    min: 'Muss mindestens {0} sein.',
    max: 'Darf höchstens {0} sein.',
    between: 'Muss zwischen {0} und {1} liegen.',
    regex: 'Bitte halten Sie sich an das geforderte Format.',
    json: 'Muss gültiges JSON sein.',
    uuid: 'Muss eine gültige UUID sein.',
    ip: 'Muss eine gültige IP-Adresse sein.',
    ipv4: 'Muss eine gültige IPv4-Adresse sein.',
    ipv6: 'Muss eine gültige IPv6-Adresse sein.'
  },
  hi: {
    required: 'यह फ़ील्ड आवश्यक है।',
    email: 'कृपया एक मान्य ईमेल पता दर्ज करें।',
    strictNumeric_empty: 'कृपया केवल संख्या दर्ज करें।',
    strictNumeric: 'केवल पूर्ण संख्या होनी चाहिए।',
    passwordStrict: '8 वर्ण, 1 छोटा अक्षर, 1 बड़ा अक्षर, 1 संख्या और 1 प्रतीक होना चाहिए।',
    minLength: 'कम से कम {0} वर्ण लंबा होना चाहिए।',
    maxLength: '{0} से अधिक वर्ण नहीं होने चाहिए।',
    match: 'फ़ील्ड मेल नहीं खाते।',
    sameAs: 'फ़ील्ड मेल नहीं खाते।',
    alphaNumeric: 'केवल अक्षर और संख्या की अनुमति है।',
    safeText: 'अमान्य वर्ण पाए गए।',
    urlValid: 'कृपया एक मान्य URL दर्ज करें।',
    date: 'कृपया एक मान्य तिथि दर्ज करें।',
    dateBefore: 'तिथि {0} से पहले की होनी चाहिए।',
    dateAfter: 'तिथि {0} के बाद की होनी चाहिए।',
    checked: 'जारी रखने के लिए आपको शर्तों को स्वीकार करना होगा।',
    phone: 'कृपया एक मान्य फ़ोन नंबर दर्ज करें।',
    alphaLetters: 'केवल अक्षर होने चाहिए।',
    fileType: 'फ़ाइल प्रकार की अनुमति नहीं है। अनुमत प्रकार: {0}',
    fileSize: 'फ़ाइल {0}MB से छोटी होनी चाहिए।',
    creditCard: 'कृपया एक मान्य क्रेडिट कार्ड नंबर दर्ज करें।',
    oneOf: 'कृपया एक मान्य विकल्प चुनें।',
    dateTime: 'कृपया मान्य तिथि और समय दर्ज करें।',
    dateTimeAfter: 'अंतिम तिथि और समय प्रारंभ तिथि और समय के बाद होना चाहिए।',
    minDate: 'तिथि आज या भविष्य की होनी चाहिए।',
    maxDate: 'तिथि आज या अतीत की होनी चाहिए।',
    minDateTime: 'तिथि और समय अभी या भविष्य का होना चाहिए।',
    maxDateTime: 'तिथि और समय अभी या अतीत का होना चाहिए।',
    pattern: 'कृपया अनुरोधित प्रारूप से मेल करें।',
    remote: 'सत्यापन विफल रहा।',
    numeric: 'एक मान्य संख्या होनी चाहिए।',
    min: 'कम से कम {0} होना चाहिए।',
    max: 'अधिकतम {0} होना चाहिए।',
    between: '{0} और {1} के बीच होना चाहिए।',
    regex: 'कृपया अनुरोधित प्रारूप से मेल करें।',
    json: 'मान्य JSON होना चाहिए।',
    uuid: 'मान्य UUID होना चाहिए।',
    ip: 'मान्य IP पता होना चाहिए।',
    ipv4: 'मान्य IPv4 पता होना चाहिए।',
    ipv6: 'मान्य IPv6 पता होना चाहिए।'
  },
  zh: {
    required: '此字段为必填项。',
    email: '请输入有效的电子邮件地址。',
    strictNumeric_empty: '请只输入数字。',
    strictNumeric: '必须为整数。',
    passwordStrict: '必须包含8个字符、1个小写字母、1个大写字母、1个数字和1个符号。',
    minLength: '长度必须至少为 {0} 个字符。',
    maxLength: '长度不能超过 {0} 个字符。',
    match: '字段不匹配。' ,
    sameAs: '字段不匹配。',
    alphaNumeric: '只允许输入字母和数字。',
    safeText: '检测到无效字符。',
    urlValid: '请输入有效的网址。',
    date: '请输入有效的日期。',
    dateBefore: '日期必须早于 {0}。',
    dateAfter: '日期必须晚于 {0}。',
    checked: '您必须接受条款才能继续。',
    phone: '请输入有效的电话号码。',
    alphaLetters: '只能包含字母。',
    fileType: '不允许的文件类型。允许的类型: {0}',
    fileSize: '文件必须小于 {0}MB。',
    creditCard: '请输入有效的信用卡号。',
    oneOf: '请选择一个有效选项。',
    dateTime: '请输入有效的日期和时间。',
    dateTimeAfter: '结束日期和时间必须晚于开始日期和时间。',
    minDate: '日期必须是今天或未来。',
    maxDate: '日期必须是今天或过去。',
    minDateTime: '日期和时间必须是当前或未来。',
    maxDateTime: '日期和时间必须是当前或过去。',
    pattern: '请符合要求的格式。',
    remote: '验证失败。',
    numeric: '必须是有效数字。',
    min: '必须至少为 {0}。',
    max: '不能超过 {0}。',
    between: '必须介于 {0} 和 {1} 之间。',
    regex: '请符合要求的格式。',
    json: '必须是有效的 JSON。',
    uuid: '必须是有效的 UUID。',
    ip: '必须是有效的 IP 地址。',
    ipv4: '必须是有效的 IPv4 地址。',
    ipv6: '必须是有效的 IPv6 地址。'
  }
};

const dictionaries = { ...defaultDictionaries };
let globalLocale = 'en';

/**
 * Sets the default global locale code.
 * @param {string} localeCode - Target locale identifier (e.g., 'es', 'fr').
 */
const setGlobalLocale = (localeCode) => {
  if (typeof localeCode === 'string' && localeCode.trim()) {
    globalLocale = localeCode.trim().toLowerCase();
  }
};

/**
 * Gets the current default global locale code.
 * @returns {string}
 */
const getGlobalLocale = () => globalLocale;

/**
 * Registers or extends dictionary messages for a specific locale code.
 * @param {string} localeCode - Target locale code.
 * @param {Object} messages - Dictionary mapping rule keys to message templates.
 */
const registerLocale = (localeCode, messages) => {
  if (typeof localeCode !== 'string' || !messages || typeof messages !== 'object') {
    return;
  }
  const code = localeCode.trim().toLowerCase();
  if (['__proto__', 'constructor', 'prototype'].includes(code)) return;

  dictionaries[code] = {
    ...(dictionaries[code] || {}),
    ...messages
  };
};

/**
 * Cleanly extracts label text from a <label> element, removing child input controls,
 * error text elements, and cleaning up trailing colons or asterisks.
 * @param {HTMLElement} labelNode - The label DOM node.
 * @returns {string} Clean label text.
 */
const extractCleanLabelText = (labelNode) => {
  if (!labelNode) return '';
  try {
    const clone = labelNode.cloneNode(true);
    const nestedControls = clone.querySelectorAll('input, select, textarea, button, .uv-error-text');
    nestedControls.forEach(ctrl => ctrl.remove());
    let text = clone.textContent || '';
    text = text.replace(/\s+/g, ' ').trim();
    text = text.replace(/[\s:*]+$/, '').trim();
    return text;
  } catch (e) {
    let text = labelNode.textContent || '';
    return text.replace(/\s+/g, ' ').trim().replace(/[\s:*]+$/, '').trim();
  }
};

/**
 * Derives a human-friendly field name/label from a DOM input element or validation context.
 * Precedence:
 * 1. Explicit label in context ({ label: '...' })
 * 2. Field in context ({ field: '...' })
 * 3. element's data-label attribute
 * 4. Linked <label for="inputId">
 * 5. Wrapping parent <label>
 * 6. element's name attribute
 * 7. element's placeholder attribute
 * 8. element's id attribute
 * @param {HTMLElement|string|Object} [element] - Target DOM element or string identifier.
 * @param {Object|string} [context] - Context object or locale string.
 * @returns {string} Derived friendly field name.
 */
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

  if (typeof context === 'string' && context.trim() && context.length > 3) {
    return context.trim();
  }

  return '';
};

/**
 * Dynamically interpolates template placeholders:
 * - Positional arguments: {0}, {1}, {2}, etc.
 * - Named tokens: {field}, {name}, etc.
 * @param {string} template - The message template string.
 * @param {Array<string|number>|Object} [params=[]] - Positional or key-value parameters.
 * @param {Object} [tokens={}] - Token replacements such as { field: 'Username' }.
 * @returns {string} Interpolated message string.
 */
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

/**
 * Resolves a localized message template with positional and token interpolation.
 * Falls back to 'en' dictionary if the key is not defined in the active locale.
 * @param {string} ruleKey - Identifier of the rule message.
 * @param {Array<string|number>} [params=[]] - Positional parameters ({0}, {1}, etc.).
 * @param {string} [localeCode] - Optional explicit locale override.
 * @param {Object|string} [tokens={}] - Optional tokens (e.g. { field: 'Username' }) or field name string.
 * @returns {string} Formatted localized message string.
 */
const getMessage = (ruleKey, params = [], localeCode, tokens = {}) => {
  let activeLocale = 'en';
  const normalizedTokens = typeof tokens === 'string'
    ? { field: tokens }
    : { ...(tokens || {}) };

  if (typeof localeCode === 'string') {
    activeLocale = localeCode || globalLocale || 'en';
  } else if (localeCode && typeof localeCode === 'object') {
    activeLocale = localeCode.locale || globalLocale || 'en';
    if (localeCode.field && !normalizedTokens.field) normalizedTokens.field = localeCode.field;
    if (localeCode.label && !normalizedTokens.label) normalizedTokens.label = localeCode.label;
  } else {
    activeLocale = globalLocale || 'en';
  }

  const activeCode = (activeLocale || 'en').toLowerCase();
  const dict = dictionaries[activeCode] || dictionaries['en'] || defaultDictionaries.en;
  let template = dict[ruleKey] || dictionaries.en[ruleKey] || defaultDictionaries.en[ruleKey] || ruleKey;

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

