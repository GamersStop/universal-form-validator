const rules = {
  required: (val) => (val && val.trim() !== '' ? null : 'This field is required.'),
  email: (val) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : 'Please enter a valid email address.'),
  strictNumeric: (val) => (/^\d+$/.test(val) ? null : 'Must be a whole number.')
};

module.exports = { rules };