import { UniversalValidator, rules, initAutoBind } from '../src/index';

// ----------------------------------------------------------------------
// 1. Programmatic Validation Test (Runs cleanly in Node.js)
// ----------------------------------------------------------------------

// Register your custom rule
rules.register('customCodeCheck', (value: unknown): string | null => {
    const strVal = typeof value === 'string' ? value : '';
    return strVal.startsWith('PRO-') ? null : 'Code must start with "PRO-".';
});

// Create a typed validator instance
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

// Sample data payload (Including valid Luhn-compliant card number & access code)
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

// Run validation
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
        rules.register('customCodeCheck', (value: unknown) => {
            const strVal = typeof value === 'string' ? value : '';
            return strVal.startsWith('PRO-') ? null : 'Code must start with "PRO-".';
        });

        initAutoBind();
    });
}