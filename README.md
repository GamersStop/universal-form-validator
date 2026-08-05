# Universal Form Validator

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-green.svg)

A lightning-fast, zero-dependency form validation library. Use it entirely via HTML attributes (Zero-JS mode) or programmatically via the JavaScript API.

## Features
* **Zero Dependencies:** Incredibly small footprint.
* **Zero-JS Mode:** Automatically validates forms by scanning `data-` attributes.
* **Fail-Fast Engine:** Stops evaluating a field on the first rule failure.
* **Custom Error Messages:** Override default errors directly in your HTML.
* **Framework Agnostic:** Works with Vanilla JS, React, Vue, WordPress, and more.

## Installation

```bash
npm install universal-form-validator
```

## Option 1: Zero-JS Mode (HTML Only)

Simply load the script and add `data-validator` to your form. Define rules using `data-rules` on your inputs. The library will automatically inject CSS and handle the DOM manipulation.

```html
<form data-validator>
  <!-- Basic required rule -->
  <input type="text" name="username" data-rules="required">
  
  <!-- Multiple rules with a custom error message override -->
  <input type="email" name="email" data-rules="required|email" data-msg-required="We need this to send your receipt!">
  
  <button type="submit">Submit</button>
</form>

<script src="node_modules/universal-form-validator/dist/validator.min.js"></script>
```

## Option 2: JavaScript API

If you are using a frontend framework or need manual control, you can import the core engine directly.

```javascript
import { UniversalValidator } from 'universal-form-validator';

const schema = {
  username: ['required'],
  email: ['required', 'email']
};

const validator = new UniversalValidator(schema);

const data = { username: '', email: 'bad-email' };
const result = validator.validate(data);

console.log(result.isValid); // false
console.log(result.errors.email); // "Please enter a valid email address."
```

## Available Built-in Rules
* `required`: Fails if the field is empty.
* `email`: Validates standard email formats.
* `strictNumeric`: Fails if the string contains any non-number characters.

## Contributing
Please see `CONTRIBUTING.md` for details on how to add new rules and run the test suite.

## Support
If you found this library helpful and it saved you some time, please consider supporting the work!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/dreainno)

*[Direct link: https://ko-fi.com/dreainno](https://ko-fi.com/dreainno)*