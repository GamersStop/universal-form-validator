/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Client-side DOM auto-binding and runtime event handling module. 
 *              Injects validation CSS styles, manages field event listeners (blur, input, submit), 
 *              and renders prototype-safe error messaging dynamically within forms.
 */

const { UniversalValidator } = require('./validator');
const { rules: builtInRules, getRuleDefinition } = require('./rules');
const { interpolate, deriveFieldLabel } = require('./i18n');

/**
 * Injects core validation UI styles (error outlines, shake animations, and text formatting) 
 * into the document head if not already present.
 */
const injectStyles = () => {
  if (document.getElementById('uv-styles')) return;

  const style = document.createElement('style');
  style.id = 'uv-styles';
  style.textContent = '.uv-input-error{border:2px solid #dc3545!important;animation:uv-shake 0.3s ease-in-out;}.uv-input-success{border:2px solid #28a745!important;}.uv-validating{opacity:0.7;cursor:wait;}.uv-error-text{color:#dc3545;font-size:0.875em;display:block;margin-top:4px;font-family:inherit;}@keyframes uv-shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-4px);}75%{transform:translateX(4px);}}';
  document.head.appendChild(style);
};

/**
 * Resets all validation UI artifacts (error/success classes, error text spans, and ARIA attributes)
 * within a form, restoring pristine default DOM states.
 * @param {HTMLFormElement} form - The form element to reset.
 */
const resetFormState = (form) => {
  if (!form) return;

  // Remove all error text spans inside the form
  const errorElements = form.querySelectorAll('.uv-error-text');
  errorElements.forEach(el => el.remove());

  // Reset inputs with error/success classes and ARIA attributes
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.classList.remove('uv-input-error', 'uv-input-success', 'uv-validating');
    input.removeAttribute('aria-invalid');
    const describedBy = input.getAttribute('aria-describedby');
    if (describedBy) {
      const remaining = describedBy.split(' ').filter(id => !id.startsWith('uv-error-')).join(' ').trim();
      if (remaining) {
        input.setAttribute('aria-describedby', remaining);
      } else {
        input.removeAttribute('aria-describedby');
      }
    }
  });
};

/**
 * Validates a single DOM input element against its assigned rules, cleaning up previous 
 * error states and rendering updated error messages safely using textContent.
 * @param {HTMLElement} input - The input element to validate.
 * @param {HTMLFormElement} form - The parent form container element.
 * @returns {boolean} True if the field is valid, false otherwise.
 */
