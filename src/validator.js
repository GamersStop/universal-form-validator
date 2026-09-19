/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Core programmatic validator engine class. Responsible for evaluating 
 *              schema definitions against input data payloads with prototype-safe 
 *              rule lookups and dependency injection support.
 */

const { rules: builtInRules, getRuleDefinition } = require('./rules');
const { getGlobalLocale, setGlobalLocale, registerLocale } = require('./i18n');

const resolveValidatorFn = (rule) => {
  if (typeof rule === 'function') return rule;
  if (typeof rule === 'string') {
    let ruleName = rule;
    let ruleArg = null;
    const colonIdx = rule.indexOf(':');
    if (colonIdx !== -1) {
      ruleName = rule.slice(0, colonIdx);
      ruleArg = rule.slice(colonIdx + 1);
    }
    const ruleDefinition = getRuleDefinition(builtInRules, ruleName);
    if (ruleDefinition) {
      return (typeof ruleDefinition === 'function' && ruleArg !== null)
        ? ruleDefinition(ruleArg)
        : ruleDefinition;
    }
  }
  return null;
};

class UniversalValidator {
  /**
   * Sets the global default locale across all validator instances.
   * @param {string} localeCode - E.g. 'en', 'es', 'fr', 'de', 'hi', 'zh'.
   */
  static setLocale(localeCode) {
    setGlobalLocale(localeCode);
  }

  /**
   * Gets the active global default locale.
   * @returns {string}
   */
  static getLocale() {
    return getGlobalLocale();
  }

  /**
   * Registers a custom dictionary or extends an existing locale.
   * @param {string} localeCode - Target locale code.
   * @param {Object} messages - Dictionary of rule error messages.
   */
  static registerLocale(localeCode, messages) {
    registerLocale(localeCode, messages);
  }

  /**
   * Initializes the validator instance with a validation schema and optional configuration.
   * @param {Object} schema - Dictionary mapping field names to arrays of rules.
   * @param {Object} [options={}] - Instance configuration options.
   * @param {Object} [options={}] - Instance configuration options.
   * @param {string} [options.locale] - Specific locale override for this instance.
   * @param {Object} [options.labels] - Map of field names to human-readable friendly labels.
   */
  constructor(schema, options = {}) {
    this.schema = schema || {};
    this.locale = (options && typeof options.locale === 'string') ? options.locale : null;
    this.labels = (options && options.labels && typeof options.labels === 'object') ? { ...options.labels } : {};
  }

  /**
   * Sets the instance-specific locale override.
   * @param {string} localeCode - Target locale code.
   * @returns {this}
   */
  setLocale(localeCode) {
    this.locale = localeCode;
    return this;
  }

  /**
   * Gets the active locale for this validator instance (falls back to global).
   * @returns {string}
   */
  getLocale() {
    return this.locale || getGlobalLocale();
  }

  /**
   * Sets a friendly label for a specific field.
   * @param {string} field - The field key name.
   * @param {string} label - Human-friendly label (e.g. 'Email Address').
   * @returns {this}
   */
  setLabel(field, label) {
    if (typeof field === 'string' && typeof label === 'string') {
      this.labels[field] = label;
    }
    return this;
  }

  /**
   * Sets multiple friendly field labels at once.
   * @param {Record<string, string>} labels - Key-value pair collection of field labels.
   * @returns {this}
   */
  setLabels(labels) {
    if (labels && typeof labels === 'object') {
      Object.assign(this.labels, labels);
    }
    return this;
  }

  /**
   * Gets the friendly label for a field, falling back to the field key itself.
   * @param {string} field - The field key name.
   * @returns {string}
   */
  getLabel(field) {
    return (this.labels && this.labels[field]) || field;
  }

  /**
   * Validates a complete data object payload against the defined schema rules.
   * @param {Object} data - Key-value pair collection of user input fields.
   * @returns {Object} Result object containing `isValid` boolean and `errors` collection.
   */
  validate(data) {
    let isValid = true;
    const errors = {};
    const safeData = (data && typeof data === 'object') ? data : {};
    const locale = this.getLocale();

    for (const field in this.schema) {
      const fieldRules = this.schema[field];
      const value = safeData[field] !== undefined && safeData[field] !== null ? safeData[field] : '';
      if (!Array.isArray(fieldRules)) continue;

      const context = {
        locale,
        field,
        label: this.getLabel(field)
      };

      for (const rule of fieldRules) {
        const validatorFn = resolveValidatorFn(rule);
        if (typeof validatorFn !== 'function') continue;

        const errorMessage = validatorFn(value, safeData, null, context);
        if (errorMessage && typeof errorMessage === 'string') {
          errors[field] = errorMessage;
          isValid = false;
          break;
        }
      }
    }

    return { isValid, errors };
  }

  /**
   * Asynchronously validates a complete data object payload against the defined schema rules,
   * awaiting any asynchronous rule functions or remote network validations sequentially per field.
   * @param {Object} data - Key-value pair collection of user input fields.
   * @returns {Promise<{isValid: boolean, errors: Record<string, string>}>}
   */
  async validateAsync(data) {
    let isValid = true;
    const errors = {};
    const safeData = (data && typeof data === 'object') ? data : {};
    const locale = this.getLocale();

    for (const field in this.schema) {
      const fieldRules = this.schema[field];
      const value = safeData[field] !== undefined && safeData[field] !== null ? safeData[field] : '';
      if (!Array.isArray(fieldRules)) continue;

      const context = {
        locale,
        field,
        label: this.getLabel(field)
      };

      for (const rule of fieldRules) {
        const validatorFn = resolveValidatorFn(rule);
        if (typeof validatorFn !== 'function') continue;

        const res = validatorFn(value, safeData, null, context);
        const errorMessage = (res && typeof res.then === 'function') ? await res : res;
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