/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Hard-level stress & performance test suite.
 */

const { UniversalValidator } = require('../src/validator');

describe('Hard-Level Stress & Performance Tests', () => {

    test('handles massive schemas and large data payloads without crashing', () => {
        const largeSchema = {};
        const largePayload = {};

        for (let i = 0; i < 1000; i++) {
            const fieldName = `field_${i}`;
            largeSchema[fieldName] = ['required', 'minLength:2', 'maxLength:50'];
            largePayload[fieldName] = `value_${i}`;
        }

        const validator = new UniversalValidator(largeSchema);
        const startTime = performance.now();
        const result = validator.validate(largePayload);
        const endTime = performance.now();
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);

        console.log(`Validated 1,000 fields in ${endTime - startTime}ms`);
        expect(endTime - startTime).toBeLessThan(50);
    });

    test('handles deeply malformed or null/undefined payloads safely without throwing', () => {
        const schema = {
            username: ['required', 'email'],
            age: ['strictNumeric']
        };

        const validator = new UniversalValidator(schema);
        expect(() => validator.validate(null)).not.toThrow();
        expect(validator.validate(null).isValid).toBe(false);
        expect(() => validator.validate(undefined)).not.toThrow();
        expect(validator.validate(undefined).isValid).toBe(false);
        const partialResult = validator.validate({ username: undefined, age: null });
        expect(partialResult.isValid).toBe(false);
    });

});