const { UniversalValidator } = require('./validator');
const { initAutoBind } = require('./auto-bind');
const { rules } = require('./rules');

if (typeof window !== 'undefined') {
  window.UniversalValidator = UniversalValidator;
  window.UniversalValidatorRules = rules;
}

module.exports = { UniversalValidator, initAutoBind, rules };