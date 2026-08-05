const { UniversalValidator } = require('./validator');
const { rules: builtInRules } = require('./rules');

const injectStyles = () => {
  if (document.getElementById('uv-styles')) return; 
  
  const style = document.createElement('style');
  style.id = 'uv-styles';
  style.textContent = `
    .uv-input-error {
      border: 2px solid #dc3545 !important;
      animation: uv-shake 0.3s ease-in-out;
    }
    .uv-error-text {
      color: #dc3545;
      font-size: 0.875em;
      display: block;
      margin-top: 4px;
      font-family: inherit;
    }
    @keyframes uv-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
};


const initAutoBind = () => {
  const forms = document.querySelectorAll('form[data-validator]');
  if (forms.length === 0) return; 

  injectStyles();

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); 

      form.querySelectorAll('.uv-error-text').forEach(el => el.remove());
      form.querySelectorAll('.uv-input-error').forEach(el => {
        el.classList.remove('uv-input-error');
        el.removeAttribute('aria-invalid');
      });

      const schema = {};
      const inputs = form.querySelectorAll('[data-rules]');

      inputs.forEach(input => {
        const fieldName = input.name;
        if (!fieldName) {
          console.warn('Universal Validator: Input is missing a "name" attribute.', input);
          return;
        }

        const rulesString = input.getAttribute('data-rules');
      
        const rulesArray = rulesString.split('|').map(ruleName => {
          
          const customMsg = input.getAttribute(`data-msg-${ruleName.toLowerCase()}`);
          
          if (customMsg && builtInRules[ruleName]) {
            return (val) => (builtInRules[ruleName](val) ? customMsg : null);
          }
          
          return ruleName;
        });

        schema[fieldName] = rulesArray;
      });

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const validator = new UniversalValidator(schema);
      const result = validator.validate(data);

      if (!result.isValid) {
        for (const [field, errorMsg] of Object.entries(result.errors)) {
          const input = form.elements[field];
          if (input) {
            input.classList.add('uv-input-error');
            input.setAttribute('aria-invalid', 'true');
            
            const span = document.createElement('span');
            span.className = 'uv-error-text';
            span.textContent = errorMsg;
            input.parentNode.insertBefore(span, input.nextSibling);
          }
        }
      } else {
        form.submit();
      }
    });
  });
};

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initAutoBind);
}

module.exports = { initAutoBind };