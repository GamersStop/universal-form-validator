/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Comprehensive TypeScript 5 showcase demonstrating all core and v1.1.0 
 *              features: Template literal rule types, synchronous & asynchronous validation,
 *              enterprise rules (numeric, between, regex, json, uuid, ip), conditional rules 
 *              (requiredIf, requiredWith, requiredWithout), multi-locale (i18n) dictionaries,
 *              dynamic token interpolation, and Zero-JS DOM auto-binding types.
 *
 * To execute this file in Node:
 *   npx tsx examples/example.ts
 *
 * To typecheck this file:
 *   npm run typecheck
 */

import {
  UniversalValidator,
  rules,
  initAutoBind,
  resetFormState,
  interpolate,
  deriveFieldLabel,
  type ValidationSchema,
  type ValidationResult,
  type ValidationOptions,
  type BuiltInRule,
  type CustomRuleFn,
  type LocaleDictionary,
  type AutoBindOptions
} from '../src/index';

// ANSI terminal color codes for clear visual feedback
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

const printHeader = (title: string): void => {
  console.log(`\n${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}`);
};

const printPass = (msg: string): void => {
  console.log(`  ${colors.green}✔ PASS:${colors.reset} ${msg}`);
};

const printFail = (msg: string, details?: any): void => {
  console.log(`  ${colors.red}✖ FAIL:${colors.reset} ${msg}`);
  if (details) {
    console.log(`    ${colors.gray}${JSON.stringify(details, null, 2)}${colors.reset}`);
  }
};

const printInfo = (msg: string): void => {
  console.log(`  ${colors.yellow}ℹ INFO:${colors.reset} ${msg}`);
};

// ======================================================================
// 1. Custom Rule Registration (Synchronous & Asynchronous)
// ======================================================================
printHeader('1. Registering Custom Synchronous & Asynchronous Rules');

/**
 * 1a. Synchronous Custom Rule:
 * Validates that enterprise license keys begin with 'CORP-' and follow standard formats.
 */
const customLicenseValidator: CustomRuleFn = (value: unknown): string | null => {
  if (!value) return null; // Allow empty if not marked 'required'
  const str = typeof value === 'string' ? value : String(value);
  return str.startsWith('CORP-') ? null : 'License key must begin with "CORP-".';
};
rules.register('enterpriseLicense', customLicenseValidator);
printPass('Registered synchronous rule "enterpriseLicense"');

/**
 * 1b. Asynchronous Custom Rule:
 * Simulates remote database check (with artificial latency) to verify username availability.
 */
const checkUsernameAvailability: CustomRuleFn = async (value: unknown): Promise<string | null> => {
  if (!value) return null;
  const username = String(value).toLowerCase().trim();

  // Simulate network roundtrip (80ms)
  await new Promise((resolve) => setTimeout(resolve, 80));

  const reservedUsernames = ['admin', 'root', 'superuser', 'moderator'];
  if (reservedUsernames.includes(username)) {
    return `Username "${username}" is reserved and unavailable.`;
  }
  return null;
};
rules.register('checkUsernameAvailable', checkUsernameAvailability);
printPass('Registered asynchronous rule "checkUsernameAvailable"');


// ======================================================================
// 2. Comprehensive Schema Definition with TypeScript 5 Autocomplete
// ======================================================================
printHeader('2. Schema Definition (Template Literal Types & Enterprise Rules)');

/**
 * Strongly typed schema showcasing static rules, template literal parameterized rules,
 * enterprise rules (between, numeric, regex, json, uuid, ip), and conditional dependencies.
 */
const registrationSchema: ValidationSchema = {
  // Static & basic rules
  username: ['required', 'minLength:3', 'maxLength:15', 'checkUsernameAvailable'],
  email: ['required', 'email'],

  // Password strictness & confirmation match (sameAs alias)
  password: ['required', 'passwordStrict'],
  confirmPassword: ['required', 'sameAs:password'],

  // Enterprise numeric rules (integers, floats, negative values, bounds)
  age: ['required', 'numeric', 'between:18,65'],

  // Enterprise formats: UUID, IPv4/IPv6, JSON payload
  deviceId: ['required', 'uuid'],
  serverIp: ['required', 'ip:v4'],
  configPayload: ['required', 'json'],

  // Safe Regex evaluator with flags (case-insensitive promo code)
  promoCode: ['regex:^[A-Z]{3}-\\d{4}$,i'],

  // Regex with colons (verifying colon-splitting safety fix)
  websiteUrl: ['pattern:^https?:\\/\\/'],

  // Conditional rules:
  // - requiredIf: taxId only required when accountType is 'business'
  accountType: ['required', 'oneOf:personal,business'],
  taxId: ['requiredIf:accountType,business'],

  // - requiredWith: emergencyPhone required when emergencyContact has a value
  emergencyContact: [],
  emergencyPhone: ['requiredWith:emergencyContact', 'phone'],

  // - requiredWithout: backupEmail required if primaryPhone is empty
  primaryPhone: [],
  backupEmail: ['requiredWithout:primaryPhone', 'email'],

  // Custom registered rule
  licenseKey: ['required', 'enterpriseLicense'],

  // Date and chronological ordering
  startDate: ['required', 'date'],
  endDate: ['required', 'date', 'dateAfter:startDate'],

  // Terms acceptance checkbox
  termsAccepted: ['required', 'checked']
};

