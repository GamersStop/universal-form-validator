/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Unit tests for Internationalization (i18n) and Multi-Locale Dictionary Engine.
 *              Validates built-in locales (en, es, fr, de, hi, zh), global and instance switching,
 *              custom dictionary registrations, fallback resolution, and parameter interpolation.
 * 
 * @jest-environment jsdom
 */

const { UniversalValidator } = require('../src/validator');
const { rules } = require('../src/rules');
const { getMessage, registerLocale, getGlobalLocale, setGlobalLocale, interpolate, deriveFieldLabel } = require('../src/i18n');

describe('Internationalization (i18n) & Multi-Locale Engine', () => {
  beforeEach(() => {
    UniversalValidator.setLocale('en');
  });

  afterEach(() => {
    UniversalValidator.setLocale('en');
  });

  describe('Default Locale & Global Locale Switching', () => {
    test('defaults to English (en)', () => {
      expect(UniversalValidator.getLocale()).toBe('en');
      const validator = new UniversalValidator({ name: ['required'] });
      expect(validator.getLocale()).toBe('en');
      const result = validator.validate({ name: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('This field is required.');
    });

    test('switches global locale and affects validation error messages', () => {
      UniversalValidator.setLocale('es');
      expect(UniversalValidator.getLocale()).toBe('es');

      const validator = new UniversalValidator({
        name: ['required'],
        email: ['email']
      });

      const result = validator.validate({ name: '', email: 'invalid-email' });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Este campo es obligatorio.');
      expect(result.errors.email).toBe('Por favor, introduzca una dirección de correo electrónico válida.');
    });

    test('normalizes locale code strings (case insensitivity and trimming)', () => {
      UniversalValidator.setLocale('  FR  ');
      expect(UniversalValidator.getLocale()).toBe('fr');

      const validator = new UniversalValidator({ name: ['required'] });
      const result = validator.validate({ name: '' });
      expect(result.errors.name).toBe('Ce champ est obligatoire.');
    });
  });

  describe('Instance-Level Locale Configuration & Overrides', () => {
    test('allows instance locale override via constructor options', () => {
      UniversalValidator.setLocale('en');

      const esValidator = new UniversalValidator({ name: ['required'] }, { locale: 'es' });
      const deValidator = new UniversalValidator({ name: ['required'] }, { locale: 'de' });

      expect(esValidator.getLocale()).toBe('es');
      expect(deValidator.getLocale()).toBe('de');

      const esResult = esValidator.validate({ name: '' });
      const deResult = deValidator.validate({ name: '' });

      expect(esResult.errors.name).toBe('Este campo es obligatorio.');
      expect(deResult.errors.name).toBe('Dieses Feld ist erforderlich.');
    });

    test('allows dynamic instance locale change via setLocale()', () => {
      const validator = new UniversalValidator({ name: ['required'] });
      expect(validator.validate({ name: '' }).errors.name).toBe('This field is required.');

      validator.setLocale('fr');
      expect(validator.getLocale()).toBe('fr');
      expect(validator.validate({ name: '' }).errors.name).toBe('Ce champ est obligatoire.');

      validator.setLocale('zh');
      expect(validator.getLocale()).toBe('zh');
      expect(validator.validate({ name: '' }).errors.name).toBe('此字段为必填项。');
    });

    test('instance locale takes precedence over global locale', () => {
      UniversalValidator.setLocale('es');

      const validator = new UniversalValidator({ name: ['required'] }, { locale: 'de' });
      const result = validator.validate({ name: '' });

      expect(result.errors.name).toBe('Dieses Feld ist erforderlich.');
    });

    test('async validation respects instance and global locales', async () => {
      const validator = new UniversalValidator({ name: ['required'] }, { locale: 'hi' });
      const result = await validator.validateAsync({ name: '' });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('यह फ़ील्ड आवश्यक है।');
    });
  });

  describe('Built-in 6 Standard Locales Verification', () => {
    const localeExpectations = [
      {
        locale: 'en',
        required: 'This field is required.',
        email: 'Please enter a valid email address.',
        minLength: 'Must be at least 5 characters long.',
        numeric: 'Must be a valid number.',
        between: 'Must be between 10 and 20.'
      },
      {
        locale: 'es',
        required: 'Este campo es obligatorio.',
        email: 'Por favor, introduzca una dirección de correo electrónico válida.',
        minLength: 'Debe tener al menos 5 caracteres.',
        numeric: 'Debe ser un número válido.',
        between: 'Debe estar entre 10 y 20.'
      },
      {
        locale: 'fr',
        required: 'Ce champ est obligatoire.',
        email: 'Veuillez saisir une adresse e-mail valide.',
        minLength: 'Doit contenir au moins 5 caractères.',
        numeric: 'Doit être un nombre valide.',
        between: 'Doit être compris entre 10 et 20.'
      },
      {
        locale: 'de',
        required: 'Dieses Feld ist erforderlich.',
        email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        minLength: 'Muss mindestens 5 Zeichen lang sein.',
        numeric: 'Muss eine gültige Zahl sein.',
        between: 'Muss zwischen 10 und 20 liegen.'
      },
      {
        locale: 'hi',
        required: 'यह फ़ील्ड आवश्यक है।',
        email: 'कृपया एक मान्य ईमेल पता दर्ज करें।',
        minLength: 'कम से कम 5 वर्ण लंबा होना चाहिए।',
        numeric: 'एक मान्य संख्या होनी चाहिए।',
        between: '10 और 20 के बीच होना चाहिए।'
      },
      {
        locale: 'zh',
        required: '此字段为必填项。',
        email: '请输入有效的电子邮件地址。',
        minLength: '长度必须至少为 5 个字符。',
        numeric: '必须是有效数字。',
        between: '必须介于 10 和 20 之间。'
      }
    ];

    localeExpectations.forEach(({ locale, required, email, minLength, numeric, between }) => {
      test(`properly translates standard rules for locale '${locale}'`, () => {
        const schema = {
          name: ['required'],
          email: ['email'],
          pass: ['minLength:5'],
          age: ['numeric', 'between:10,20']
        };

        const validator = new UniversalValidator(schema, { locale });
        const resReq = validator.validate({ name: '' });
        expect(resReq.errors.name).toBe(required);

        const resEmail = validator.validate({ email: 'bad' });
        expect(resEmail.errors.email).toBe(email);

        const resMin = validator.validate({ pass: 'abcd' });
        expect(resMin.errors.pass).toBe(minLength);

        const resNum = validator.validate({ age: 'abc' });
        expect(resNum.errors.age).toBe(numeric);

        const resBet = validator.validate({ age: '5' });
        expect(resBet.errors.age).toBe(between);
      });
    });
  });

  describe('Fallback Handling', () => {
    test('falls back cleanly to English (en) for completely unknown locale', () => {
      UniversalValidator.setLocale('unknown_lang');

      const validator = new UniversalValidator({ name: ['required'] });
      const result = validator.validate({ name: '' });

      expect(result.errors.name).toBe('This field is required.');
    });

    test('falls back to English message if a key is missing in custom registered locale', () => {
      UniversalValidator.registerLocale('it', {
        required: 'Questo campo è obbligatorio.'
        // 'email' is deliberately omitted
      });

      const validator = new UniversalValidator({
        name: ['required'],
        email: ['email']
      }, { locale: 'it' });

      const res = validator.validate({ name: '', email: 'not-an-email' });
      expect(res.errors.name).toBe('Questo campo è obbligatorio.');
      expect(res.errors.email).toBe('Please enter a valid email address.');
    });
  });

  describe('Custom Locale Registration & Extension', () => {
    test('registers custom locale with UniversalValidator.registerLocale()', () => {
      UniversalValidator.registerLocale('pt', {
        required: 'Este campo é obrigatório.',
        email: 'Por favor, insira um endereço de e-mail válido.',
        minLength: 'Deve ter pelo menos {0} caracteres.'
      });

      const validator = new UniversalValidator({
        name: ['required'],
        email: ['email'],
        code: ['minLength:4']
      }, { locale: 'pt' });

      const result = validator.validate({ name: '', email: 'bad', code: 'abc' });
      expect(result.errors.name).toBe('Este campo é obrigatório.');
      expect(result.errors.email).toBe('Por favor, insira um endereço de e-mail válido.');
      expect(result.errors.code).toBe('Deve ter pelo menos 4 caracteres.');
    });

    test('prevents prototype pollution when registering locales', () => {
      UniversalValidator.registerLocale('__proto__', { poll: 'polluted' });
      UniversalValidator.registerLocale('constructor', { poll: 'polluted' });
      UniversalValidator.registerLocale('prototype', { poll: 'polluted' });

      expect(({}).poll).toBeUndefined();
    });

    test('safely handles non-object or non-string registration arguments', () => {
      expect(() => {
        UniversalValidator.registerLocale(null, {});
        UniversalValidator.registerLocale('pt', null);
        UniversalValidator.registerLocale(123, 'invalid');
      }).not.toThrow();
    });
  });

  describe('DOM data-locale Integration', () => {
    test('resolves locale from element data-locale attribute', () => {
      const input = document.createElement('input');
      input.name = 'testField';
      input.setAttribute('data-locale', 'fr');

      const result = rules.required('', {}, input);
      expect(result).toBe('Ce champ est obligatoire.');
    });

    test('resolves locale from parent form data-locale attribute', () => {
      const form = document.createElement('form');
      form.setAttribute('data-locale', 'de');

      const input = document.createElement('input');
      input.name = 'emailField';
      form.appendChild(input);

      const result = rules.email('invalid-val', {}, input);
      expect(result).toBe('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    });
  });

  describe('Dynamic Token Interpolation ({field}, {0}, {1})', () => {
    describe('Friendly Name Label Derivation (deriveFieldLabel)', () => {
      test('derives label from data-label attribute on input element', () => {
        const input = document.createElement('input');
        input.name = 'user_password';
        input.setAttribute('data-label', 'Account Password');

        expect(deriveFieldLabel(input)).toBe('Account Password');
      });

      test('derives label from linked <label for="id"> element', () => {
        const label = document.createElement('label');
        label.setAttribute('for', 'email_input');
        label.textContent = 'Email Address';
        document.body.appendChild(label);

        const input = document.createElement('input');
        input.id = 'email_input';
        input.name = 'email';
        document.body.appendChild(input);

        expect(deriveFieldLabel(input)).toBe('Email Address');
        label.remove();
        input.remove();
      });

      test('cleans trailing colons and asterisks from label text', () => {
        const label = document.createElement('label');
        label.setAttribute('for', 'phone_input');
        label.innerHTML = 'Phone Number: <span class="required">*</span>';
        document.body.appendChild(label);

        const input = document.createElement('input');
        input.id = 'phone_input';
        input.name = 'phone';
        document.body.appendChild(input);

        expect(deriveFieldLabel(input)).toBe('Phone Number');
        label.remove();
        input.remove();
      });

      test('derives label from wrapping parent <label> element', () => {
        const label = document.createElement('label');
        label.textContent = 'Date of Birth: ';

        const input = document.createElement('input');
        input.name = 'dob';
        label.appendChild(input);
        document.body.appendChild(label);

        expect(deriveFieldLabel(input)).toBe('Date of Birth');
        label.remove();
      });

      test('falls back to input name attribute when no label is present', () => {
        const input = document.createElement('input');
        input.name = 'confirm_code';

        expect(deriveFieldLabel(input)).toBe('confirm_code');
      });

      test('falls back to placeholder attribute when name is absent', () => {
        const input = document.createElement('input');
        input.setAttribute('placeholder', 'Enter Voucher Code');

        expect(deriveFieldLabel(input)).toBe('Enter Voucher Code');
      });

      test('derives label from context options in programmatic validation', () => {
        expect(deriveFieldLabel(null, { field: 'pwd', label: 'Secret Key' })).toBe('Secret Key');
        expect(deriveFieldLabel(null, { field: 'username' })).toBe('username');
      });
    });

    describe('Interpolation Engine (interpolate & getMessage)', () => {
      test('interpolates {0}, {1} positional arguments', () => {
        const template = 'Must be between {0} and {1}.';
        expect(interpolate(template, [10, 20])).toBe('Must be between 10 and 20.');
      });

      test('interpolates {field} named token and positional arguments simultaneously', () => {
        const template = '{field} must be at least {0} characters long.';
        const result = interpolate(template, [8], { field: 'Password' });
        expect(result).toBe('Password must be at least 8 characters long.');
      });

      test('replaces multiple occurrences of {field} and arguments', () => {
        const template = '{field} is required. Please check your {field} ({0} chars).';
        const result = interpolate(template, [5], { field: 'PIN' });
        expect(result).toBe('PIN is required. Please check your PIN (5 chars).');
      });

      test('handles non-string templates safely', () => {
        expect(interpolate(null)).toBe('');
        expect(interpolate(undefined)).toBe('');
      });

      test('getMessage formats tokens and active locale templates seamlessly', () => {
        UniversalValidator.registerLocale('en', {
          minLength: '{field} must be at least {0} characters long.'
        });

        const msg = getMessage('minLength', [8], 'en', { field: 'Password' });
        expect(msg).toBe('Password must be at least 8 characters long.');
      });
    });

    describe('Programmatic UniversalValidator Integration with Labels', () => {
      test('supports constructor options.labels with token-interpolated templates', () => {
        UniversalValidator.registerLocale('en', {
          minLength: '{field} must be at least {0} characters long.',
          between: '{field} must be between {0} and {1}.'
        });

        const validator = new UniversalValidator({
          password: ['minLength:8'],
          age: ['between:18,65']
        }, {
          labels: {
            password: 'Password',
            age: 'Age'
          }
        });

        const res = validator.validate({ password: 'abc', age: 10 });
        expect(res.isValid).toBe(false);
        expect(res.errors.password).toBe('Password must be at least 8 characters long.');
        expect(res.errors.age).toBe('Age must be between 18 and 65.');
      });

      test('supports dynamic setLabel and setLabels methods', () => {
        UniversalValidator.registerLocale('en', {
          required: '{field} is required.'
        });

        const validator = new UniversalValidator({
          username: ['required']
        });

        // Default falls back to field name
        expect(validator.validate({ username: '' }).errors.username).toBe('username is required.');

        // Set label dynamically
        validator.setLabel('username', 'Username Handle');
        expect(validator.validate({ username: '' }).errors.username).toBe('Username Handle is required.');

        // Batch set labels
        validator.setLabels({ username: 'Display Name' });
        expect(validator.validate({ username: '' }).errors.username).toBe('Display Name is required.');
      });

      test('interpolates {field} and positional args in async validation', async () => {
        UniversalValidator.registerLocale('en', {
          minLength: '{field} must be at least {0} characters long.'
        });

        const validator = new UniversalValidator({
          token: ['minLength:6']
        }, {
          labels: { token: 'Security Token' }
        });

        const res = await validator.validateAsync({ token: '123' });
        expect(res.isValid).toBe(false);
        expect(res.errors.token).toBe('Security Token must be at least 6 characters long.');
      });
    });

    describe('Zero-JS DOM Auto-Bind Dynamic Token Interpolation', () => {
      test('interpolates {field} and {0} in data-msg-* attributes using data-label', () => {
        const form = document.createElement('form');
        form.setAttribute('data-validator', '');
        form.setAttribute('data-trigger', 'blur');

        const input = document.createElement('input');
        input.name = 'pwd';
        input.setAttribute('data-label', 'Password');
        input.setAttribute('data-rules', 'minLength:8');
        input.setAttribute('data-msg-minlength', '{field} must be at least {0} characters long.');
        form.appendChild(input);
        document.body.appendChild(form);

        const { initAutoBind } = require('../src/auto-bind');
        initAutoBind();

        input.value = 'short';
        input.dispatchEvent(new Event('blur'));

        const errorEl = form.querySelector('.uv-error-text');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('Password must be at least 8 characters long.');

        form.remove();
      });

      test('interpolates {field} from linked <label> when data-label is not specified', () => {
        const form = document.createElement('form');
        form.setAttribute('data-validator', '');
        form.setAttribute('data-trigger', 'blur');

        const label = document.createElement('label');
        label.setAttribute('for', 'user_email_input');
        label.textContent = 'Email Address';
        form.appendChild(label);

        const input = document.createElement('input');
        input.id = 'user_email_input';
        input.name = 'user_email';
        input.setAttribute('data-rules', 'required');
        input.setAttribute('data-msg-required', '{field} cannot be left blank.');
        form.appendChild(input);
        document.body.appendChild(form);

        const { initAutoBind } = require('../src/auto-bind');
        initAutoBind();

        input.value = '';
        input.dispatchEvent(new Event('blur'));

        const errorEl = form.querySelector('.uv-error-text');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('Email Address cannot be left blank.');

        form.remove();
      });
    });
  });
});
