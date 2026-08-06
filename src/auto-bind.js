/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Client-side DOM auto-binding and runtime event handling module. 
 *              Injects validation CSS styles, manages field event listeners (blur, input, submit), 
 *              and renders prototype-safe error messaging dynamically within forms.
 */

const { UniversalValidator } = require('./validator');
const { rules: builtInRules, getRuleDefinition } = require('./rules');

/**
 * Injects core validation UI styles (error outlines, shake animations, and text formatting) 
 * into the document head if not already present.
 */
const injectStyles = () => {
  if (document.getElementById('uv-styles')) return;

  const style = document.createElement('style');
  style.id = 'uv-styles';
  style.textContent = `
    .uv-input-error {
      border: 2px solid #dc3545 !important;
      animation: uv-shake 0.3s ease-in-out;
    }
    .uv-error-text {
      color: #dc3545;
      font-size: 0.875em;
      display: block;
      margin-top: 4px;
      font-family: inherit;
    }
    @keyframes uv-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
};

/**
 * Validates a single DOM input element against its assigned rules, cleaning up previous 
 * error states and rendering updated error messages safely using textContent.
 * @param {HTMLElement} input - The input element to validate.
 * @param {HTMLFormElement} form - The parent form container element.
 * @returns {boolean} True if the field is valid, false otherwise.
 */
const validateField = (input, form) => {
  const fieldName = input.name;
  if (!fieldName || !input.parentNode) return true;

  // Clear existing error messages and invalid states specifically mapped to this field
  const existingError = input.parentNode.querySelector(`.uv-error-text[data-for="${fieldName}"]`);
  if (existingError) existingError.remove();
  input.classList.remove('uv-input-error');
  input.removeAttribute('aria-invalid');

  const rulesString = input.getAttribute('data-rules') || '';
  const rulesArray = rulesString.split('|').map(ruleToken => {
    let ruleName = ruleToken;
    let ruleArg = null;

    if (ruleToken.includes(':')) {
      const parts = ruleToken.split(':');
      ruleName = parts[0];
      ruleArg = parts[1];
    }

    const lowerRuleName = ruleName.toLowerCase();
    const customMsg = input.getAttribute(`data-msg-${lowerRuleName}`);

    // Look up rule dynamically using prototype-safe getter
    const ruleDef = getRuleDefinition(builtInRules, ruleName);

    if (ruleDef) {
      const validatorFn = (typeof ruleDef === 'function' && ruleArg !== null)
        ? ruleDef(ruleArg)
        : ruleDef;

      return (val, allData) => {
        const error = typeof validatorFn === 'function' ? validatorFn(val, allData, input) : null;
        if (error) {
          // Use custom error attribute message if present, otherwise default rule message
          return customMsg || error;
        }
        return null;
      };
    }

    return ruleToken;
  });

  // Aggregate current values from all form inputs for interdependent validations (e.g., match, dateAfter)
  const allInputs = form.querySelectorAll('[data-rules]');
  const data = {};
  allInputs.forEach(inp => {
    if (inp.name) {
      if (inp.type === 'checkbox') {
        data[inp.name] = inp.checked;
      } else if (inp.type === 'file') {
        data[inp.name] = inp.files;
      } else {
        data[inp.name] = inp.value;
      }
    }
  });

  const validator = new UniversalValidator({ [fieldName]: rulesArray });
  const result = validator.validate(data);

  if (result.errors[fieldName]) {
    const errorMsg = result.errors[fieldName];
    input.classList.add('uv-input-error');
    input.setAttribute('aria-invalid', 'true');

    // Create and insert error text element safely preventing XSS via textContent
    const span = document.createElement('span');
    span.className = 'uv-error-text';
    span.setAttribute('data-for', fieldName);
    span.textContent = errorMsg;
    input.parentNode.insertBefore(span, input.nextSibling);
    return false;
  }
  return true;
};

/**
 * Scans the document for forms marked with `data-validator`, ensures idempotency, 
 * and attaches appropriate real-time validation triggers and form submission listeners.
 */
const initAutoBind = () => {
  const forms = document.querySelectorAll('form[data-validator]:not([data-uv-bound])');
  if (forms.length === 0) return;

  injectStyles();

  forms.forEach(form => {
    form.setAttribute('data-uv-bound', 'true');
    const formTrigger = form.getAttribute('data-trigger') || 'submit';
    const inputs = form.querySelectorAll('[data-rules]');

    inputs.forEach(input => {
      const trigger = input.getAttribute('data-trigger') || formTrigger;

      if (trigger === 'blur') {
        input.addEventListener('blur', () => validateField(input, form));
      } else if (trigger === 'input' || trigger === 'keypress') {
        const eventType = input.type === 'file' ? 'change' : 'input';
        input.addEventListener(eventType, () => validateField(input, form));
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let formIsValid = true;
      let firstInvalidInput = null;

      inputs.forEach(input => {
        const isValid = validateField(input, form);
        if (!isValid) {
          formIsValid = false;
          if (!firstInvalidInput) firstInvalidInput = input;
        }
      });

      if (formIsValid) {
        form.submit();
      } else if (firstInvalidInput) {
        firstInvalidInput.focus();
      }
    });
  });
};

// Automatically bind forms when DOM is fully loaded in browser environments
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initAutoBind);
}

module.exports = { initAutoBind };