/**
 * Project Name: Universal Form Builder (Validator Engine)
 * Author: Mayuresh Pandit
 * Description: Zero-dependency lightweight HTTP server for testing real network 
 *              validation requests in browser DevTools Network tab.
 *
 * Run with:
 *   npm run example:serve
 *   (or node examples/server.js)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Real HTTP API Endpoint for Remote Username Validation
  if (pathname === '/api/check-username') {
    let username = '';

    if (req.method === 'GET') {
      username = (parsedUrl.query.value || parsedUrl.query.username || '').toString();
      handleUsernameCheck(username, parsedUrl.query.locale || 'en', res);
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          username = parsed.value || parsed.username || '';
          handleUsernameCheck(username, parsed.locale || 'en', res);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ valid: false, message: 'Invalid JSON request payload.' }));
        }
      });
    }
    return;
  }

  // 2. Static File Serving
  let relativePath = pathname === '/' ? '/examples/index.html' : pathname;
  // If navigating directly to /examples or /
  if (relativePath === '/examples' || relativePath === '/examples/') {
    relativePath = '/examples/index.html';
  }

  const safePath = path.normalize(path.join(ROOT_DIR, relativePath));

  // Prevent directory traversal
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(safePath).pipe(res);
  });
});

/**
 * Validates username and returns real HTTP 200 (available) or HTTP 400 (taken).
 * Adds a 200ms latency to simulate real network delay for debouncing observation.
 */
function handleUsernameCheck(username, locale, res) {
  setTimeout(() => {
    const trimmed = (username || '').toLowerCase().trim();
    const reserved = ['admin', 'root', 'superuser', 'moderator', 'test'];

    const takenMessages = {
      en: 'This username is already taken.',
      es: 'Este nombre de usuario ya está en uso.',
      fr: "Ce nom d'utilisateur est déjà pris.",
      de: 'Dieser Benutzername ist bereits vergeben.',
      hi: 'यह उपयोगकर्ता नाम पहले से लिया गया है।',
      zh: '该用户名已被占用。'
    };

    if (reserved.includes(trimmed)) {
      const msg = takenMessages[locale] || takenMessages.en;
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: false, message: msg }));
      console.log(`[HTTP 400] /api/check-username -> "${username}" (TAKEN)`);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: true }));
      console.log(`[HTTP 200] /api/check-username -> "${username}" (AVAILABLE)`);
    }
  }, 200);
}

server.listen(PORT, () => {
  console.log(`\n🚀 Universal Form Validator Test Server running at:`);
  console.log(`   ➜ Local:   http://localhost:${PORT}/examples/index.html`);
  console.log(`   ➜ API:     http://localhost:${PORT}/api/check-username`);
  console.log(`\nOpen the page in your browser and check the DevTools Network tab to see real HTTP requests!\n`);
});
