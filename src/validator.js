const { rules: builtInRules } = require('./rules');

class UniversalValidator {
  constructor(schema) {
    this.schema = schema;
  }

  validate(data) {
    let isValid = true;
    const errors = {};

    for (const field in this.schema) {
      const fieldRules = this.schema[field];
      const value = data[field] !== undefined && data[field] !== null ? data[field] : '';

      for (const rule of fieldRules) {
        let errorMessage = null;

        if (typeof rule === 'string') {
          let ruleName = rule;
          let ruleArg = null;

          if (rule.includes(':')) {
            const parts = rule.split(':');
            ruleName = parts[0];
            ruleArg = parts[1];
          }

          const ruleDefinition = builtInRules[ruleName];

          if (ruleDefinition) {
            const validatorFn = (typeof ruleDefinition === 'function' && ruleArg !== null)
              ? ruleDefinition(ruleArg)
              : ruleDefinition;

            if (typeof validatorFn === 'function') {
              errorMessage = validatorFn(value, data);
            }
          }
        }
        else if (typeof rule === 'function') {
          errorMessage = rule(value, data);
        }

        if (errorMessage) {
          errors[field] = errorMessage;
          isValid = false;
          break;
        }
      }
    }

    return { isValid, errors };
  }
}

module.exports = { UniversalValidator };