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
      const value = data[field] || '';

      for (const rule of fieldRules) {
        let errorMessage = null;

        if (typeof rule === 'string' && builtInRules[rule]) {
          errorMessage = builtInRules[rule](value);
        } 

        else if (typeof rule === 'function') {
          errorMessage = rule(value);
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