/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: ESM entry point module exporting named and default exports.
 */

const { UniversalValidator } = require('./validator');
const { initAutoBind, resetFormState } = require('./auto-bind');
const { rules } = require('./rules');

const {
  getGlobalLocale,
  setGlobalLocale,
  registerLocale,
  getMessage,
  interpolate,
  deriveFieldLabel
} = require('./i18n');

if (typeof window !== 'undefined') {
  window.UniversalValidator = UniversalValidator;
  window.UniversalValidatorRules = rules;
  window.initAutoBind = initAutoBind;
  window.resetFormState = resetFormState;
  window.setLocale = setGlobalLocale;
  window.getLocale = getGlobalLocale;
  window.registerLocale = registerLocale;
  window.getMessage = getMessage;
  window.interpolate = interpolate;
  window.deriveFieldLabel = deriveFieldLabel;
}

const setLocale = setGlobalLocale;
const getLocale = getGlobalLocale;

export {
  UniversalValidator,
  initAutoBind,
  resetFormState,
  rules,
  setLocale,
  getLocale,
  registerLocale,
  getMessage,
  interpolate,
  deriveFieldLabel
};
export default UniversalValidator;