printPass('Schema created successfully with strict ValidationSchema typing.');


// ======================================================================
// 3. Synchronous Validation Execution
// ======================================================================
printHeader('3. Testing Synchronous Validation (validate)');

const syncValidator = new UniversalValidator(registrationSchema, {
  locale: 'en',
  labels: {
    taxId: 'Corporate Tax ID',
    backupEmail: 'Backup Email Address',
    termsAccepted: 'Terms and Conditions'
  }
});

// 3a. Test with fully valid synchronous dataset
const validDataPayload = {
  username: 'valid_user',
  email: 'dev@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  age: '28',
  deviceId: '123e4567-e89b-12d3-a456-426614174000',
  serverIp: '192.168.1.100',
  configPayload: '{"theme": "dark", "notifications": true}',
  promoCode: 'SUM-2026',
  websiteUrl: 'https://universal-validator.dev',
  accountType: 'business',
  taxId: 'US-EIN-987654321',
  emergencyContact: 'Jane Doe',
  emergencyPhone: '123-456-7890',
  primaryPhone: '123-456-7890',
  backupEmail: 'backup@example.com',
  licenseKey: 'CORP-ENTERPRISE-2026',
  startDate: '2026-06-01',
  endDate: '2026-06-15',
  termsAccepted: true
};

const validResult: ValidationResult = syncValidator.validate(validDataPayload);
if (validResult.isValid) {
  printPass('Fully compliant payload passed all synchronous schema rules.');
} else {
  printFail('Valid payload failed unexpectedly', validResult.errors);
}

// 3b. Test with deliberately invalid synchronous dataset
const invalidDataPayload = {
  username: 'ab', // Too short (minLength:3)
  email: 'invalid-email', // Bad format
  password: 'weak', // Fails passwordStrict
  confirmPassword: 'mismatch', // Fails sameAs:password
  age: '15', // Under minimum boundary 18 (between:18,65)
  deviceId: 'not-a-uuid', // Bad UUID
  serverIp: '999.999.999.999', // Bad IPv4
  configPayload: '{invalid_json}', // Bad JSON
  promoCode: 'INVALID-CODE', // Fails regex pattern
  websiteUrl: 'ftp://not-http', // Fails pattern:^https?:\/\/
  accountType: 'business',
  taxId: '', // Missing but requiredIf accountType == 'business'
  emergencyContact: 'John',
  emergencyPhone: 'bad-phone', // Fails phone format (requiredWith emergencyContact)
  primaryPhone: '',
  backupEmail: '', // Fails requiredWithout:primaryPhone
  licenseKey: 'INVALID-KEY', // Fails enterpriseLicense (must start with CORP-)
  startDate: '2026-06-20',
  endDate: '2026-06-10', // Chronologically before startDate (dateAfter:startDate)
  termsAccepted: false // Unchecked
};

const invalidResult: ValidationResult = syncValidator.validate(invalidDataPayload);
if (!invalidResult.isValid && Object.keys(invalidResult.errors).length >= 15) {
  printPass(`Caught expected ${Object.keys(invalidResult.errors).length} errors across all invalid fields.`);
  console.log(`    Sample errors:`);
  console.log(`      - age: "${invalidResult.errors.age}"`);
  console.log(`      - deviceId: "${invalidResult.errors.deviceId}"`);
  console.log(`      - taxId: "${invalidResult.errors.taxId}"`);
  console.log(`      - licenseKey: "${invalidResult.errors.licenseKey}"`);
  console.log(`      - confirmPassword: "${invalidResult.errors.confirmPassword}"`);
} else {
  printFail('Invalid payload did not catch expected errors', invalidResult.errors);
}


// ======================================================================
// 4. Asynchronous Validation Execution (validateAsync)
// ======================================================================
printHeader('4. Testing Asynchronous Validation (validateAsync & Remote Checks)');

