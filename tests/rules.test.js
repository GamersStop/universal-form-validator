/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Comprehensive Jest unit test suite for the core validation rules dictionary. 
 *              Validates built-in constraints, factory parameter behaviors, datetime checks, 
 *              regex patterns, and security hardening measures like prototype pollution blocks.
 */

const { rules } = require('../src/rules');

describe('Validation Rules Dictionary', () => {

  /**
   * Verifies required rule behavior for empty states, whitespace strings, and valid text payloads.
   */
  test('required rule catches empty strings', () => {
    expect(rules.required('')).toBe('This field is required.');
    expect(rules.required('   ')).toBe('This field is required.'); // catches spaces only
  });

  test('required rule passes valid text', () => {
    expect(rules.required('hello')).toBeNull(); // null means it passed
  });

  test('required rule handles array values (e.g. checkbox groups)', () => {
    expect(rules.required([])).toBe('This field is required.');
    expect(rules.required(['option1'])).toBeNull();
  });

  /**
   * Verifies email validation constraints.
   */
  test('email rule catches bad emails', () => {
    expect(rules.email('not-an-email')).toBe('Please enter a valid email address.');
  });

  test('email rule passes good emails', () => {
    expect(rules.email('test@example.com')).toBeNull();
  });

  /**
   * Verifies strict numeric integer restrictions.
   */
  test('strictNumeric rule catches decimals and text', () => {
    expect(rules.strictNumeric('10.5')).toBe('Must be a whole number.');
    expect(rules.strictNumeric('abc')).toBe('Must be a whole number.');
  });

  /**
   * Verifies complex password policy enforcement.
   */
  test('validates strict passwords correctly', () => {
    // Invalid passwords
    expect(rules.passwordStrict('weak')).not.toBeNull();
    expect(rules.passwordStrict('NOLOWER1!')).not.toBeNull();
    expect(rules.passwordStrict('nouppercase1!')).not.toBeNull();
    expect(rules.passwordStrict('NoNumber!')).not.toBeNull();
    expect(rules.passwordStrict('NoSymbol1')).not.toBeNull();

    // Valid password
    expect(rules.passwordStrict('StrongP@ss1')).toBeNull();
  });

  /**
   * Verifies alphanumeric boundary restrictions.
   */
  test('alphaNumeric rule blocks special characters', () => {
    expect(rules.alphaNumeric('Hello123')).toBeNull();
    expect(rules.alphaNumeric('Hello_123!')).not.toBeNull();
    expect(rules.alphaNumeric('special@char')).not.toBeNull();
  });

  /**
   * Verifies string length factor builders (min/max bounds).
   */
  test('minLength rule enforces minimum boundaries', () => {
    const minCheck = rules.minLength(5);
    expect(minCheck('abc')).not.toBeNull();
    expect(minCheck('abcdef')).toBeNull();
  });

  test('maxLength rule enforces maximum boundaries', () => {
    const maxCheck = rules.maxLength(5);
    expect(maxCheck('abcdef')).not.toBeNull();
    expect(maxCheck('abc')).toBeNull();
  });

  /**
   * Verifies cross-field matching behavior (e.g., password confirmation fields).
   */
  test('match rule compares two fields correctly', () => {
    const matchCheck = rules.match('password');
    const allData = { password: 'Secret123!' };
    expect(matchCheck('Secret123!', allData)).toBeNull();
    expect(matchCheck('Wrong123!', allData)).not.toBeNull();
  });

  /**
   * Verifies basic injection vector filtering.
   */
  test('safeText rule blocks basic injection characters', () => {
    expect(rules.safeText('Hello World 123')).toBeNull();
    expect(rules.safeText('<script>alert("hi")</script>')).toBe('Invalid characters detected.');
    expect(rules.safeText("O'Reilly; DROP TABLE users;")).toBe('Invalid characters detected.');
    expect(rules.safeText('admin --')).toBe('Invalid characters detected.');
  });

  /**
   * Verifies protocol-restricted URL formatting constraints.
   */
  test('urlValid rule catches invalid URLs and passes valid ones', () => {
    expect(rules.urlValid('https://example.com')).toBeNull();
    expect(rules.urlValid('http://localhost:3000')).toBeNull();
    expect(rules.urlValid('not-a-url')).toBe('Please enter a valid URL.');
    expect(rules.urlValid('ftp://example.com')).toBe('Please enter a valid URL.');
  });

  /**
   * Verifies standard date and cross-field chronological comparisons.
   */
  test('date rule validates date strings correctly', () => {
    expect(rules.date('2026-06-06')).toBeNull();
    expect(rules.date('not-a-date')).toBe('Please enter a valid date.');
  });

  test('dateBefore rule checks chronological order', () => {
    const checkBefore = rules.dateBefore('endDate');
    const allData = { endDate: '2026-12-31' };

    expect(checkBefore('2026-01-01', allData)).toBeNull();
    expect(checkBefore('2027-01-01', allData)).not.toBeNull();
  });

  test('dateAfter rule checks chronological order', () => {
    const checkAfter = rules.dateAfter('startDate');
    const allData = { startDate: '2026-01-01' };

    expect(checkAfter('2026-12-31', allData)).toBeNull();
    expect(checkAfter('2025-01-01', allData)).not.toBeNull();
  });

  /**
   * Verifies standard phone number formatting constraints.
   */
  test('phone rule validates phone numbers correctly', () => {
    expect(rules.phone('123-456-7890')).toBeNull();
    expect(rules.phone('(123) 456-7890')).toBeNull();
    expect(rules.phone('+19876543210')).toBeNull();
    expect(rules.phone('abc-def-ghij')).toBe('Please enter a valid phone number.');
  });

  /**
   * Verifies alphabetic-only character constraints.
   */
  test('alphaLetters rule blocks numbers and special characters', () => {
    expect(rules.alphaLetters('John Doe')).toBeNull();
    expect(rules.alphaLetters('John123')).toBe('Must contain letters only.');
    expect(rules.alphaLetters('John!')).toBe('Must contain letters only.');
  });

  /**
   * Verifies file type extension and size limit boundary validations.
   */
  test('fileType rule validates extensions correctly', () => {
    const checkType = rules.fileType('.png,.jpg');
    const validFiles = [{ name: 'image.png', type: 'image/png' }];
    const invalidFiles = [{ name: 'document.pdf', type: 'application/pdf' }];

    expect(checkType(validFiles)).toBeNull();
    expect(checkType(invalidFiles)).toBe('File type not allowed. Allowed types: .png,.jpg');
  });

  test('fileSize rule validates size limits correctly', () => {
    const checkSize = rules.fileSize('2');
    const validFiles = [{ name: 'small.jpg', size: 1024 * 1024 * 1.5 }];
    const invalidFiles = [{ name: 'large.jpg', size: 1024 * 1024 * 3 }];
    expect(checkSize(validFiles)).toBeNull();
    expect(checkSize(invalidFiles)).toBe('File must be smaller than 2MB.');
  });

  /**
   * Verifies credit card number verification via the Luhn algorithm.
   */
  test('creditCard rule validates via Luhn algorithm', () => {
    expect(rules.creditCard('4012888888881881')).toBeNull();
    expect(rules.creditCard('4012888888881882')).toBe('Please enter a valid credit card number.');
    expect(rules.creditCard('abc-123')).toBe('Please enter a valid credit card number.');
  });

  /**
   * Verifies whitelisted option selection choices (oneOf).
   */
  test('oneOf rule validates allowed values', () => {
    const validatorFn = rules.oneOf(['apple', 'banana', 'orange']);

    expect(validatorFn('apple')).toBeNull();
    expect(validatorFn('banana')).toBeNull();
    expect(validatorFn('grape')).toBe('Please select a valid option.');
  });

  /**
   * Verifies datetime formatting and sequential date-time boundaries.
   */
  test('dateTime rule validates date and time strings', () => {
    expect(rules.dateTime('2026-06-01T14:30')).toBeNull();
    expect(rules.dateTime('2026-06-01 14:30:00')).toBeNull();
    expect(rules.dateTime('invalid-datetime')).toBe('Please enter a valid date and time.');
  });

  test('dateTimeAfter rule validates end datetime comes after start datetime', () => {
    const validatorFn = rules.dateTimeAfter('startDateTime');
    const validData = { startDateTime: '2026-06-01T10:00' };
    const invalidData = { startDateTime: '2026-06-01T14:00' };
    expect(validatorFn('2026-06-01T12:00', validData)).toBeNull();
    expect(validatorFn('2026-06-01T12:00', invalidData)).toBe('End date and time must be after the start date and time.');
  });

  /**
   * Verifies system date (sysdate) min/max date-time comparisons and malformed input handling.
   */
  test('minDate and maxDate rules validate against sysdate', () => {
    const dFuture = new Date();
    dFuture.setDate(dFuture.getDate() + 2);
    const futureDate = `${dFuture.getFullYear()}-${String(dFuture.getMonth() + 1).padStart(2, '0')}-${String(dFuture.getDate()).padStart(2, '0')}`;

    const dPast = new Date();
    dPast.setDate(dPast.getDate() - 2);
    const pastDate = `${dPast.getFullYear()}-${String(dPast.getMonth() + 1).padStart(2, '0')}-${String(dPast.getDate()).padStart(2, '0')}`;

    expect(rules.minDate(futureDate)).toBeNull();
    expect(rules.minDate(pastDate)).toBe('Date must be today or in the future.');

    expect(rules.maxDate(pastDate)).toBeNull();
    expect(rules.maxDate(futureDate)).toBe('Date must be today or in the past.');
  });

  test('minDate and maxDate handle malformed dates gracefully', () => {
    expect(rules.minDate('not-a-date')).toBe('Please enter a valid date.');
    expect(rules.maxDate('invalid')).toBe('Please enter a valid date.');
  });

  /**
   * Verifies custom regex pattern matching escape hatch.
   */
  test('pattern rule validates strings against regular expressions', () => {
    const validatorFn = rules.pattern('^EMP-\\d{4}$');
    expect(validatorFn('EMP-5678')).toBeNull();
    expect(validatorFn('EMP-ABCD')).toBe('Please match the requested format.');
  });

  /**
   * Verifies security hardening against prototype pollution attempts during rule registration.
   */
  test('register blocks prototype pollution attempts', () => {
    expect(() => rules.register('__proto__', () => { })).toThrow('SecurityError');
    expect(() => rules.register('constructor', () => { })).toThrow('SecurityError');
    expect(() => rules.register('prototype', () => { })).toThrow('SecurityError');
  });

  /**
   * Phase 2: Remote asynchronous validation rule
   */
  describe('remote rule', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('passes when remote endpoint returns valid: true', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ valid: true })
      });

      const validatorFn = rules.remote('https://api.example.com/check-user,username');
      const result = await validatorFn('new_user');
      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/check-user?username=new_user',
        expect.objectContaining({ method: 'GET' })
      );
    });

    test('fails when remote endpoint returns valid: false with custom message', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ valid: false, message: 'Username is already taken.' })
      });

      const validatorFn = rules.remote('https://api.example.com/check-user');
      const result = await validatorFn('existing_user');
      expect(result).toBe('Username is already taken.');
    });

    test('fails when remote endpoint returns HTTP 400 with error message', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Invalid domain name.' })
      });

      const validatorFn = rules.remote('https://api.example.com/check-domain');
      const result = await validatorFn('bad.domain');
      expect(result).toBe('Invalid domain name.');
    });

    test('bypasses remote validation for empty strings', async () => {
      global.fetch = jest.fn();
      const validatorFn = rules.remote('https://api.example.com/check');
      const result = await validatorFn('');
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  /**
   * Phase 2: Conditional rules (requiredIf, requiredWith, requiredWithout)
   */
  describe('Conditional Rules', () => {
    test('requiredIf enforces validation only when target field matches expected value', () => {
      const validatorFn = rules.requiredIf('paymentMethod,card');

      // Target field matches 'card' -> field is required
      expect(validatorFn('', { paymentMethod: 'card' })).toBe('This field is required.');
      expect(validatorFn('4111222233334444', { paymentMethod: 'card' })).toBeNull();

      // Target field is 'cash' -> field is optional
      expect(validatorFn('', { paymentMethod: 'cash' })).toBeNull();
      expect(validatorFn(undefined, { paymentMethod: 'cash' })).toBeNull();
    });

    test('requiredWith enforces validation when target field has any non-empty value', () => {
      const validatorFn = rules.requiredWith('referralCode');

      // Target field has value -> field is required
      expect(validatorFn('', { referralCode: 'FRIEND20' })).toBe('This field is required.');
      expect(validatorFn('John', { referralCode: 'FRIEND20' })).toBeNull();

      // Target field is empty -> field is optional
      expect(validatorFn('', { referralCode: '' })).toBeNull();
      expect(validatorFn('', {})).toBeNull();
    });

    test('requiredWithout enforces validation when target field is missing or empty', () => {
      const validatorFn = rules.requiredWithout('phone');

      // Phone is empty -> email is required
      expect(validatorFn('', { phone: '' })).toBe('This field is required.');
      expect(validatorFn('test@example.com', { phone: '' })).toBeNull();

      // Phone is provided -> email is optional
      expect(validatorFn('', { phone: '1234567890' })).toBeNull();
    });
  });

  /**
   * Phase 2: Expanded Enterprise Ruleset
   */
  describe('Enterprise Ruleset', () => {
    test('numeric rule validates integers, negative numbers, and decimals', () => {
      expect(rules.numeric('123')).toBeNull();
      expect(rules.numeric('-45.67')).toBeNull();
      expect(rules.numeric('0')).toBeNull();
      expect(rules.numeric('')).toBeNull(); // optional if empty

      expect(rules.numeric('abc')).toBe('Must be a valid number.');
      expect(rules.numeric('12a3')).toBe('Must be a valid number.');
    });

    test('min and max rules validate numeric bounds', () => {
      const min18 = rules.min(18);
      expect(min18('18')).toBeNull();
      expect(min18('21')).toBeNull();
      expect(min18('17')).toBe('Must be at least 18.');
      expect(min18('')).toBeNull();

      const max100 = rules.max(100);
      expect(max100('100')).toBeNull();
      expect(max100('50')).toBeNull();
      expect(max100('101')).toBe('Must be no more than 100.');
    });

    test('between rule validates numeric range inclusive', () => {
      const between10and50 = rules.between('10,50');
      expect(between10and50('10')).toBeNull();
      expect(between10and50('30')).toBeNull();
      expect(between10and50('50')).toBeNull();
      expect(between10and50('')).toBeNull();

      expect(between10and50('9')).toBe('Must be between 10 and 50.');
      expect(between10and50('51')).toBe('Must be between 10 and 50.');
    });

    test('sameAs rule checks equivalence with another field', () => {
      const sameAsPassword = rules.sameAs('password');
      expect(sameAsPassword('secret', { password: 'secret' })).toBeNull();
      expect(sameAsPassword('different', { password: 'secret' })).toBe('Fields do not match.');
    });

    test('regex rule validates patterns with optional flags', () => {
      const caseInsensitive = rules.regex('^[a-z]+$,i');
      expect(caseInsensitive('HelloWorld')).toBeNull();
      expect(caseInsensitive('123')).toBe('Please match the requested format.');

      const strictDigits = rules.regex('^\\d{4}$');
      expect(strictDigits('1234')).toBeNull();
      expect(strictDigits('12345')).toBe('Please match the requested format.');
    });

    test('json rule validates parseable JSON strings', () => {
      expect(rules.json('{"name":"John","age":30}')).toBeNull();
      expect(rules.json('[1, 2, 3]')).toBeNull();
      expect(rules.json('')).toBeNull();

      expect(rules.json('{bad json}')).toBe('Must be valid JSON.');
      expect(rules.json('just a string')).toBe('Must be valid JSON.');
    });

    test('uuid rule validates RFC UUID format', () => {
      expect(rules.uuid('123e4567-e89b-12d3-a456-426614174000')).toBeNull();
      expect(rules.uuid('c9b4e132-7201-447b-a19e-e6a64f434720')).toBeNull();
      expect(rules.uuid('')).toBeNull();

      expect(rules.uuid('not-a-uuid')).toBe('Must be a valid UUID.');
      expect(rules.uuid('123e4567-e89b-62d3-a456-426614174000')).toBe('Must be a valid UUID.'); // invalid version 6
    });

    test('ip rule validates IPv4 and IPv6 addresses', () => {
      expect(rules.ip('192.168.1.1')).toBeNull();
      expect(rules.ip('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBeNull();
      expect(rules.ip('')).toBeNull();

      expect(rules.ip('999.999.999.999')).toBe('Must be a valid IP address.');
      expect(rules.ip('not-an-ip')).toBe('Must be a valid IP address.');

      // Test specific v4 / v6 modes
      const ipV4 = rules.ip('v4');
      expect(ipV4('10.0.0.1')).toBeNull();
      expect(ipV4('2001:db8::1')).toBe('Must be a valid IPv4 address.');

      const ipV6 = rules.ip('v6');
      expect(ipV6('::1')).toBeNull();
      expect(ipV6('127.0.0.1')).toBe('Must be a valid IPv6 address.');
    });
  });

});