/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Jest unit test suite for client-side auto-binding and DOM event listeners. 
 *              Verifies style injection, error element creation, form prevention, and custom attribute handling.
 * 
 * @jest-environment jsdom
 */

const { initAutoBind } = require('../src/auto-bind');

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

});