const validateField = (input, form, options = {}) => {
  const fieldName = input.name;
  if (!fieldName || !input.parentNode) return true;

  const isRadio = input.type === 'radio';
  const isCheckbox = input.type === 'checkbox';
  const isGrouped = isRadio || isCheckbox;
  const groupInputs = isGrouped
    ? Array.from(form.querySelectorAll(`input[type="${input.type}"][name="${fieldName}"]`))
    : [input];

  const errorId = `uv-error-${fieldName}`;

  // Clear existing error messages and invalid states specifically mapped to this field
  const existingErrors = form.querySelectorAll(`.uv-error-text[data-for="${fieldName}"]`);
  existingErrors.forEach(el => el.remove());

  groupInputs.forEach(inp => {
    inp.classList.remove('uv-input-error');
    inp.removeAttribute('aria-invalid');
    const desc = inp.getAttribute('aria-describedby');
    if (desc) {
      const remaining = desc.split(' ').filter(id => id !== errorId).join(' ').trim();
      if (remaining) {
        inp.setAttribute('aria-describedby', remaining);
      } else {
        inp.removeAttribute('aria-describedby');
      }
    }
  });

  // Extract rules from input or from any sibling in the group that defines data-rules
  let rulesString = input.getAttribute('data-rules') || '';
  if (!rulesString && isGrouped) {
    for (const grpInput of groupInputs) {
      const r = grpInput.getAttribute('data-rules');
      if (r) {
        rulesString = r;
        break;
      }
    }
  }

  if (!rulesString) {
    form.dispatchEvent(new CustomEvent('uv:field:validated', {
      bubbles: true,
      detail: { field: fieldName, isValid: true, error: null }
    }));
    return true;
  }

  const hasAsyncRule = rulesString.includes('remote:') || rulesString === 'remote';

  const rulesArray = rulesString.split('|').map(ruleToken => {
    let ruleName = ruleToken;
    let ruleArg = null;

    const colonIdx = ruleToken.indexOf(':');
    if (colonIdx !== -1) {
      ruleName = ruleToken.slice(0, colonIdx);
      ruleArg = ruleToken.slice(colonIdx + 1);
    }

    const lowerRuleName = ruleName.toLowerCase();
    let customMsg = input.getAttribute(`data-msg-${lowerRuleName}`);
    if (!customMsg && isGrouped) {
      for (const grpInput of groupInputs) {
        const msg = grpInput.getAttribute(`data-msg-${lowerRuleName}`);
        if (msg) {
          customMsg = msg;
          break;
        }
      }
    }

    // Look up rule dynamically using prototype-safe getter
    const ruleDef = getRuleDefinition(builtInRules, ruleName);

    if (ruleDef) {
      const isRemote = lowerRuleName === 'remote';
      const validatorFn = (typeof ruleDef === 'function' && ruleArg !== null)
        ? (isRemote ? ruleDef(ruleArg, options) : ruleDef(ruleArg))
        : (isRemote ? ruleDef('', options) : ruleDef);

      return (val, allData) => {
        const res = typeof validatorFn === 'function' ? validatorFn(val, allData, input) : null;
        const resolveFinalMessage = (msg) => {
          if (!msg) return null;
          if (customMsg) {
            const label = deriveFieldLabel(input);
            const ruleParams = ruleArg !== null ? ruleArg.split(',').map(s => s.trim()) : [];
            return interpolate(customMsg, ruleParams, { field: label });
          }
          return msg;
        };

        if (res && typeof res.then === 'function') {
          return res.then(resolveFinalMessage);
        }
        return resolveFinalMessage(res);
      };
    }

    return ruleToken;
  });

  // Aggregate current values from all form inputs for interdependent validations (e.g., match, dateAfter)
  const allInputs = form.querySelectorAll('input, select, textarea');
  const data = {};

  allInputs.forEach(inp => {
    if (!inp.name) return;

    if (inp.type === 'radio') {
      if (inp.checked) {
        data[inp.name] = inp.value;
      } else if (!(inp.name in data)) {
        data[inp.name] = '';
      }
    } else if (inp.type === 'checkbox') {
      const chkGroup = form.querySelectorAll(`input[type="checkbox"][name="${inp.name}"]`);
      if (chkGroup.length > 1) {
        if (!data[inp.name]) {
          data[inp.name] = [];
        }
        if (inp.checked) {
          data[inp.name].push(inp.value);
        }
      } else {
        data[inp.name] = inp.checked;
      }
    } else if (inp.type === 'file') {
      data[inp.name] = inp.files;
    } else {
      data[inp.name] = inp.value;
    }
  });

  const validator = new UniversalValidator({ [fieldName]: rulesArray });

  const applyResult = (result) => {
    const errorMsg = (result && result.errors) ? result.errors[fieldName] : null;
    const isFieldValid = !errorMsg;

    if (errorMsg) {
      groupInputs.forEach(inp => {
        inp.classList.add('uv-input-error');
        inp.setAttribute('aria-invalid', 'true');
        const desc = inp.getAttribute('aria-describedby');
        if (!desc) {
          inp.setAttribute('aria-describedby', errorId);
        } else if (!desc.split(' ').includes(errorId)) {
          inp.setAttribute('aria-describedby', `${desc} ${errorId}`);
        }
      });

      // Create and insert error text element safely preventing XSS via textContent
      const span = document.createElement('span');
      span.id = errorId;
      span.className = 'uv-error-text';
      span.setAttribute('data-for', fieldName);
      span.setAttribute('role', 'alert');
      span.setAttribute('aria-live', 'polite');
      span.textContent = errorMsg;

      // Check for custom error placement via data-error-target
      let errorTargetSelector = input.getAttribute('data-error-target');
      if (!errorTargetSelector && isGrouped) {
        for (const grpInput of groupInputs) {
          const t = grpInput.getAttribute('data-error-target');
          if (t) {
            errorTargetSelector = t;
            break;
          }
        }
      }

      const customTarget = errorTargetSelector
        ? (form.querySelector(errorTargetSelector) || document.querySelector(errorTargetSelector))
        : null;

      if (customTarget) {
        customTarget.appendChild(span);
      } else if (isRadio || (isCheckbox && groupInputs.length > 1)) {
        const fieldset = input.closest('fieldset');
        if (fieldset && fieldset.parentNode) {
          fieldset.parentNode.insertBefore(span, fieldset.nextSibling);
        } else {
          const lastInput = groupInputs[groupInputs.length - 1];
          const targetNode = (lastInput.labels && lastInput.labels.length > 0)
            ? lastInput.labels[lastInput.labels.length - 1]
            : lastInput;
          if (targetNode.parentNode) {
            targetNode.parentNode.insertBefore(span, targetNode.nextSibling);
          } else {
            input.parentNode.insertBefore(span, input.nextSibling);
          }
        }
      } else {
        input.parentNode.insertBefore(span, input.nextSibling);
      }
    }

    form.dispatchEvent(new CustomEvent('uv:field:validated', {
      bubbles: true,
      detail: { field: fieldName, isValid: isFieldValid, error: errorMsg }
    }));

    return isFieldValid;
  };

  if (hasAsyncRule) {
    return validator.validateAsync(data).then(applyResult);
  }

  const syncResult = validator.validate(data);
  return applyResult(syncResult);
};

