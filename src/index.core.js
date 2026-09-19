/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Core bundle entry point (<4KB gzipped).
 */

const { UniversalValidator } = require('./validator');
const { initAutoBind, resetFormState } = require('./auto-bind');
const { rules } = require('./rules');

if (typeof window !== 'undefined') {
  window.UniversalValidator = UniversalValidator;
  window.UniversalValidatorRules = rules;
  window.initAutoBind = initAutoBind;
  window.resetFormState = resetFormState;
}

module.exports = { UniversalValidator, initAutoBind, resetFormState, rules };
