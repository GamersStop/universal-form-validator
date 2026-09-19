/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Headless programmatic engine entry point.
 */

const { UniversalValidator } = require('./validator');
const { rules } = require('./rules');

if (typeof window !== 'undefined') {
  window.UniversalValidator = UniversalValidator;
  window.UniversalValidatorRules = rules;
}

module.exports = { UniversalValidator, rules };
