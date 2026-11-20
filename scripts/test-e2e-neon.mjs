import { spawn } from 'node:child_process';
import http from 'node:http';

console.log('====================================================');
console.log('STARTING END-TO-END NEON POSTGRESQL VERIFICATION');
console.log('====================================================\n');

// Set port and environment
process.env.HOST = '127.0.0.1';
process.env.PORT = '4321';
process.env.ASTRO_TELEMETRY_DISABLED = '1';

const server = spawn('node', ['dist/server/entry.mjs'], {
  env: { ...process.env },
  stdio: ['ignore', 'pipe', 'pipe'],
});

server.stdout.on('data', (d) => process.stdout.write(`[Server] ${d}`));
server.stderr.on('data', (d) => process.stderr.write(`[Server Error] ${d}`));

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

try {
  // Wait 3 seconds for server to boot
  console.log('Waiting for production server to initialize...');
  await wait(3000);

  // Test 1: Public Homepage
  console.log('\n--- 1. Testing Public Homepage (GET /) ---');
  const homeRes = await fetchUrl('http://127.0.0.1:4321/');
  console.log(`Status: ${homeRes.status}`);
  if (homeRes.status === 200 && homeRes.data.includes('Mrinmoy Borah')) {
    console.log('[PASS] Homepage loaded successfully with live content from Neon PostgreSQL');
  } else {
    console.error('[FAIL] Homepage did not return expected content. Status:', homeRes.status);
    process.exit(1);
  }

  // Test 2: Hero API Route
  console.log('\n--- 2. Testing Hero CMS API (GET /api/cms/hero) ---');
  const heroRes = await fetchUrl('http://127.0.0.1:4321/api/cms/hero');
  console.log(`Status: ${heroRes.status}`);
  const heroJson = JSON.parse(heroRes.data);
  console.log(`Hero Name: "${heroJson.name}", Role: "${heroJson.role_badge}"`);
  if (heroJson.name === 'Mrinmoy Borah') {
    console.log('[PASS] Hero API successfully returned live Neon database record');
  } else {
    console.error('[FAIL] Hero API unexpected response:', heroJson);
    process.exit(1);
  }

  // Test 3: Projects API Route
  console.log('\n--- 3. Testing Projects CMS API (GET /api/cms/projects) ---');
  const projRes = await fetchUrl('http://127.0.0.1:4321/api/cms/projects');
  console.log(`Status: ${projRes.status}`);
  const projJson = JSON.parse(projRes.data);
  console.log(`Retrieved ${projJson.length} projects from Neon PostgreSQL`);
  if (projJson.length >= 6) {
    console.log(`[PASS] All ${projJson.length} projects loaded intact from Neon`);
    console.log('Sample project:', { id: projJson[0].id, title: projJson[0].title, slug: projJson[0].slug });
  } else {
    console.error('[FAIL] Projects count lower than expected:', projJson.length);
    process.exit(1);
  }

  // Test 4: Admin Gating on /admin/setup
  console.log('\n--- 4. Testing Admin Setup Lock (GET /admin/setup) ---');
  const setupRes = await fetchUrl('http://127.0.0.1:4321/admin/setup', { method: 'GET' });
  console.log(`Status: ${setupRes.status}, Redirect Location: ${setupRes.headers.location}`);
  if (setupRes.status === 302 && setupRes.headers.location === '/admin/login') {
    console.log('[PASS] Setup is locked against unauthorized access (Admin user exists in Neon)');
  } else {
    console.error('[FAIL] Setup was not redirected as expected. Status:', setupRes.status);
    process.exit(1);
  }

  // Test 5: Admin Login Page
  console.log('\n--- 5. Testing Admin Login Page (GET /admin/login) ---');
  const loginRes = await fetchUrl('http://127.0.0.1:4321/admin/login');
  console.log(`Status: ${loginRes.status}`);
  if (loginRes.status === 200 && loginRes.data.includes('Sign In')) {
    console.log('[PASS] Admin Login UI rendered successfully');
  } else {
    console.error('[FAIL] Admin login page failed. Status:', loginRes.status);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('ALL END-TO-END NEON SERVICES VERIFIED FUNCTIONAL');
  console.log('====================================================\n');
} finally {
  server.kill('SIGTERM');
  console.log('Production test server stopped.');
}
