import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n===============================================================');
console.log('🪷 AAROH MARKETPLACE — UNIFIED FULL-STACK RUNNER');
console.log('Combining Backend API, SQLite Database, Vite Frontend & Multi-Port Access');
console.log('===============================================================\n');

let backendProc = null;
let frontendProc = null;
let proxyServer = null;

// Clean shutdown handler
function shutdown() {
  console.log('\n[Aaroh Runner] Shutting down combined services...');
  if (proxyServer) {
    try { proxyServer.close(); } catch {}
  }
  if (backendProc) {
    try { backendProc.kill('SIGTERM'); } catch {}
  }
  if (frontendProc) {
    try { frontendProc.kill('SIGTERM'); } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

// 1. Start Express Backend (:5000)
console.log('[Runner] Starting Backend Server on port 5000...');
backendProc = spawn(process.execPath, [path.join(rootDir, 'server', 'server.js')], {
  cwd: path.join(rootDir, 'server'),
  env: { ...process.env, PORT: '5000' },
  stdio: ['inherit', 'pipe', 'pipe']
});

backendProc.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.log(`\x1b[36m[Backend :5000]\x1b[0m ${line}`);
  });
});

backendProc.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.error(`\x1b[31m[Backend Error]\x1b[0m ${line}`);
  });
});

backendProc.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.error(`[Backend] Process exited with code ${code}`);
  }
});

// 2. Start Vite Frontend (:5173)
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
console.log('[Runner] Starting Vite Frontend on port 5173...');

frontendProc = spawn(process.execPath, [viteBin, '--port', '5173', '--host', '0.0.0.0'], {
  cwd: rootDir,
  env: { ...process.env },
  stdio: ['inherit', 'pipe', 'pipe']
});

frontendProc.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.log(`\x1b[32m[Frontend :5173]\x1b[0m ${line}`);
  });
});

frontendProc.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) console.error(`\x1b[33m[Frontend Warn]\x1b[0m ${line}`);
  });
});

frontendProc.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.error(`[Frontend] Process exited with code ${code}`);
  }
});

// 3. Start Port 3000 Proxy Forwarder (so both :3000 and :5173 work seamlessly)
proxyServer = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:5173'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end('<html><head><meta http-equiv="refresh" content="2"></head><body style="font-family: sans-serif; text-align: center; padding: 40px; background: #FAF6EE; color: #1E3524;"><h3>Aaroh combined runner initializing...</h3><p>Reloading automatically in 2 seconds.</p></body></html>');
  });

  req.pipe(proxyReq, { end: true });
});

proxyServer.listen(3000, '0.0.0.0', () => {
  console.log('\x1b[35m[Access Gateway]\x1b[0m Port 3000 active (forwarding to 5173)\n');
  console.log('---------------------------------------------------------------');
  console.log('🌐 Frontend:   http://localhost:5173/  or  http://localhost:3000/');
  console.log('⚡ Backend:    http://localhost:5000/api/health');
  console.log('🪷 Database:   SQLite WAL persistent mode enabled');
  console.log('---------------------------------------------------------------\n');
});
