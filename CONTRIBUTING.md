# Contributing to Universal Form Validator

First off, thank you for considering contributing! This library is built to make form validation painless for everyone, and community contributions are what make open-source great.

## How to Contribute

### 1. Reporting Bugs
If you find a bug, please open an issue on GitHub. Include:
* What you expected to happen.
* What actually happened.
* A small code snippet showing your form schema or HTML structure.

### 2. Local Development Setup
To run the project on your own machine:
1. Fork the repository on GitHub.
2. Clone your fork locally: `git clone https://github.com/YOUR_USERNAME/universal-form-validator.git`
3. Install development dependencies: `npm install`
4. Run the test suite to ensure everything works: `npm test`

### 3. Adding a New Validation Rule
This is the most common way to contribute! If you have a great idea for a new rule (e.g., `creditCard`, `isURL`), follow these exact steps:

1. **Write the Logic:** Open `src/rules.js` and add your function to the dictionary. It should return `null` if the data is valid, or an error string if it fails.
2. **Write the Tests:** Open `tests/rules.test.js` and write at least one passing test and one failing test for your new rule.
3. **Verify:** Run `npm test`. Your code will not be accepted if the tests fail.

### 4. Submitting a Pull Request (PR)
1. Create a new branch for your feature: `git checkout -b feature/name-of-rule`
2. Ensure your code is formatted (Prettier) and has no warnings (ESLint).
3. Commit your changes with a clear message: `git commit -m "feat: add creditCard validation rule"`
4. Push to your fork and open a Pull Request against our `main` branch.

We will review your code, run the CI/CD pipeline, and merge it in!