# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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