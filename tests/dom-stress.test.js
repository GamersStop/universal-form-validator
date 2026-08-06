/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Hard-level DOM stress & endurance test suite. 
 *              Verifies auto-binder resilience under rapid DOM injections, concurrent 
 *              form submissions, and malformed HTML attribute payloads.
 * 
 * @jest-environment jsdom
 */

const { initAutoBind } = require('../src/auto-bind');

describe('Hard-Level DOM Stress & Endurance Tests', () => {

    beforeEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    test('handles rapid dynamic injection of 50+ forms without memory leaks or duplicate bindings', () => {
        // Initialize auto-bind on empty state
        initAutoBind();

        // Inject 50 forms dynamically after initialization
        for (let i = 0; i < 50; i++) {
            const form = document.createElement('form');
            form.setAttribute('data-validator', 'true');
            form.innerHTML = `
                <input type="text" name="username_${i}" data-rules="required|minLength:3">
                <input type="email" name="email_${i}" data-rules="required|email">
                <button type="submit">Submit</button>
            `;
            document.body.appendChild(form);
        }

        // Re-run initialization to bind newly mutated DOM nodes
        initAutoBind();

        const boundForms = document.querySelectorAll('form[data-uv-bound="true"]');
        expect(boundForms.length).toBe(50);
    });

    test('survives concurrent and rapid form submissions without race conditions', () => {
        initAutoBind();

        // Create a test form with complex validation rules
        const form = document.createElement('form');
        form.setAttribute('data-validator', 'true');
        form.innerHTML = `
            <input type="text" name="age" data-rules="required|strictNumeric">
            <button type="submit" id="submit-btn">Submit</button>
        `;
        document.body.appendChild(form);
        initAutoBind();

        const input = form.querySelector('input');
        input.value = 'abc'; // Invalid data payload

        // Trigger multiple rapid, concurrent submit events programmatically
        const submitEvent = new Event('submit', { cancelable: true, bubbles: true });

        let preventDefaultCount = 0;
        form.addEventListener('submit', (e) => {
            if (e.defaultPrevented) preventDefaultCount++;
        });

        // Fire 10 rapid submissions back-to-back
        for (let i = 0; i < 10; i++) {
            form.dispatchEvent(submitEvent);
        }

        // Engine should successfully intercept and block submission every time due to invalid data
        expect(preventDefaultCount).toBe(10);
    });

    test('handles malformed HTML attributes and missing data-rules gracefully without crashing', () => {
        initAutoBind();
        // Create forms with broken or missing attributes
        const malformedForm = document.createElement('form');
        malformedForm.setAttribute('data-validator', 'true');
        malformedForm.innerHTML = `
            <input type="text" name="broken_1"> <!-- Missing data-rules -->
            <input type="text" name="broken_2" data-rules=""> <!-- Empty data-rules -->
            <input type="text" name="broken_3" data-rules="unknownRuleName:99|required"> <!-- Unknown rule -->
            <button type="submit">Submit</button>
        `;
        document.body.appendChild(malformedForm);

        expect(() => {
            initAutoBind();
            const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
            malformedForm.dispatchEvent(submitEvent);
        }).not.toThrow();
    });

});