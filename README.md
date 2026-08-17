# Universal Form Builder (Validator Engine)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-green.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](src/index.d.ts)
[![npm version](https://img.shields.io/npm/v/universal-form-validator.svg)](https://www.npmjs.com/package/universal-form-validator)

A lightweight, lightning-fast, and zero-dependency form validation library created by **Mayuresh Pandit**. Use it declaratively via HTML attributes (**Zero-JS Mode**) or programmatically via the **JavaScript/TypeScript API**.

---

## 🌟 Key Features

* **📦 Zero Dependencies:** Ultra-lightweight footprint with no external npm packages.
* **⚡ Zero-JS Mode:** Automatically validates forms by simply adding `data-validator` and `data-rules` attributes to your HTML elements.
* **🛡️ Security Hardened:** Built-in defenses against **Prototype Pollution** vectors and Object method injection. HTML inputs use safe text rendering to prevent XSS.
* **🚀 Fail-Fast Engine:** Optimized evaluation engine that short-circuits on the first rule failure per field.
* **🎨 Custom Error Messaging:** Override any default error message directly in HTML using `data-msg-[rulename]` attributes.
* **🌐 Framework Agnostic:** Perfect for Vanilla JS, React, Vue, Svelte, Angular, WordPress, or static HTML pages.

---

## 🚀 Installation

Install via npm:

```bash
npm install universal-form-validator
```

Or include it via script tag in your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/universal-form-validator@1.0.0/dist/validator.min.js"></script>
```

---

## 💻 Usage

### Option 1: Zero-JS Mode (HTML Attributes)

Add `data-validator` to your `<form>` and `data-rules` to your `<input>`, `<select>`, or `<textarea>` elements. Multiple rules can be piped together using `|`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Zero-JS Form Validation</title>
</head>
<body>

  <!-- Mark the form with data-validator -->
  <form data-validator action="/submit" method="POST">
    
    <!-- Required Email Field -->
    <div>
      <label for="email">Email Address</label>
      <input type="email" id="email" name="email" data-rules="required|email">
    </div>

    <!-- Password with strict requirements and custom error message -->
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" 
             data-rules="required|passwordStrict"
             data-msg-passwordstrict="Your password must be super secure!">
    </div>

    <!-- Submit Button -->
    <button type="submit">Register</button>
  </form>

  <!-- Load library script to automatically activate Zero-JS auto-binding -->
  <script src="node_modules/universal-form-validator/dist/index.js"></script>
</body>
</html>
```

---

### Option 2: Programmatic JavaScript / TypeScript API

Use `UniversalValidator` programmatically in Node.js, TypeScript, or frontend applications.

```typescript
import { UniversalValidator, rules } from 'universal-form-validator';

// 1. (Optional) Register custom rules securely
rules.register('strongUsername', (value: unknown) => {
  const str = String(value || '');
  return str.startsWith('user_') ? null : 'Username must start with "user_".';
});

// 2. Define schema constraints
const schema = {
  username: ['required', 'minLength:5', 'strongUsername'],
  email: ['required', 'email'],
  age: ['required', 'strictNumeric'],
  confirmPassword: ['required', rules.match('password')]
};

// 3. Instantiate the validator
const validator = new UniversalValidator(schema);

// 4. Validate data payload
const payload = {
  username: 'user_john',
  email: 'john@example.com',
  age: '28',
  password: 'SecretP@ss1',
  confirmPassword: 'SecretP@ss1'
};

const result = validator.validate(payload);

if (result.isValid) {
  console.log('Form data is valid!');
} else {
  console.error('Validation errors:', result.errors);
  /* Output format:
    {
      username: 'Must be at least 5 characters long.'
    }
  */
}
```

---

## 📖 Complete Built-in Rules Reference

The library provides 27 built-in validation rules:

| Rule Name | Description | Example Usage |
| :--- | :--- | :--- |
| `required` | Ensures value is not empty, null, undefined, or whitespace-only. | `data-rules="required"` |
| `email` | Validates standard email address syntax (`user@domain.com`). | `data-rules="required|email"` |
| `strictNumeric` | Ensures the value contains whole numbers/digits only. | `data-rules="strictNumeric"` |
| `alphaLetters` | Ensures value contains only alphabetical letters and spaces. | `data-rules="alphaLetters"` |
| `alphaNumeric` | Ensures value contains letters and numbers only. | `data-rules="alphaNumeric"` |
| `minLength:N` | Ensures input string length is >= N characters. | `data-rules="minLength:8"` |
| `maxLength:N` | Ensures input string length is <= N characters. | `data-rules="maxLength:20"` |
| `match:field` | Confirms current field matches another target field's value. | `data-rules="match:password"` |
| `passwordStrict` | Enforces 8+ chars with lowercase, uppercase, number, & symbol. | `data-rules="passwordStrict"` |
| `safeText` | Blocks dangerous script/SQL injection characters (`< > ' " ; --`). | `data-rules="safeText"` |
| `urlValid` | Validates HTTP/HTTPS URL formatting using the URL API. | `data-rules="urlValid"` |
| `phone` | Validates domestic and international telephone numbers. | `data-rules="phone"` |
| `date` | Validates calendar date formatting (`YYYY-MM-DD`). | `data-rules="date"` |
| `dateBefore:field` | Ensures date field occurs before a target date field. | `data-rules="dateBefore:endDate"` |
| `dateAfter:field` | Ensures date field occurs after a target date field. | `data-rules="dateAfter:startDate"` |
| `dateTime` | Validates ISO date-time strings (`YYYY-MM-DDTHH:MM`). | `data-rules="dateTime"` |
| `dateTimeAfter:field` | Ensures date-time occurs after a target date-time field. | `data-rules="dateTimeAfter:startDateTime"` |
| `minDate` | Validates date is today or in the future (>= today). | `data-rules="minDate"` |
| `maxDate` | Validates date is today or in the past (<= today). | `data-rules="maxDate"` |
| `minDateTime` | Validates date-time is current timestamp or in the future. | `data-rules="minDateTime"` |
| `maxDateTime` | Validates date-time is current timestamp or in the past. | `data-rules="maxDateTime"` |
| `oneOf:v1,v2,v3` | Validates that input selection belongs to an allowed list. | `data-rules="oneOf:apple,banana,orange"` |
| `pattern:regex` | Matches string against a custom regular expression string. | `data-rules="pattern:^EMP-\d{4}$"` |
| `fileType:types` | Validates uploaded file extensions/MIME types (.png, .jpg). | `data-rules="fileType:.jpg,.png,image/jpeg"` |
| `fileSize:maxMB` | Ensures total file size does not exceed specified MB limit. | `data-rules="fileSize:5"` |
| `checked` | Validates checkbox elements are checked (`true`). | `data-rules="checked"` |
| `creditCard` | Validates credit card number authenticity using the Luhn algorithm. | `data-rules="creditCard"` |

---

## 🎯 Customizing Error Messages

Custom error messages can be set declaratively in HTML using `data-msg-[rulename]` attributes. 

```html
<input type="text" 
       name="phone_number" 
       data-rules="required|phone"
       data-msg-required="Mobile number is mandatory!"
       data-msg-phone="Please supply a valid 10-digit phone number.">
```

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 💖 Support the Project

If you find **Universal Form Builder (Validator Engine)** helpful, please consider supporting its ongoing development and maintenance!

[![Support on Ko-fi](https://img.shields.io/badge/Support-Ko--fi-ff5e5b?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/dreainno)

**Author:** Mayuresh Pandit  
**License:** [MIT](LICENSE)
