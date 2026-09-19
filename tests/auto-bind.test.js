/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Jest unit test suite for client-side auto-binding and DOM event listeners. 
 *              Verifies style injection, error element creation, form prevention, and custom attribute handling.
 * 
 * @jest-environment jsdom
 */

const { initAutoBind, resetFormState } = require('../src/auto-bind');

describe('Zero-JS Auto-Binder', () => {

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = `
      <form data-validator id="test-form">
        <input type="email" name="user_email" data-rules="required|email" data-msg-required="We need this!">
        <button type="submit">Submit</button>
      </form>
    `;
  });

  /**
   * Verifies that the auto-binder dynamically injects required validation styling 
   * into the document head on initialization.
   */
  test('injects CSS styles into the document head', () => {
    initAutoBind();
    const styleTag = document.getElementById('uv-styles');
    expect(styleTag).not.toBeNull();
    expect(styleTag.textContent).toContain('.uv-input-error');
  });

  /**
   * Verifies that form submission is prevented, error classes/attributes are applied, 
   * and custom error messages are safely rendered when invalid data is submitted.
   */
  test('prevents submission and injects error UI on invalid data', () => {
    initAutoBind();

    const form = document.getElementById('test-form');
    const input = form.elements['user_email'];

    const submitEvent = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent);

    expect(submitEvent.defaultPrevented).toBe(true);

    expect(input.classList.contains('uv-input-error')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');

    const errorText = document.querySelector('.uv-error-text');
    expect(errorText).not.toBeNull();
    // Verify using textContent or matching value rendered safely via textContent
    expect(errorText.textContent).toBe('We need this!');
  });

  /**
   * Verifies that declarative data-rules attributes preserve arguments containing colons (e.g. pattern regex).
   */
  test('safely parses declarative rules with colons in rule arguments', () => {
    document.body.innerHTML = `
      <form data-validator id="regex-form">
        <input type="text" name="endpoint" data-rules="required|pattern:^https://api\\.example\\.com/v1">
        <button type="submit">Submit</button>
      </form>
    `;

    initAutoBind();

    const form = document.getElementById('regex-form');
    const input = form.elements['endpoint'];

    // Test invalid value
    input.value = 'http://insecure.com';
    let submitEvent = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent);
    expect(submitEvent.defaultPrevented).toBe(true);
    expect(input.classList.contains('uv-input-error')).toBe(true);

    // Test valid value matching regex with https://
    form.submit = jest.fn();
    input.value = 'https://api.example.com/v1/users';
    submitEvent = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent);
    expect(form.submit).toHaveBeenCalled();
    expect(input.classList.contains('uv-input-error')).toBe(false);
  });

  /**
   * Verifies that triggering a form reset event tears down all validation UI artifacts:
   * .uv-input-error, .uv-input-success, .uv-error-text, aria-invalid, and aria-describedby.
   */
  test('cleans up error classes, text spans, and ARIA attributes on form reset', () => {
    initAutoBind();

    const form = document.getElementById('test-form');
    const input = form.elements['user_email'];

    // Trigger invalid submission to populate error artifacts
    const submitEvent = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent);

    expect(input.classList.contains('uv-input-error')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(document.querySelector('.uv-error-text')).not.toBeNull();

    // Trigger native form reset event
    form.dispatchEvent(new Event('reset'));

    // Assert that pristine state is fully restored
    expect(input.classList.contains('uv-input-error')).toBe(false);
    expect(input.classList.contains('uv-input-success')).toBe(false);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect(document.querySelector('.uv-error-text')).toBeNull();
  });

  /**
   * Verifies that resetFormState utility function can be invoked programmatically.
   */
  test('resetFormState programmatically purges error artifacts across all form inputs', () => {
    document.body.innerHTML = `
      <form data-validator id="multi-input-form">
        <div>
          <input type="text" name="name" class="uv-input-error" aria-invalid="true" aria-describedby="uv-error-name">
          <span class="uv-error-text" data-for="name">Name error</span>
        </div>
        <div>
          <input type="email" name="email" class="uv-input-success">
        </div>
      </form>
    `;

    const form = document.getElementById('multi-input-form');
    resetFormState(form);

    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');

    expect(nameInput.classList.contains('uv-input-error')).toBe(false);
    expect(nameInput.hasAttribute('aria-invalid')).toBe(false);
    expect(nameInput.hasAttribute('aria-describedby')).toBe(false);
    expect(emailInput.classList.contains('uv-input-success')).toBe(false);
    expect(form.querySelectorAll('.uv-error-text').length).toBe(0);
  });

  /**
   * Verifies radio group validation and error placement relative to fieldset.
   */
  test('validates radio group, normalizes errors, and positions error after fieldset', () => {
    document.body.innerHTML = `
      <form data-validator id="radio-form">
        <fieldset id="plan-fieldset">
          <legend>Subscription Plan</legend>
          <input type="radio" id="plan-free" name="plan" value="free" data-rules="required" data-msg-required="Please choose a plan.">
          <label for="plan-free">Free</label>
          <input type="radio" id="plan-pro" name="plan" value="pro">
          <label for="plan-pro">Pro</label>
        </fieldset>
        <button type="submit">Submit</button>
      </form>
    `;

    initAutoBind();

    const form = document.getElementById('radio-form');
    const fieldset = document.getElementById('plan-fieldset');
    const radioFree = document.getElementById('plan-free');
    const radioPro = document.getElementById('plan-pro');

    // 1. Submit with no radio selected -> Should fail with single error positioned after fieldset
    const submitEvent1 = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent1);

    expect(submitEvent1.defaultPrevented).toBe(true);
    expect(radioFree.classList.contains('uv-input-error')).toBe(true);
    expect(radioPro.classList.contains('uv-input-error')).toBe(true);

    const errorElements = form.querySelectorAll('.uv-error-text');
    expect(errorElements.length).toBe(1);
    expect(errorElements[0].textContent).toBe('Please choose a plan.');
    expect(fieldset.nextElementSibling).toBe(errorElements[0]);

    // 2. Select the second radio (plan-pro) -> Should trigger change, clear errors, and pass
    form.submit = jest.fn();
    radioPro.checked = true;
    radioPro.dispatchEvent(new Event('change'));

    expect(radioFree.classList.contains('uv-input-error')).toBe(false);
    expect(radioPro.classList.contains('uv-input-error')).toBe(false);
    expect(form.querySelectorAll('.uv-error-text').length).toBe(0);

    // 3. Submit again -> Should succeed
    const submitEvent2 = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent2);
    expect(form.submit).toHaveBeenCalled();
  });

  /**
   * Verifies multi-checkbox group validation where multiple checkboxes share the same name.
   */
  test('validates multi-checkbox group sharing the same name', () => {
    document.body.innerHTML = `
      <form data-validator id="checkbox-group-form">
        <div id="interests-container">
          <input type="checkbox" id="chk-coding" name="interests" value="coding" data-rules="required">
          <input type="checkbox" id="chk-design" name="interests" value="design">
        </div>
        <button type="submit">Submit</button>
      </form>
    `;

    initAutoBind();

    const form = document.getElementById('checkbox-group-form');
    const chkCoding = document.getElementById('chk-coding');
    const chkDesign = document.getElementById('chk-design');

    // 1. Submit with no checkboxes checked
    const submitEvent1 = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent1);

    expect(submitEvent1.defaultPrevented).toBe(true);
    expect(chkCoding.classList.contains('uv-input-error')).toBe(true);
    expect(chkDesign.classList.contains('uv-input-error')).toBe(true);

    const errors = form.querySelectorAll('.uv-error-text');
    expect(errors.length).toBe(1);
    expect(errors[0].textContent).toBe('This field is required.');

    // 2. Check one checkbox -> triggers change event and clears error
    form.submit = jest.fn();
    chkDesign.checked = true;
    chkDesign.dispatchEvent(new Event('change'));

    expect(chkCoding.classList.contains('uv-input-error')).toBe(false);
    expect(chkDesign.classList.contains('uv-input-error')).toBe(false);
    expect(form.querySelectorAll('.uv-error-text').length).toBe(0);

    // 3. Submit -> succeeds
    const submitEvent2 = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent2);
    expect(form.submit).toHaveBeenCalled();
  });

  /**
   * Phase 2: dependsOn dynamic re-evaluation trigger
   */
  test('dependsOn re-evaluates dependent field when target field changes', () => {
    document.body.innerHTML = `
      <form data-validator id="depends-form" data-trigger="change">
        <input type="password" id="pwd" name="password">
        <input type="password" id="confirm_pwd" name="confirm_password" data-rules="required|sameAs:password|dependsOn:password">
        <button type="submit">Submit</button>
      </form>
    `;

    initAutoBind();

    const form = document.getElementById('depends-form');
    const pwd = document.getElementById('pwd');
    const confirmPwd = document.getElementById('confirm_pwd');

    // Both match initially
    pwd.value = 'secret123';
    confirmPwd.value = 'secret123';

    // Submit passes
    form.submit = jest.fn();
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(confirmPwd.classList.contains('uv-input-error')).toBe(false);

    // Change original password -> triggers change on pwd which re-validates confirm_pwd
    pwd.value = 'new_secret_456';
    pwd.dispatchEvent(new Event('change'));

    // confirm_pwd should now have an error because it no longer matches password
    expect(confirmPwd.classList.contains('uv-input-error')).toBe(true);
    const errorText = form.querySelector('.uv-error-text[data-for="confirm_password"]');
    expect(errorText).not.toBeNull();
    expect(errorText.textContent).toBe('Fields do not match.');

    // Now update confirm_pwd to match
    confirmPwd.value = 'new_secret_456';
    confirmPwd.dispatchEvent(new Event('change'));
    expect(confirmPwd.classList.contains('uv-input-error')).toBe(false);
  });

  /**
   * Phase 2: Remote async debounce and .uv-validating indicator
   */
  test('remote async input manages debounce and uv-validating class', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ valid: true })
    });

    try {
      document.body.innerHTML = `
        <form data-validator id="async-form">
          <input type="text" id="username" name="username" data-rules="required|remote:https://api.example.com/check" data-debounce="50">
          <button type="submit">Submit</button>
        </form>
      `;

      initAutoBind();

      const usernameInput = document.getElementById('username');
      usernameInput.value = 'johnny';

      // Dispatch typing input event
      usernameInput.dispatchEvent(new Event('input'));

      // While debounce is active, uv-validating class is present
      expect(usernameInput.classList.contains('uv-validating')).toBe(true);

      // Wait for debounce and remote fetch to resolve
      await new Promise(resolve => setTimeout(resolve, 80));

      // Once resolved, uv-validating is removed
      expect(usernameInput.classList.contains('uv-validating')).toBe(false);
      expect(global.fetch).toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
    }
  });

  /**
   * Phase 3: Custom Error Placement (data-error-target)
   */
  test('renders error element inside custom container specified by data-error-target', () => {
    document.body.innerHTML = `
      <form data-validator id="custom-target-form">
        <div class="input-group">
          <input type="text" id="target-email" name="target_email" data-rules="required|email" data-error-target="#email-error-slot">
        </div>
        <div id="email-error-slot" class="custom-slot"></div>
        <button type="submit">Submit</button>
      </form>
    `;

    initAutoBind();

    const form = document.getElementById('custom-target-form');
    const input = document.getElementById('target-email');
    const slot = document.getElementById('email-error-slot');

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(input.classList.contains('uv-input-error')).toBe(true);
    const errorInSlot = slot.querySelector('.uv-error-text');
    expect(errorInSlot).not.toBeNull();
    expect(errorInSlot.getAttribute('data-for')).toBe('target_email');
    // Ensure error is not directly attached as adjacent sibling to input
    expect(input.nextElementSibling).toBeNull();
  });

  /**
   * Phase 3: Modern WCAG 2.1 AA Accessibility Compliance
   */
  test('ensures WCAG 2.1 AA attributes: id, role="alert", aria-live="polite", and aria-describedby', () => {
    document.body.innerHTML = `
      <form data-validator id="a11y-form">
        <input type="text" id="a11y-user" name="username" data-rules="required" data-trigger="change">
        <button type="submit">Submit</button>
      </form>
    `;

    initAutoBind();

    const form = document.getElementById('a11y-form');
    const input = document.getElementById('a11y-user');

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('uv-error-username');

    const errorEl = document.getElementById('uv-error-username');
    expect(errorEl).not.toBeNull();
    expect(errorEl.getAttribute('role')).toBe('alert');
    expect(errorEl.getAttribute('aria-live')).toBe('polite');

    // Make input valid and trigger change -> ARIA attributes must be cleared
    input.value = 'validUser';
    input.dispatchEvent(new Event('change'));

    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect(document.getElementById('uv-error-username')).toBeNull();
  });

  /**
   * Phase 3: Custom Lifecycle Events (uv:validate, uv:field:validated, uv:success, uv:fail)
   */
  test('dispatches bubbling custom lifecycle events in correct sequence', () => {
    document.body.innerHTML = `
      <form data-validator id="lifecycle-form">
        <input type="text" id="first-name" name="first_name" data-rules="required">
        <input type="text" id="last-name" name="last_name" data-rules="required">
        <button type="submit">Submit</button>
      </form>
    `;

    initAutoBind();

    const form = document.getElementById('lifecycle-form');
    const fnInput = document.getElementById('first-name');
    const lnInput = document.getElementById('last-name');

    const eventsLog = [];
    const fieldsValidated = [];

    form.addEventListener('uv:validate', (e) => {
      eventsLog.push('uv:validate');
    });

    form.addEventListener('uv:field:validated', (e) => {
      eventsLog.push(`uv:field:validated:${e.detail.field}:${e.detail.isValid}`);
      fieldsValidated.push(e.detail);
    });

    let failDetail = null;
    form.addEventListener('uv:fail', (e) => {
      eventsLog.push('uv:fail');
      failDetail = e.detail;
    });

    let successFired = false;
    form.addEventListener('uv:success', (e) => {
      eventsLog.push('uv:success');
      successFired = true;
    });

    // 1. Submit invalid form
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(eventsLog).toContain('uv:validate');
    expect(eventsLog).toContain('uv:fail');
    expect(successFired).toBe(false);
    expect(failDetail).not.toBeNull();
    expect(failDetail.errors['first_name']).toBe('This field is required.');
    expect(failDetail.firstInvalidInput).toBe(fnInput);

    // 2. Clear and fill valid values
    eventsLog.length = 0;
    fnInput.value = 'John';
    lnInput.value = 'Doe';
    form.submit = jest.fn();

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(eventsLog[0]).toBe('uv:validate');
    expect(eventsLog).toContain('uv:field:validated:first_name:true');
    expect(eventsLog).toContain('uv:field:validated:last_name:true');
    expect(eventsLog).toContain('uv:success');
    expect(form.submit).toHaveBeenCalled();
  });

  /**
   * Phase 3: Decouple Native Submit (data-ajax="true" and uv:success preventDefault)
   */
  test('halts native form submission when data-ajax="true" or when e.preventDefault() is called on uv:success', () => {
    // 1. data-ajax="true" form
    document.body.innerHTML = `
      <form data-validator data-ajax="true" id="ajax-form">
        <input type="text" name="query" value="validQuery" data-rules="required">
        <button type="submit">Search</button>
      </form>
    `;

    initAutoBind();

    const ajaxForm = document.getElementById('ajax-form');
    ajaxForm.submit = jest.fn();
    let ajaxSuccessFired = false;
    ajaxForm.addEventListener('uv:success', () => {
      ajaxSuccessFired = true;
    });

    ajaxForm.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(ajaxSuccessFired).toBe(true);
    // Even though valid, form.submit() must NOT be called because data-ajax="true"
    expect(ajaxForm.submit).not.toHaveBeenCalled();

    // 2. Normal form prevented in uv:success listener
    document.body.innerHTML = `
      <form data-validator id="intercept-form">
        <input type="text" name="token" value="secret" data-rules="required">
        <button type="submit">Submit</button>
      </form>
    `;

    initAutoBind();

    const interceptForm = document.getElementById('intercept-form');
    interceptForm.submit = jest.fn();
    interceptForm.addEventListener('uv:success', (e) => {
      e.preventDefault(); // Halt native submit programmatically
    });

    interceptForm.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(interceptForm.submit).not.toHaveBeenCalled();
  });

  /**
   * Phase 3: Reactive Dynamic DOM (MutationObserver)
   */
  test('automatically binds dynamically injected forms and inputs when observe is true', async () => {
    document.body.innerHTML = '<div id="container"></div>';

    const observer = initAutoBind({ observe: true });

    try {
      const container = document.getElementById('container');

      // Dynamically inject a new form into the DOM
      const dynamicForm = document.createElement('form');
      dynamicForm.setAttribute('data-validator', 'true');
      dynamicForm.id = 'dynamic-form';
      dynamicForm.innerHTML = `
        <input type="text" name="dyn_field" data-rules="required">
        <button type="submit">Submit</button>
      `;
      container.appendChild(dynamicForm);

      // Wait a tick for MutationObserver callback
      await new Promise(resolve => setTimeout(resolve, 30));

      expect(dynamicForm.getAttribute('data-uv-bound')).toBe('true');

      // Submitting the dynamically added form validates properly
      dynamicForm.dispatchEvent(new Event('submit', { cancelable: true }));
      const dynInput = dynamicForm.elements['dyn_field'];
      expect(dynInput.classList.contains('uv-input-error')).toBe(true);
      expect(dynamicForm.querySelector('.uv-error-text')).not.toBeNull();
    } finally {
      if (observer) observer.disconnect();
    }
  });

});