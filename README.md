# Universal Form Builder (Validator Engine)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version: 1.1.0](https://img.shields.io/badge/Version-1.1.0-green.svg)](#)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0+-blue)](src/index.d.ts)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg)](#)
[![npm version](https://img.shields.io/npm/v/universal-form-validator.svg)](https://www.npmjs.com/package/universal-form-validator)
[![Tests Passing](https://img.shields.io/badge/Tests-111%20passing-success.svg)](#)

A high-performance, enterprise-grade, framework-agnostic form validation engine created by **Mayuresh Pandit**. Use it declaratively in standard HTML (**Zero-JS Mode 2.0**) or programmatically via a strongly typed **JavaScript/TypeScript API**.

Compatible with **Node.js**, **TypeScript**, **React**, **Vue**, **Svelte**, **Angular**, **Astro**, **HTMX**, and vanilla HTML/JS static web projects.

---

## 🌟 What's New in Version 1.1.0 ("The Market Cracker")

* **⚡ Zero-JS DOM Engine 2.0:** Declarative HTML validation with custom error placement (`data-error-target="#selector"`), `data-debounce`, `data-trigger`, and native submit decoupling (`data-ajax="true"`).
* **⏳ Async Validation & Remote Checks:** Native `validateAsync()` method and built-in `remote:url` rule with automatic debouncing, request cancellation (`AbortController`), and `.uv-validating` visual loading state.
* **🌐 Built-in Multi-Locale (i18n):** Out-of-the-box dictionary support for 6 major languages: **English (`en`)**, **Spanish (`es`)**, **French (`fr`)**, **German (`de`)**, **Hindi (`hi`)**, and **Chinese (`zh`)**, plus dynamic custom locale registration.
* **🏷️ Dynamic Token Interpolation:** Error templates dynamically interpolate `{field}` (derived from `data-label`, `<label>`, or field name) and positional rule arguments (`{0}`, `{1}`, etc.).
* **🔀 Interdependent & Conditional Rules:** Declarative conditional constraints (`requiredIf`, `requiredWith`, `requiredWithout`, `dependsOn`, `sameAs`, `match`, `dateBefore`, `dateAfter`).
* **♿ Modern WCAG 2.1 AA Accessibility:** Deterministic error element IDs (`id="uv-error-[field]"`), `aria-describedby` linking, `aria-invalid`, and polite screen-reader alerts (`role="alert"`).
* **🔄 Form Reset Lifecycle Management:** Auto-listens to `form.reset()` and restores pristine default DOM states, purging all `.uv-input-error`, `.uv-error-text`, and ARIA attributes cleanly.
* **📻 Radio & Checkbox Group Normalization:** Grouped inputs sharing the same `name` are evaluated collectively with single error element placement.
* **👁️ Reactive DOM Observation (`MutationObserver`):** `initAutoBind({ observe: true })` automatically discovers and binds dynamically injected forms or inputs (ideal for HTMX, Turbo, Alpine.js, and modal popups).
* **📦 Modern Dual ESM/CJS Build Pipeline:** First-class dual exports mapping supporting `dist/index.mjs` (pure ESM), `dist/index.cjs` (CommonJS), and `dist/validator.min.js` (minified CDN bundle).
* **💪 Strict TypeScript 5 Autocomplete:** Template literal types provide rich IDE autocompletion for rules like `minLength:8`, `between:10,20`, `sameAs:password`, and `requiredIf:country,US`.

---

## 🚀 Installation & CDN

### NPM Installation
```bash
npm install universal-form-validator
```

### CDN Script Inclusion
Include the minified browser bundle directly via CDN without build tooling:

```html
<<<<<<< Updated upstream
<script src="https://cdn.jsdelivr.net/npm/universal-form-validator@1.0.0/dist/validator.min.js"></script>
=======
<!-- jsDelivr (Recommended) -->
<script src="https://cdn.jsdelivr.net/npm/universal-form-validator/dist/validator.min.js"></script>

<!-- unpkg -->
<script src="https://unpkg.com/universal-form-validator/dist/validator.min.js"></script>
>>>>>>> Stashed changes
```

---

## 💻 Quick Start 

### 1. Zero-JS Mode 2.0 (Declarative HTML)

Simply tag forms with `data-validator` and input controls with `data-rules`. Pipes (`|`) chain rules together.

```html
<form data-validator data-ajax="true" data-locale="en" id="signup-form">
  <!-- 1. Async remote check with 300ms debounce -->
  <div class="form-group">
    <label for="username">Username</label>
    <input 
      type="text" 
      id="username" 
      name="username" 
      data-label="Username"
      data-rules="required|minLength:3|remote:/api/check-username" 
      data-debounce="300"
      placeholder="e.g. john_doe"
    >
  </div>

  <!-- 2. Email Address -->
  <div class="form-group">
    <label for="email">Work Email</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      data-rules="required|email"
      placeholder="user@example.com"
    >
  </div>

  <!-- 3. Interdependent Trigger -->
  <div class="form-group">
    <label for="accountType">Account Type</label>
    <select id="accountType" name="accountType">
      <option value="personal">Personal Account</option>
      <option value="business">Business Account</option>
    </select>
  </div>

  <!-- 4. Conditional requirement: only mandatory if accountType === 'business' -->
  <div class="form-group">
    <label for="taxId">Corporate Tax ID</label>
    <input 
      type="text" 
      id="taxId" 
      name="taxId" 
      data-label="Tax ID"
      data-rules="requiredIf:accountType,business|dependsOn:accountType"
    >
  </div>

  <!-- 5. Password with custom error placement container -->
  <div class="form-group">
    <label for="password">Password</label>
    <input 
      type="password" 
      id="password" 
      name="password" 
      data-rules="required|passwordStrict"
      data-error-target="#pwd-error-container"
    >
    <div id="pwd-error-container"></div>
  </div>

  <!-- 6. Password confirmation (sameAs alias) -->
  <div class="form-group">
    <label for="confirmPassword">Confirm Password</label>
    <input 
      type="password" 
      id="confirmPassword" 
      name="confirmPassword" 
      data-rules="required|sameAs:password"
    >
  </div>

  <button type="submit">Create Account</button>
  <button type="reset">Reset Form</button>
</form>

<!-- Load library: auto-binds automatically upon DOMContentLoaded -->
<script src="https://cdn.jsdelivr.net/npm/universal-form-validator/dist/validator.min.js"></script>

<script>
  const form = document.getElementById('signup-form');

  // Intercept AJAX submission via lifecycle events when data-ajax="true" is set
  form.addEventListener('uv:success', (event) => {
    console.log('🎉 All fields valid! Submitting via fetch...');
    // fetch('/api/signup', { method: 'POST', body: new FormData(form) });
  });

  form.addEventListener('uv:fail', (event) => {
    console.warn('⛔ Form validation failed:', event.detail.errors);
  });
</script>
```

---

### 2. Programmatic JavaScript / TypeScript API

```typescript
import { UniversalValidator, rules, type ValidationSchema, type ValidationResult } from 'universal-form-validator';

// 1. (Optional) Register custom synchronous or asynchronous rules
rules.register('enterpriseLicense', (value: unknown) => {
  if (!value) return null;
  return String(value).startsWith('CORP-') ? null : 'License key must begin with "CORP-".';
});

rules.register('checkUsernameAvailable', async (value: unknown) => {
  if (!value) return null;
  const taken = ['admin', 'root', 'superuser'];
  return taken.includes(String(value).toLowerCase()) ? 'Username is already taken.' : null;
});

// 2. Define schema with strict TypeScript 5 autocomplete
const schema: ValidationSchema = {
  username: ['required', 'minLength:3', 'checkUsernameAvailable'],
  email: ['required', 'email'],
  age: ['required', 'numeric', 'between:18,65'],
  deviceId: ['required', 'uuid'],
  serverIp: ['required', 'ip:v4'],
  configPayload: ['required', 'json'],
  promoCode: ['regex:^[A-Z]{3}-\\d{4}$,i'],
  password: ['required', 'passwordStrict'],
  confirmPassword: ['required', 'sameAs:password'],
  accountType: ['required', 'oneOf:personal,business'],
  taxId: ['requiredIf:accountType,business'],
  licenseKey: ['required', 'enterpriseLicense']
};

// 3. Instantiate with options (locale, custom field labels)
const validator = new UniversalValidator(schema, {
  locale: 'en', // 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh'
  labels: {
    taxId: 'Corporate Tax ID',
    confirmPassword: 'Password Confirmation'
  }
});

// 4. Validate data payload synchronously
const syncResult: ValidationResult = validator.validate(formData);
console.log(syncResult.isValid); // true or false
console.log(syncResult.errors);  // Record<string, string>

// 5. Or validate asynchronously (awaiting remote or Promise-based rules)
const asyncResult: ValidationResult = await validator.validateAsync(formData);
```

---

## 🌐 Internationalization (i18n)

### Built-in Locales
The validator ships with complete dictionaries for:
* **English (`en`)** *(default)*
* **Spanish (`es`)**
* **French (`fr`)**
* **German (`de`)**
* **Hindi (`hi`)**
* **Chinese (`zh`)**

### Global & Instance Locale Switching
```javascript
// Switch globally across all validator instances
UniversalValidator.setLocale('es');

// Or set per-instance
const validator = new UniversalValidator(schema, { locale: 'fr' });
validator.setLocale('de');

// In HTML Zero-JS mode
// <form data-validator data-locale="hi">
```

### Registering Custom Locales
```javascript
UniversalValidator.registerLocale('pt', {
  required: 'O campo {field} é obrigatório.',
  email: 'Por favor, insira um endereço de e-mail válido.',
  minLength: 'O campo {field} deve ter pelo menos {0} caracteres.',
  between: 'O valor de {field} deve estar entre {0} e {1}.'
});
```

---

## 🏷️ Dynamic Token Interpolation

Templates automatically interpolate:
* `{field}`: Friendly name derived in order of precedence:
  1. `data-label` attribute on the element (`data-label="Work Email"`)
  2. Text of linked `<label for="...">` or parent `<label>` (cleans punctuation and asterisks)
  3. Instance labels map (`new UniversalValidator(schema, { labels: { field: 'Label' } })`)
  4. Fallback to the field's `name` attribute.
* `{0}`, `{1}`, etc.: Arguments passed to the rule (e.g., `between:18,65` -> `{0}` = 18, `{1}` = 65).

```html
<!-- Automatically uses active locale template with derived field name and parameters -->
<input 
  name="age" 
  data-label="Applicant Age" 
  data-rules="between:18,65"
>
<!-- English output: "Applicant Age must be between 18 and 65." -->
<!-- Spanish output: "Debe estar entre 18 y 65." -->
```

*(Optional)* You can also specify an explicit element-level message override using `data-msg-[rule]`:
```html
<input name="pin" data-rules="minLength:4" data-msg-minlength="Custom PIN message: requires {0} digits.">
```

---

## 📖 Complete Built-in Rules Reference (36 Enterprise Rules)

| Rule Syntax | Description | Example |
| :--- | :--- | :--- |
| `required` | Value cannot be empty, null, undefined, or whitespace. | `data-rules="required"` |
| `requiredIf:target,val` | Mandatory if `target` equals specified `val`. | `data-rules="requiredIf:accountType,business"` |
| `requiredWith:target` | Mandatory if `target` has any non-empty value. | `data-rules="requiredWith:referralCode"` |
| `requiredWithout:target` | Mandatory if `target` is empty/absent. | `data-rules="requiredWithout:phone"` |
| `dependsOn:target` | Automatically re-evaluates field when `target` changes. | `data-rules="dependsOn:accountType"` |
| `email` | Validates standard email address syntax. | `data-rules="required|email"` |
| `numeric` | Allows integers, floating-point decimals, and negative numbers. | `data-rules="numeric"` |
| `strictNumeric` | Whole non-negative numbers/digits only. | `data-rules="strictNumeric"` |
| `min:value` | Numeric value must be >= minimum threshold. | `data-rules="numeric|min:0"` |
| `max:value` | Numeric value must be <= maximum threshold. | `data-rules="numeric|max:100"` |
| `between:min,max` | Numeric range constraint (>= min and <= max). | `data-rules="between:18,65"` |
| `minLength:N` | String length must be >= N characters. | `data-rules="minLength:8"` |
| `maxLength:N` | String length must be <= N characters. | `data-rules="maxLength:32"` |
| `sameAs:target` | Confirms value matches target field (alias for match). | `data-rules="sameAs:password"` |
| `match:target` | Confirms current field matches another target field. | `data-rules="match:password"` |
| `passwordStrict` | 8+ chars with 1 lowercase, 1 uppercase, 1 digit, 1 symbol. | `data-rules="passwordStrict"` |
| `alphaLetters` | Alphabetical letters and spaces only. | `data-rules="alphaLetters"` |
| `alphaNumeric` | Letters and digits only. | `data-rules="alphaNumeric"` |
| `safeText` | Blocks dangerous script/SQL injection characters. | `data-rules="safeText"` |
| `urlValid` | Validates HTTP/HTTPS URL format using Web URL API. | `data-rules="urlValid"` |
| `phone` | Domestic and international telephone formatting. | `data-rules="phone"` |
| `creditCard` | Validates credit card number via Luhn algorithm. | `data-rules="creditCard"` |
| `date` | Standard calendar date formatting (`YYYY-MM-DD`). | `data-rules="date"` |
| `dateBefore:target` | Date must occur before target date field. | `data-rules="dateBefore:endDate"` |
| `dateAfter:target` | Date must occur after target date field. | `data-rules="dateAfter:startDate"` |
| `dateTime` | Validates ISO date-time strings (`YYYY-MM-DDTHH:MM`). | `data-rules="dateTime"` |
| `dateTimeAfter:target` | Date-time must occur after target date-time field. | `data-rules="dateTimeAfter:start"` |
| `minDate` | Date must be today or in the future. | `data-rules="minDate"` |
| `maxDate` | Date must be today or in the past. | `data-rules="maxDate"` |
| `minDateTime` | Date-time must be current timestamp or future. | `data-rules="minDateTime"` |
| `maxDateTime` | Date-time must be current timestamp or past. | `data-rules="maxDateTime"` |
| `oneOf:v1,v2,v3` | Value must be in the specified comma-separated list. | `data-rules="oneOf:small,medium,large"` |
| `regex:pattern,flags` | Matches string against regular expression with flags. | `data-rules="regex:^[A-Z]{3}$,i"` |
| `json` | String must contain valid parseable JSON. | `data-rules="json"` |
| `uuid` | Validates RFC-compliant UUID format (v1–v5). | `data-rules="uuid"` |
| `ip:v4\|v6` | Validates IPv4 or IPv6 network address format. | `data-rules="ip:v4"` |
| `fileType:exts` | Validates uploaded file extensions/MIME types. | `data-rules="fileType:.pdf,.docx"` |
| `fileSize:maxMB` | File size must not exceed specified MB limit. | `data-rules="fileSize:10"` |
| `checked` | Checkbox element must be checked (`true`). | `data-rules="checked"` |
| `remote:url` | Asynchronously validates value against server API. | `data-rules="remote:/api/check-username"` |

---

## 📡 Custom Lifecycle Events

Forms bound in Zero-JS mode dispatch bubbling native CustomEvents:

| Event Name | Detail Payload | Description |
| :--- | :--- | :--- |
| `uv:validate` | `{}` | Dispatched immediately prior to form validation. |
| `uv:field:validated` | `{ field, isValid, error }` | Fired each time an individual field finishes evaluation. |
| `uv:success` | `{}` | Dispatched when all form fields pass validation. Supports `e.preventDefault()`. |
| `uv:fail` | `{ errors, firstInvalidInput }` | Dispatched when validation errors are encountered. |

<<<<<<< Updated upstream
**Author:** Mayuresh Pandit  
**License:** [MIT](LICENSE)
=======
---

## ♿ Accessibility (WCAG 2.1 AA)

In Zero-JS mode, the engine automatically manages accessibility attributes:
* Assigns deterministic error IDs: `id="uv-error-[fieldName]"`.
* Links inputs to their error messages using `aria-describedby="uv-error-[fieldName]"`.
* Declares `aria-invalid="true"` on invalid inputs (removed upon valid state).
* Applies `role="alert"` and `aria-live="polite"` to error text elements.
* Automatically purges ARIA attributes and error messages upon form reset (`form.reset()` or `resetFormState(form)`).

---

## 🧪 Testing & Examples

The package includes both interactive browser showcases and automated TypeScript runners:

### 1. Interactive Web Showcase
```bash
npm run example:serve
```
Starts a local test server at `http://localhost:3000/examples/index.html` with a real backend `/api/check-username` HTTP endpoint so you can test debounced async validation directly in the **DevTools Network tab**.

### 2. Comprehensive TypeScript 5 Test Suite
```bash
npm run example:ts
```
Executes `examples/example.ts` using `tsx`, validating all enterprise, async, conditional, and multi-locale features with colorized terminal output.

### 3. Automated Test Suite & Typecheck
```bash
# Run all 111 unit & DOM tests (Jest + JSDOM)
npm test

# Verify strict TypeScript 5 types
npm run typecheck

# Build dual ESM, CJS, and minified CDN bundles
npm run build
```

---

## 💖 Support & License

* **Author:** Mayuresh Pandit
* **License:** [MIT](LICENSE)
* **Contributions:** Pull requests and issues are warmly welcomed on [GitHub](https://github.com/GamersStop/universal-form-validator).
>>>>>>> Stashed changes