let activeObserver = null;

const bindFormInputs = (form) => {
  const formTrigger = form.getAttribute('data-trigger') || 'submit';
  const inputs = form.querySelectorAll('[data-rules]:not([data-uv-input-bound])');
  const boundGroupNames = new Set();

  inputs.forEach(input => {
    input.setAttribute('data-uv-input-bound', 'true');
    const isRadioOrCheckbox = input.type === 'radio' || input.type === 'checkbox';
    const rulesString = input.getAttribute('data-rules') || '';
    const hasRemote = rulesString.includes('remote:') || rulesString === 'remote';
    const debounceAttr = input.getAttribute('data-debounce');
    const debounceMs = debounceAttr !== null ? parseInt(debounceAttr, 10) : (hasRemote ? 300 : 0);
    const trigger = input.getAttribute('data-trigger') || (debounceMs > 0 ? 'input' : formTrigger);

    let debounceTimer = null;
    let currentAbortController = null;

    const triggerValidation = () => {
      if (debounceMs > 0) {
        input.classList.add('uv-validating');
        if (debounceTimer) clearTimeout(debounceTimer);
        if (currentAbortController) {
          currentAbortController.abort();
        }
        currentAbortController = (typeof AbortController !== 'undefined') ? new AbortController() : null;

        debounceTimer = setTimeout(async () => {
          try {
            await validateField(input, form, { signal: currentAbortController ? currentAbortController.signal : undefined });
          } finally {
            input.classList.remove('uv-validating');
          }
        }, debounceMs);
      } else {
        validateField(input, form);
      }
    };

    if (isRadioOrCheckbox) {
      const groupKey = `${input.type}:${input.name}`;
      if (!boundGroupNames.has(groupKey)) {
        boundGroupNames.add(groupKey);
        const groupInputs = form.querySelectorAll(`input[type="${input.type}"][name="${input.name}"]`);
        groupInputs.forEach(grpInput => {
          grpInput.addEventListener('change', () => validateField(input, form));
        });
      }
    } else {
      if (trigger === 'blur') {
        input.addEventListener('blur', () => validateField(input, form));
      } else if (trigger === 'change') {
        input.addEventListener('change', triggerValidation);
      } else if (trigger === 'input' || trigger === 'keypress') {
        const eventType = input.type === 'file' ? 'change' : 'input';
        input.addEventListener(eventType, triggerValidation);
      }
    }

    let dependsOnField = input.getAttribute('data-depends-on');
    if (!dependsOnField && rulesString.includes('dependsOn:')) {
      const match = rulesString.match(/dependsOn:([^,|]+)/);
      if (match) dependsOnField = match[1].trim();
    }
    if (!dependsOnField) {
      const reqIfMatch = rulesString.match(/requiredIf:([^,|]+)/);
      if (reqIfMatch) dependsOnField = reqIfMatch[1].trim();
    }
    if (!dependsOnField) {
      const reqWithMatch = rulesString.match(/requiredWith(?:out)?:([^,|]+)/);
      if (reqWithMatch) dependsOnField = reqWithMatch[1].trim();
    }

    if (dependsOnField) {
      const targetInputs = form.querySelectorAll(`[name="${dependsOnField}"]`);
      targetInputs.forEach(target => {
        target.addEventListener('change', () => validateField(input, form));
        target.addEventListener('input', () => validateField(input, form));
      });
    }
  });
};

