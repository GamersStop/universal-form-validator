/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Core programmatic validator engine class. Responsible for evaluating 
 *              schema definitions against input data payloads with prototype-safe 
 *              rule lookups and dependency injection support.
 */

const { rules: builtInRules, getRuleDefinition } = require('./rules');

class UniversalValidator {
  /**
   * Initializes the validator instance with a validation schema.
   * @param {Object} schema - Dictionary mapping field names to arrays of rules.
   */
  constructor(schema) {
    this.schema = schema || {};
  }

  /**
   * Validates a complete data object payload against the defined schema rules.
   * @param {Object} data - Key-value pair collection of user input fields.
   * @returns {Object} Result object containing `isValid` boolean and `errors` collection.
   */
  validate(data) {
    let isValid = true;
    const errors = {};

    // Fallback safely to an empty object if data is null, undefined, or malformed
    const safeData = (data && typeof data === 'object') ? data : {};

    // Iterate through every field defined in the schema
    for (const field in this.schema) {
      const fieldRules = this.schema[field];
      const value = safeData[field] !== undefined && safeData[field] !== null ? safeData[field] : '';

      // Skip non-array rule definitions gracefully
      if (!Array.isArray(fieldRules)) {
        continue;
      }

      // Evaluate each rule assigned to the current field sequentially
      for (const rule of fieldRules) {
        let errorMessage = null;

        // Handle string-based declarative rules (e.g., 'required', 'minLength:3')
        if (typeof rule === 'string') {
          let ruleName = rule;
          let ruleArg = null;

          // Parse rule arguments if parameter is passed using colon separator
          if (rule.includes(':')) {
            const parts = rule.split(':');
            ruleName = parts[0];
            ruleArg = parts[1];
          }

          // Securely retrieve rule definition protecting against prototype pollution
          const ruleDefinition = getRuleDefinition(builtInRules, ruleName);

          if (ruleDefinition) {
            // Instantiate factory rules if arguments exist, or fallback to static rule
            const validatorFn = (typeof ruleDefinition === 'function' && ruleArg !== null)
              ? ruleDefinition(ruleArg)
              : ruleDefinition;

            if (typeof validatorFn === 'function') {
              // Execute validation function passing field value and the complete safe data payload
              errorMessage = validatorFn(value, safeData);
            }
          }
        }
        // Handle custom programmatic inline functions passed directly into schema arrays
        else if (typeof rule === 'function') {
          errorMessage = rule(value, safeData);
        }

        // If validation fails, register error message, mark invalid, and short-circuit field checks
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