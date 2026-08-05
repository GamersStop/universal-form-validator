const { rules } = require('./rules');
const { UniversalValidator } = require('./validator');
const { initAutoBind } = require('./auto-bind');

module.exports = {
  rules,
  UniversalValidator,
  initAutoBind
};