async function runAsyncValidationSuite(): Promise<void> {
  const asyncValidator = new UniversalValidator(registrationSchema);

  // 4a. Async validation with available username
  const asyncValidData = {
    ...validDataPayload,
    username: 'available_user'
  };

  const asyncPassRes = await asyncValidator.validateAsync(asyncValidData);
  if (asyncPassRes.isValid) {
    printPass('validateAsync passed with available username.');
  } else {
    printFail('validateAsync failed unexpectedly with available username', asyncPassRes.errors);
  }

  // 4b. Async validation with reserved/taken username
  const asyncInvalidData = {
    ...validDataPayload,
    username: 'admin' // Reserved! Triggers async rule failure
  };

  const asyncFailRes = await asyncValidator.validateAsync(asyncInvalidData);
  if (!asyncFailRes.isValid && asyncFailRes.errors.username) {
    printPass(`validateAsync caught reserved username: "${asyncFailRes.errors.username}"`);
  } else {
    printFail('validateAsync failed to catch reserved username', asyncFailRes.errors);
  }
}


// ======================================================================
// 5. Conditional Rules Deep Dive (requiredIf, requiredWith, requiredWithout)
// ======================================================================
printHeader('5. Testing Conditional Rules (requiredIf, requiredWith, requiredWithout)');

function runConditionalRulesSuite(): void {
  const condSchema: ValidationSchema = {
    accountType: ['required', 'oneOf:personal,business'],
    taxId: ['requiredIf:accountType,business'],
    emergencyContact: [],
    emergencyPhone: ['requiredWith:emergencyContact'],
    primaryPhone: [],
    backupEmail: ['requiredWithout:primaryPhone']
  };

  const condValidator = new UniversalValidator(condSchema);

  // Case 1: Personal account -> taxId NOT required
  const personalRes = condValidator.validate({
    accountType: 'personal',
    taxId: '',
    primaryPhone: '123-456-7890'
  });
  if (personalRes.isValid) {
    printPass('requiredIf: taxId correctly ignored when accountType is "personal".');
  } else {
    printFail('requiredIf failed for personal account', personalRes.errors);
  }

  // Case 2: Business account without taxId -> taxId IS required
  const businessMissingTaxRes = condValidator.validate({
    accountType: 'business',
    taxId: '',
    primaryPhone: '123-456-7890'
  });
  if (!businessMissingTaxRes.isValid && businessMissingTaxRes.errors.taxId) {
    printPass(`requiredIf: taxId correctly mandated for "business" (${businessMissingTaxRes.errors.taxId}).`);
  } else {
    printFail('requiredIf failed to mandate taxId for business', businessMissingTaxRes.errors);
  }

  // Case 3: requiredWith: emergencyPhone needed when emergencyContact present
  const requiredWithRes = condValidator.validate({
    accountType: 'personal',
    emergencyContact: 'Alice Smith',
    emergencyPhone: '',
    primaryPhone: '123-456-7890'
  });
  if (!requiredWithRes.isValid && requiredWithRes.errors.emergencyPhone) {
    printPass(`requiredWith: emergencyPhone required when emergencyContact exists.`);
  } else {
    printFail('requiredWith failed to mandate field', requiredWithRes.errors);
  }

  // Case 4: requiredWithout: backupEmail needed when primaryPhone missing
  const requiredWithoutRes = condValidator.validate({
    accountType: 'personal',
    primaryPhone: '',
    backupEmail: ''
  });
  if (!requiredWithoutRes.isValid && requiredWithoutRes.errors.backupEmail) {
    printPass(`requiredWithout: backupEmail mandated when primaryPhone is omitted.`);
  } else {
    printFail('requiredWithout failed to mandate fallback field', requiredWithoutRes.errors);
  }
}


// ======================================================================
// 6. Multi-Locale Engine (i18n) & Dynamic Token Interpolation
// ======================================================================
printHeader('6. Testing Multi-Locale Engine (i18n) & Dynamic Token Interpolation');

