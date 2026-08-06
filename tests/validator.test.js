/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Jest unit test suite for the core UniversalValidator engine class. 
 *              Verifies schema parsing, multi-rule sequential evaluations, fail-fast behavior, 
 *              error message mappings, and parameterized factory constraints (minLength/maxLength).
 */

const { UniversalValidator } = require('../src/validator');

describe('UniversalValidator Engine', () => {

  const schema = {
    username: ['required'],
    email: ['required', 'email'],
    age: ['required', 'strictNumeric']
  };

  const validator = new UniversalValidator(schema);

  /**
   * Verifies successful validation when all schema constraints are satisfied.
   */
  test('passes perfectly valid form data', () => {
    const data = { username: 'john_doe', email: 'john@example.com', age: '25' };
    const result = validator.validate(data);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  /**
   * Verifies that invalid fields are accurately caught and mapped to their respective errors.
   */
  test('catches invalid data and maps errors to fields', () => {
    const data = { username: '', email: 'not-an-email', age: 'twenty' };
    const result = validator.validate(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.username).toBe('This field is required.');
    expect(result.errors.email).toBe('Please enter a valid email address.');
    expect(result.errors.age).toBe('Must be a whole number.');
  });

  /**
   * Verifies that validation short-circuits (fail-fast) upon encountering the first broken rule per field.
   */
  test('fail-fast works: stops at the first broken rule', () => {
    const data = { username: 'john', email: '', age: '25' };
    const result = validator.validate(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('This field is required.');
  });

  /**
   * Verifies parameterized factory constraints like minLength and maxLength bounds.
   */
  test('validates minLength and maxLength rules correctly', () => {
    const schema = {
      username: ['required', 'minLength:3', 'maxLength:6']
    };

    const validator = new UniversalValidator(schema);

    const resultShort = validator.validate({ username: 'ab' });
    expect(resultShort.isValid).toBe(false);
    expect(resultShort.errors.username).toBe('Must be at least 3 characters long.');

    const resultLong = validator.validate({ username: 'toolongname' });
    expect(resultLong.isValid).toBe(false);
    expect(resultLong.errors.username).toBe('Must be no more than 6 characters long.');

    const resultValid = validator.validate({ username: 'code' });
    expect(resultValid.isValid).toBe(true);
    expect(resultValid.errors.username).toBeUndefined();
  });

});