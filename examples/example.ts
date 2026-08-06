/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Integration and usage example script demonstrating both programmatic 
 *              validator engine usage with custom rule registration and automatic 
 *              DOM event-driven form binding in browser environments.
 */

import { UniversalValidator, rules, initAutoBind } from '../src/index';

// ----------------------------------------------------------------------
// 1. Programmatic Validation Test (Runs cleanly in Node.js)
// ----------------------------------------------------------------------

/**
 * Register a custom domain-specific validation rule ensuring codes follow internal standards.
 */
rules.register('customCodeCheck', (value: unknown): string | null => {
    const strVal = typeof value === 'string' ? value : '';
    return strVal.startsWith('PRO-') ? null : 'Code must start with "PRO-".';
});

/**
 * Initialize a strict validator instance mapping fields to declarative schema rules.
 */
const validator = new UniversalValidator({
    username: ['required', 'minLength:3', 'maxLength:10'],
    email: ['required', 'email'],
    age: ['strictNumeric'],
    startDate: ['required', 'date'],
    endDate: ['required', 'date', 'dateAfter:startDate'],
    terms: ['required', 'checked'],
    accessCode: ['required', 'customCodeCheck'],
    cardNumber: ['required', 'creditCard']
});

/**
 * Sample input data payload (including valid Luhn-compliant credit card and custom code).
 */
const formData = {
    username: 'johndoe',
    email: 'john@example.com',
    age: '25',
    startDate: '2026-06-01',
    endDate: '2026-06-10',
    terms: true,
    accessCode: 'PRO-12345',
    cardNumber: '4012888888881881'
};

// Execute programmatic validation check
const result = validator.validate(formData);

if (result.isValid) {
    console.log('✅ Validation passed successfully!');
} else {
    console.log('❌ Validation failed:', result.errors);
}


// ----------------------------------------------------------------------
// 2. Automatic DOM Binding (Only runs if a browser "document" exists)
// ----------------------------------------------------------------------
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Register custom runtime rule specifically for browser context workflows
        rules.register('customCodeCheck', (value: unknown) => {
            const strVal = typeof value === 'string' ? value : '';
            return strVal.startsWith('PRO-') ? null : 'Code must start with "PRO-".';
        });

        // Initialize zero-configuration auto-binding across target DOM forms
        initAutoBind();
    });
}