/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Verifies package entry point resolution, dual ESM/CJS exports mapping,
 *              and browser CDN global definitions.
 */

const path = require('path');
const fs = require('fs');

describe('Package Exports & Distribution Integrity', () => {

  const packageJson = require('../package.json');

  beforeAll(() => {
    const distFiles = ['index.cjs', 'index.mjs', 'validator.min.js', 'index.d.ts'];
    const distDir = path.join(__dirname, '..', 'dist');
    const isMissing = distFiles.some(file => !fs.existsSync(path.join(distDir, file)));
    if (isMissing) {
      const { execSync } = require('child_process');
      execSync('node build.js', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
    }
  });

  test('package.json specifies compliant modern exports mapping', () => {
    expect(packageJson.main).toBe('dist/index.cjs');
    expect(packageJson.module).toBe('dist/index.mjs');
    expect(packageJson.types).toBe('dist/index.d.ts');
    expect(packageJson.unpkg).toBe('dist/validator.min.js');
    expect(packageJson.jsdelivr).toBe('dist/validator.min.js');

    expect(packageJson.exports).toBeDefined();
    expect(packageJson.exports['.']).toBeDefined();
    expect(packageJson.exports['.'].import).toBe('./dist/index.mjs');
    expect(packageJson.exports['.'].require).toBe('./dist/index.cjs');
    expect(packageJson.exports['.'].types).toBe('./dist/index.d.ts');
  });

  test('bundled distribution files exist and are populated', () => {
    const distFiles = ['index.cjs', 'index.mjs', 'validator.min.js', 'index.d.ts'];
    distFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', 'dist', file);
      expect(fs.existsSync(filePath)).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(0);
    });
  });

  test('CJS bundle exports UniversalValidator, initAutoBind, resetFormState, and rules', () => {
    const cjsBundle = require('../dist/index.cjs');
    expect(typeof cjsBundle.UniversalValidator).toBe('function');
    expect(typeof cjsBundle.UniversalValidator.setLocale).toBe('function');
    expect(typeof cjsBundle.UniversalValidator.getLocale).toBe('function');
    expect(typeof cjsBundle.UniversalValidator.registerLocale).toBe('function');
    expect(typeof cjsBundle.initAutoBind).toBe('function');
    expect(typeof cjsBundle.resetFormState).toBe('function');
    expect(typeof cjsBundle.rules).toBe('object');
    expect(typeof cjsBundle.rules.required).toBe('function');
  });

});
