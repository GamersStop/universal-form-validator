const { rules } = require('../src/rules');

describe('Validation Rules Dictionary', () => {

  test('required rule catches empty strings', () => {
    expect(rules.required('')).toBe('This field is required.');
    expect(rules.required('   ')).toBe('This field is required.'); // catches spaces only
  });

  test('required rule passes valid text', () => {
    expect(rules.required('hello')).toBeNull(); // null means it passed
  });

  test('email rule catches bad emails', () => {
    expect(rules.email('not-an-email')).toBe('Please enter a valid email address.');
  });

  test('email rule passes good emails', () => {
    expect(rules.email('test@example.com')).toBeNull();
  });

  test('strictNumeric rule catches decimals and text', () => {
    expect(rules.strictNumeric('10.5')).toBe('Must be a whole number.');
    expect(rules.strictNumeric('abc')).toBe('Must be a whole number.');
  });

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

  test('alphaNumeric rule blocks special characters', () => {
    expect(rules.alphaNumeric('Hello123')).toBeNull();
    expect(rules.alphaNumeric('Hello_123!')).not.toBeNull();
    expect(rules.alphaNumeric('special@char')).not.toBeNull();
  });

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

  test('match rule compares two fields correctly', () => {
    const matchCheck = rules.match('password');
    const allData = { password: 'Secret123!' };
    expect(matchCheck('Secret123!', allData)).toBeNull();
    expect(matchCheck('Wrong123!', allData)).not.toBeNull();
  });

  test('safeText rule blocks basic injection characters', () => {
    expect(rules.safeText('Hello World 123')).toBeNull();
    expect(rules.safeText('<script>alert("hi")</script>')).toBe('Invalid characters detected.');
    expect(rules.safeText("O'Reilly; DROP TABLE users;")).toBe('Invalid characters detected.');
    expect(rules.safeText('admin --')).toBe('Invalid characters detected.');
  });

  test('urlValid rule catches invalid URLs and passes valid ones', () => {
    expect(rules.urlValid('https://example.com')).toBeNull();
    expect(rules.urlValid('http://localhost:3000')).toBeNull();
    expect(rules.urlValid('not-a-url')).toBe('Please enter a valid URL.');
    expect(rules.urlValid('ftp://example.com')).toBe('Please enter a valid URL.');
  });

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

  test('phone rule validates phone numbers correctly', () => {
    expect(rules.phone('123-456-7890')).toBeNull();
    expect(rules.phone('(123) 456-7890')).toBeNull();
    expect(rules.phone('+19876543210')).toBeNull();
    expect(rules.phone('abc-def-ghij')).toBe('Please enter a valid phone number.');
  });
});