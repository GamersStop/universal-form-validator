# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-14

### Added
- **Asynchronous & Remote Validation Engine:**
  - `UniversalValidator.prototype.validateAsync(data)` for native asynchronous schema validation.
  - Built-in `remote:url` rule supporting asynchronous server-side field uniqueness and verification endpoints.
  - Built-in debouncing via `data-debounce="[ms]"` (default 300ms for remote rules) with `AbortController` cancellation for rapid typing.
  - Dynamic loading state class (`.uv-validating`).
- **Conditional & Interdependent Rules:**
  - `requiredIf:targetField,targetValue`: Field becomes mandatory when target field matches specified value.
  - `requiredWith:targetField`: Field becomes mandatory when target field has any non-empty value.
  - `requiredWithout:targetField`: Field becomes mandatory when target field is empty or absent.
  - `dependsOn:targetField`: Automatically re-evaluates dependent fields on change without manual event wiring.
- **Enterprise Ruleset (36 Total Built-in Rules):**
  - Added `numeric`, `min:value`, `max:value`, `between:min,max`, `sameAs:targetField`, `regex:pattern,flags`, `json`, `uuid`, and `ip:v4|v6`.
- **Zero-JS DOM Engine 2.0 & A11y:**
  - `data-error-target="#selector"`: Relocates error elements into custom containers (floating labels, input groups, modal footers).
  - WCAG 2.1 AA Accessibility: Deterministic error IDs (`id="uv-error-[fieldName]"`), `aria-describedby` linkage, `role="alert"`, `aria-live="polite"`, and `aria-invalid` state management.
  - Custom DOM Lifecycle Events: Native bubbling events (`uv:validate`, `uv:field:validated`, `uv:success`, `uv:fail`).
  - Native Submit Interception: Support for `data-ajax="true"` and `preventDefault()` in `uv:success` for modern fetch/AJAX submissions.
  - Reactive DOM Observation: `initAutoBind({ observe: true })` using `MutationObserver` for dynamically injected forms (HTMX, Alpine.js, Turbo, React).
  - Clean Form Reset: Automatic removal of all validation classes and ARIA attributes on form reset (`form.reset()`).
- **Multi-Locale Dictionary Engine (i18n):**
  - Built-in dictionaries for 6 standard locales: `en` (default), `es` (Spanish), `fr` (French), `de` (German), `hi` (Hindi), and `zh` (Chinese).
  - Global and instance locale management: `UniversalValidator.setLocale()`, `UniversalValidator.registerLocale()`, `validator.setLocale()`.
  - Dynamic token interpolation: `{field}` (derived from `data-label`, `<label>`, or field name) and positional parameters (`{0}`, `{1}`, etc.).
- **Strict TypeScript 5 Type Declarations:**
  - Template literal types for all built-in rules (`minLength:${number}`, `between:${number},${number}`, `requiredIf:${string},${string}`, etc.).
  - Strongly typed exported interfaces: `ValidationResult`, `LocaleDictionary`, `ValidationOptions`, `ValidationSchema`, and `UniversalValidator`.
- **Packaging & CI/CD:**
  - Added `.github/workflows/publish.yml` with provenance attestations and OIDC trusted publishing.
  - Clean `npm audit` verification (0 vulnerabilities).

## [1.0.0] - 2026-08-05

### Added
- **Core Engine:** `UniversalValidator` class to process schemas and data objects.
- **Fail-Fast Validation:** Engine stops evaluating a field upon the first rule failure.
- **Rule Dictionary:** 8 built-in rules including `required`, `email`, `passwordStrict`, `minLength`, `maxLength`, and `match`.
- **Security-Focused Rules:** `alphaNumeric`, `safeText`, and `strictNumeric` to help sanitize client-side inputs.
- **Zero-JS Auto-Binder:** `auto-bind.js` script to automatically scan DOM elements for `data-validator` and `data-rules` attributes.
- **Inline Error UI:** Automated DOM injection for error micro-copy and red border styling.
- **Custom Overrides:** Support for `data-msg-*` attributes to override default error messages in HTML.
- **Testing:** Comprehensive Jest test suite for the core engine and rule dictionary.