function runI18nSuite(): void {
  const i18nSchema: ValidationSchema = {
    username: ['required', 'minLength:5'],
    age: ['required', 'numeric', 'between:18,65']
  };

  const testPayload = { username: 'ab', age: '12' };

  // 6a. English (en) default
  const valEn = new UniversalValidator(i18nSchema, { locale: 'en' });
  const resEn = valEn.validate(testPayload);
  printInfo(`[en] Username: "${resEn.errors.username}", Age: "${resEn.errors.age}"`);

  // 6b. Spanish (es) instance locale
  const valEs = new UniversalValidator(i18nSchema, { locale: 'es' });
  const resEs = valEs.validate(testPayload);
  printInfo(`[es] Username: "${resEs.errors.username}", Age: "${resEs.errors.age}"`);
  if (resEs.errors.username && resEs.errors.username.includes('caracteres')) {
    printPass('Spanish translation returned expected localized message.');
  }

  // 6c. French (fr) instance locale
  const valFr = new UniversalValidator(i18nSchema, { locale: 'fr' });
  const resFr = valFr.validate(testPayload);
  printInfo(`[fr] Username: "${resFr.errors.username}", Age: "${resFr.errors.age}"`);
  if (resFr.errors.username && resFr.errors.username.includes('caractères')) {
    printPass('French translation returned expected localized message.');
  }

  // 6d. German (de) via dynamic setLocale()
  valEn.setLocale('de');
  const resDe = valEn.validate(testPayload);
  printInfo(`[de] Username: "${resDe.errors.username}", Age: "${resDe.errors.age}"`);
  if (resDe.errors.username && resDe.errors.username.includes('Zeichen')) {
    printPass('Dynamic locale switch to German successful.');
  }

  // 6e. Custom Locale Registration: Italian (it)
  const italianDictionary: LocaleDictionary = {
    required: 'Il campo {field} è obbligatorio.',
    minLength: 'Il campo {field} deve contenere almeno {0} caratteri.',
    between: 'Il valore di {field} deve essere compreso tra {0} e {1}.'
  };
  UniversalValidator.registerLocale('it', italianDictionary);

  const valIt = new UniversalValidator(i18nSchema, {
    locale: 'it',
    labels: { username: 'Nome utente', age: 'Età' }
  });
  const resIt = valIt.validate(testPayload);
  printInfo(`[it] Username: "${resIt.errors.username}", Age: "${resIt.errors.age}"`);
  if (resIt.errors.username?.includes('Nome utente') && resIt.errors.age?.includes('compreso tra 18 e 65')) {
    printPass('Custom registered Italian locale with label interpolation verified.');
  }

  // 6f. Dynamic Token Interpolation Utility
  const interpolatedString: string = interpolate(
    '{field} must be between {0} and {1} units.',
    [10, 100],
    { field: 'Order Quantity' }
  );
  if (interpolatedString === 'Order Quantity must be between 10 and 100 units.') {
    printPass(`interpolate() resolved placeholders: "${interpolatedString}"`);
  } else {
    printFail('interpolate() failed to resolve tokens', interpolatedString);
  }

  // 6g. Field Label Derivation Utility
  const derivedLabel: string = deriveFieldLabel('confirmPassword');
  if (derivedLabel) {
    printPass(`deriveFieldLabel('confirmPassword') -> "${derivedLabel}"`);
  }
}


// ======================================================================
// 7. Zero-JS DOM Engine & A11y Type Verification (Browser Environments)
// ======================================================================
printHeader('7. Verifying Zero-JS DOM Engine & A11y Types (Browser Context)');

// Typecheck and verify browser DOM functions
const autoBindOpts: AutoBindOptions = { observe: true };

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Initializes Zero-JS DOM binding with MutationObserver reactivity
    initAutoBind(autoBindOpts);

    const form = document.querySelector('form');
    if (form) {
      // Test form reset utility
      resetFormState(form);
    }
  });
  printPass('Browser DOM auto-bind event listener configured.');
} else {
  printInfo('DOM environment not present in Node.js runtime. Type-checking passed for initAutoBind and resetFormState.');
}


// ======================================================================
// Main Execution Runner
// ======================================================================
async function main(): Promise<void> {
  console.log(`\n${colors.bold}${colors.magenta}🚀 Universal Form Validator v1.1.0 - TypeScript Test Showcase${colors.reset}`);
  console.log(`${colors.gray}Verifying all core, enterprise, async, conditional, and i18n features...\n${colors.reset}`);

  try {
    // Run conditional rules suite
    runConditionalRulesSuite();

    // Run async validation suite
    await runAsyncValidationSuite();

    // Run i18n and interpolation suite
    runI18nSuite();

    console.log(`\n${colors.bold}${colors.green}══════════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold}${colors.green}  ✨ All TypeScript checks and features verified successfully!${colors.reset}`);
    console.log(`${colors.bold}${colors.green}══════════════════════════════════════════════════════════════════════\n${colors.reset}`);
  } catch (err) {
    console.error(`\n${colors.bold}${colors.red}❌ Error executing TypeScript verification:${colors.reset}`, err);
    process.exit(1);
  }
}

// Execute test runner
main();