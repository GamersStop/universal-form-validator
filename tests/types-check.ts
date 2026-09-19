/**
 * Type-level static verification file for TypeScript 5 type declarations.
 * Verified with `tsc --noEmit`.
 */

import {
  UniversalValidator,
  ValidationResult,
  ValidationOptions,
  ValidationSchema,
  LocaleDictionary,
  BuiltInRule,
  rules,
  initAutoBind,
  resetFormState,
  interpolate,
  deriveFieldLabel
} from '../src/index';

// Type assertion tests
const schema: ValidationSchema = {
  username: ['required', 'minLength:3', 'maxLength:20'],
  email: ['required', 'email'],
  age: ['numeric', 'between:18,65'],
  confirm: ['sameAs:password'],
  custom: [
    (val: any) => (val === 'bad' ? 'Error' : null),
    async (val: any) => (val === 'async_bad' ? 'Async Error' : null)
  ]
};

const options: ValidationOptions = {
  locale: 'es',
  labels: {
    username: 'Nombre de usuario'
  }
};

const validator = new UniversalValidator(schema, options);

// Test methods
validator.setLocale('fr');
const currentLocale: string = validator.getLocale();
validator.setLabel('username', 'Username');
validator.setLabels({ email: 'Email Address' });
const label: string = validator.getLabel('username');

// Test validation
const syncRes: ValidationResult = validator.validate({ username: 'test' });
const isValid: boolean = syncRes.isValid;
const errors: Record<string, string> = syncRes.errors;

async function runAsync(): Promise<void> {
  const asyncRes: ValidationResult = await validator.validateAsync({ username: 'test' });
  const asyncValid: boolean = asyncRes.isValid;
}

// Test rules register
rules.register('customRule', (val) => (val ? null : 'Failed'));

// Test helper functions
const interpolated: string = interpolate('{field} error', [], { field: 'Field' });
const derived: string = deriveFieldLabel('test');
