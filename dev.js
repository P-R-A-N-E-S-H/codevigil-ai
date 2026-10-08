import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\x1b[36m%s\x1b[0m', '====================================================');
console.log('\x1b[36m%s\x1b[0m', '🚀  Starting CodeVigil AI (Server + Client)...');
console.log('\x1b[36m%s\x1b[0m', '====================================================\n');

// 1. Spawn Backend Server
const serverScript = path.join(__dirname, 'server', 'src', 'server.js');
const serverProcess = spawn(process.execPath, [serverScript], {
  cwd: path.join(__dirname, 'server'),
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env, FORCE_COLOR: '1' }
});

serverProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log('\x1b[32m[server]\x1b[0m ' + line);
  });
});

serverProcess.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.error('\x1b[31m[server-err]\x1b[0m ' + line);
  });
});

// 2. Spawn Vite Client
const viteScript = path.join(__dirname, 'client', 'node_modules', 'vite', 'bin', 'vite.js');
const clientProcess = spawn(process.execPath, [viteScript, '--port', '3000', '--host'], {
  cwd: path.join(__dirname, 'client'),
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env, FORCE_COLOR: '1' }
});

clientProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log('\x1b[36m[client]\x1b[0m ' + line);
  });
});

clientProcess.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.error('\x1b[33m[client-warn]\x1b[0m ' + line);
  });
});

// Graceful cleanup
function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 Shutting down CodeVigil AI services...');
  try {
    serverProcess.kill();
  } catch (e) {}
  try {
    clientProcess.kill();
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
