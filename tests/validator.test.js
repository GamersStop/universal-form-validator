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

  /**
   * Verifies that rule arguments containing colons (e.g. URLs or regex patterns like pattern:^https?:\/\/)
   * are safely preserved without truncation.
   */
  test('safely preserves rule arguments containing colons (e.g. regex patterns and URLs)', () => {
    const schema = {
      website: ['pattern:^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$']
    };

    const validator = new UniversalValidator(schema);

    const validResult = validator.validate({ website: 'https://example.com' });
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors.website).toBeUndefined();

    const invalidResult = validator.validate({ website: 'ftp://not-http.com' });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.website).toBe('Please match the requested format.');
  });

  /**
   * Verifies validateAsync works with standard synchronous rules.
   */
  test('validateAsync resolves validation result for synchronous schemas', async () => {
    const validator = new UniversalValidator({
      username: ['required', 'minLength:3'],
      email: ['required', 'email']
    });

    const validResult = await validator.validateAsync({
      username: 'john',
      email: 'john@example.com'
    });
    expect(validResult.isValid).toBe(true);
    expect(Object.keys(validResult.errors).length).toBe(0);

    const invalidResult = await validator.validateAsync({
      username: 'j',
      email: 'invalid-email'
    });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.username).toBe('Must be at least 3 characters long.');
    expect(invalidResult.errors.email).toBe('Please enter a valid email address.');
  });

  /**
   * Verifies validateAsync executes asynchronous rule functions and preserves fail-fast behavior.
   */
  test('validateAsync awaits asynchronous rules and maintains fail-fast order', async () => {
    let secondAsyncRuleCalled = false;

    const schema = {
      username: [
        'required',
        async (value) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return value === 'taken_user' ? 'Username is already taken.' : null;
        },
        async () => {
          secondAsyncRuleCalled = true;
          return null;
        }
      ]
    };

    const validator = new UniversalValidator(schema);

    // Test async rule failure
    const failResult = await validator.validateAsync({ username: 'taken_user' });
    expect(failResult.isValid).toBe(false);
    expect(failResult.errors.username).toBe('Username is already taken.');
    expect(secondAsyncRuleCalled).toBe(false); // Fail-fast short-circuit verified

    // Test async rule success
    const passResult = await validator.validateAsync({ username: 'available_user' });
    expect(passResult.isValid).toBe(true);
    expect(passResult.errors.username).toBeUndefined();
    expect(secondAsyncRuleCalled).toBe(true);
  });

});