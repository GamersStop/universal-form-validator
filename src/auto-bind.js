const { UniversalValidator } = require('./validator');
const { rules: builtInRules } = require('./rules');

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

const validateField = (input, form) => {
  const fieldName = input.name;
  if (!fieldName) return true;

  const existingError = input.parentNode.querySelector('.uv-error-text');
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

    // Look up rule dynamically (supports both built-in and dynamically registered custom rules)
    const ruleDef = builtInRules[lowerRuleName] || builtInRules[ruleName];

    if (ruleDef) {
      const validatorFn = (typeof ruleDef === 'function' && ruleArg !== null)
        ? ruleDef(ruleArg)
        : ruleDef;

      return (val, allData) => {
        const error = typeof validatorFn === 'function' ? validatorFn(val, allData, input) : null;
        if (error) {
          return customMsg || error; // Use custom error attribute message if present, otherwise default rule message
        }
        return null;
      };
    }

    return ruleToken;
  });

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

    const span = document.createElement('span');
    span.className = 'uv-error-text';
    span.textContent = errorMsg;
    input.parentNode.insertBefore(span, input.nextSibling);
    return false;
  }
  return true;
};

const initAutoBind = () => {
  const forms = document.querySelectorAll('form[data-validator]');
  if (forms.length === 0) return;

  injectStyles();

  forms.forEach(form => {
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

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initAutoBind);
}

module.exports = { initAutoBind };