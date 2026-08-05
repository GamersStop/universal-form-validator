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

});