const bindForm = (form) => {
  if (form.getAttribute('data-uv-bound') === 'true') {
    bindFormInputs(form);
    return;
  }
  form.setAttribute('data-uv-bound', 'true');
  bindFormInputs(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Dispatch uv:validate prior to validation execution
    const validateEvt = new CustomEvent('uv:validate', { bubbles: true, cancelable: true });
    const notCancelled = form.dispatchEvent(validateEvt);
    if (!notCancelled) return;

    let formIsValid = true;
    let firstInvalidInput = null;
    const formErrors = {};
    const validatedFields = new Set();
    const asyncValidations = [];

    const currentInputs = form.querySelectorAll('[data-rules]');

    for (const input of currentInputs) {
      const fieldName = input.name;
      if ((input.type === 'radio' || input.type === 'checkbox') && validatedFields.has(fieldName)) {
        continue;
      }
      validatedFields.add(fieldName);

      const res = validateField(input, form);
      if (res && typeof res.then === 'function') {
        asyncValidations.push(
          res.then(isValid => {
            if (!isValid) {
              formIsValid = false;
              if (!firstInvalidInput) firstInvalidInput = input;
              const errSpan = form.querySelector(`.uv-error-text[data-for="${fieldName}"]`);
              if (errSpan) formErrors[fieldName] = errSpan.textContent;
            }
          })
        );
      } else {
        if (!res) {
          formIsValid = false;
          if (!firstInvalidInput) firstInvalidInput = input;
          const errSpan = form.querySelector(`.uv-error-text[data-for="${fieldName}"]`);
          if (errSpan) formErrors[fieldName] = errSpan.textContent;
        }
      }
    }

    const finalizeSubmit = () => {
      if (formIsValid) {
        const successEvt = new CustomEvent('uv:success', { bubbles: true, cancelable: true });
        const allowed = form.dispatchEvent(successEvt);
        const isAjax = form.getAttribute('data-ajax') === 'true';
        if (!isAjax && allowed) {
          form.submit();
        }
      } else {
        const failEvt = new CustomEvent('uv:fail', {
          bubbles: true,
          detail: { errors: formErrors, firstInvalidInput }
        });
        form.dispatchEvent(failEvt);
        if (firstInvalidInput) {
          firstInvalidInput.focus();
        }
      }
    };

    if (asyncValidations.length > 0) {
      Promise.all(asyncValidations).then(finalizeSubmit);
    } else {
      finalizeSubmit();
    }
  });

  // Clean up all validation artifacts on form reset
  form.addEventListener('reset', () => {
    resetFormState(form);
  });
};

/**
 * Scans the document for forms marked with `data-validator`, ensures idempotency, 
 * and attaches appropriate real-time validation triggers and form submission listeners.
 * Optionally observes DOM mutations for dynamic form and input additions.
 * @param {Object} [options={}] - Configuration options.
 * @param {boolean} [options.observe=false] - Whether to watch DOM mutations with MutationObserver.
 * @returns {MutationObserver|undefined} The active observer if observe is enabled.
 */
const initAutoBind = (options = {}) => {
  injectStyles();

  const forms = document.querySelectorAll('form[data-validator]');
  forms.forEach(bindForm);

  if (options && options.observe && typeof MutationObserver !== 'undefined') {
    if (!activeObserver && typeof document !== 'undefined' && document.body) {
      activeObserver = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          if (!mutation.addedNodes) continue;
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;
            if (node.matches && node.matches('form[data-validator]')) {
              bindForm(node);
            } else if (node.querySelectorAll) {
              node.querySelectorAll('form[data-validator]').forEach(bindForm);
              const parentForm = node.closest ? node.closest('form[data-validator][data-uv-bound="true"]') : null;
              if (parentForm) {
                bindFormInputs(parentForm);
              } else {
                node.querySelectorAll('form[data-validator][data-uv-bound="true"]').forEach(bindFormInputs);
              }
            }
          }
        }
      });
      activeObserver.observe(document.body, { childList: true, subtree: true });
    }
    return activeObserver;
  }
};

// Automatically bind forms when DOM is fully loaded in browser environments
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => initAutoBind());
}

module.exports = { initAutoBind, resetFormState };