const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

async function build() {
  console.log('Building universal-form-validator bundles...');

  // 1. ESM Bundle (dist/index.mjs)
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/index.esm.js')],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile: path.join(distDir, 'index.mjs'),
    sourcemap: true,
    target: ['es2020']
  });

  // 2. CommonJS Bundle (dist/index.cjs)
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/index.js')],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    outfile: path.join(distDir, 'index.cjs'),
    sourcemap: true,
    target: ['node16', 'es2020']
  });

  // 3. Browser IIFE Minified Bundle (dist/validator.min.js)
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/index.js')],
    bundle: true,
    format: 'iife',
    globalName: 'UniversalFormValidator',
    platform: 'browser',
    minify: true,
    treeShaking: true,
    legalComments: 'none',
    sourcemap: true,
    outfile: path.join(distDir, 'validator.min.js'),
    target: ['es2020']
  });

  // 3b. Browser Core IIFE Minified Bundle (dist/validator.core.min.js) - ultra-lean < 4KB gzipped
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/index.core.js')],
    bundle: true,
    format: 'iife',
    globalName: 'UniversalFormValidator',
    platform: 'browser',
    minify: true,
    treeShaking: true,
    legalComments: 'none',
    sourcemap: true,
    plugins: [
      {
        name: 'alias-core-i18n',
        setup(b) {
          b.onResolve({ filter: /i18n$/ }, () => ({
            path: path.join(__dirname, 'src/i18n.core.js')
          }));
        }
      }
    ],
    outfile: path.join(distDir, 'validator.core.min.js'),
    target: ['es2020']
  });

  // 3c. Browser Headless Programmatic Engine (dist/validator.engine.min.js) - ultra-lightweight < 4KB
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/index.engine.js')],
    bundle: true,
    format: 'iife',
    globalName: 'UniversalFormValidator',
    platform: 'browser',
    minify: true,
    treeShaking: true,
    legalComments: 'none',
    sourcemap: true,
    plugins: [
      {
        name: 'alias-core-i18n',
        setup(b) {
          b.onResolve({ filter: /i18n$/ }, () => ({
            path: path.join(__dirname, 'src/i18n.core.js')
          }));
        }
      }
    ],
    outfile: path.join(distDir, 'validator.engine.min.js'),
    target: ['es2020']
  });

  // 4. Type Declarations (dist/index.d.ts)
  const dtsSrc = path.join(__dirname, 'src/index.d.ts');
  const dtsDist = path.join(distDir, 'index.d.ts');
  if (fs.existsSync(dtsSrc)) {
    fs.copyFileSync(dtsSrc, dtsDist);
  }

  // 5. Measure and report bundle sizes
  const minFile = path.join(distDir, 'validator.min.js');
  const minContent = fs.readFileSync(minFile);
  const gzipped = zlib.gzipSync(minContent);
  const minSizeKb = (minContent.length / 1024).toFixed(2);
  const gzipSizeKb = (gzipped.length / 1024).toFixed(2);

  const coreFile = path.join(distDir, 'validator.core.min.js');
  const coreContent = fs.readFileSync(coreFile);
  const coreGzipped = zlib.gzipSync(coreContent);
  const coreSizeKb = (coreContent.length / 1024).toFixed(2);
  const coreGzipSizeKb = (coreGzipped.length / 1024).toFixed(2);

  const engineFile = path.join(distDir, 'validator.engine.min.js');
  const engineContent = fs.readFileSync(engineFile);
  const engineGzipped = zlib.gzipSync(engineContent);
  const engineSizeKb = (engineContent.length / 1024).toFixed(2);
  const engineGzipSizeKb = (engineGzipped.length / 1024).toFixed(2);

  console.log('Build completed successfully:');
  console.log(`  - dist/index.mjs`);
  console.log(`  - dist/index.cjs`);
  console.log(`  - dist/validator.min.js (${minSizeKb} KB, gzipped: ${gzipSizeKb} KB) [All 6 locales]`);
  console.log(`  - dist/validator.core.min.js (${coreSizeKb} KB, gzipped: ${coreGzipSizeKb} KB) [DOM + Core i18n]`);
  console.log(`  - dist/validator.engine.min.js (${engineSizeKb} KB, gzipped: ${engineGzipSizeKb} KB) [Headless Engine < 4KB]`);
  console.log(`  - dist/index.d.ts`);
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
