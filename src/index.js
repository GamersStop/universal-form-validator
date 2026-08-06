/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Main entry point module. Exports core validation classes, 
 *              auto-binding utilities, and rule dictionaries for both CommonJS 
 *              environments and browser global window injection.
 */

const { UniversalValidator } = require('./validator');
const { initAutoBind } = require('./auto-bind');
const { rules } = require('./rules');

// Expose classes and rules to the browser global scope if running in a browser environment
if (typeof window !== 'undefined') {
  window.UniversalValidator = UniversalValidator;
  window.UniversalValidatorRules = rules;
}

module.exports = { UniversalValidator, initAutoBind, rules };