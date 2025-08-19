import { FullConfig } from '@playwright/test';
import { ChildProcess, spawn } from 'child_process';
import detectPort from 'detect-port';
import fs from 'fs';
import path from 'path';
import waitOn from 'wait-on';

const PORT = 5173;
const PID_FILE = path.join(__dirname, '.server-pids');
const LOG_DIR = path.join(__dirname, 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

const backendLogStream = fs.createWriteStream(path.join(LOG_DIR, 'backend.log'));
const frontendLogStream = fs.createWriteStream(path.join(LOG_DIR, 'frontend.log'));


async function globalSetup(config: FullConfig) {
  console.log('Global setup: starting E2E tests');

  const port = await detectPort(PORT);

  if (port === PORT) {
    console.log(`Port ${PORT} is free, starting servers...`);

    const backendPath = path.resolve(__dirname, '../../../packages/backend');
    const frontendPath = path.resolve(__dirname, '../../../packages/frontend');

    const npmPath = '/home/dave/.nvm/versions/node/v22.17.1/bin/npm';

    const backend: ChildProcess = spawn(npmPath, ['run', 'dev'], {
      cwd: backendPath,
      detached: true,
      shell: false,
      stdio: ['ignore', backendLogStream, backendLogStream],
    });

    const frontend: ChildProcess = spawn(npmPath, ['run', 'dev'], {
      cwd: frontendPath,
      detached: true,
      shell: false,
      stdio: ['ignore', frontendLogStream, frontendLogStream],
    });

    // Give the processes a moment to spawn and get a PID
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (!backend.pid || !frontend.pid) {
      console.error('Backend PID:', backend.pid);
      console.error('Frontend PID:', frontend.pid);
      throw new Error('Failed to start servers. Check logs in packages/e2e/logs.');
    }

    console.log(`Backend server started with PID: ${backend.pid}`);
    console.log(`Frontend server started with PID: ${frontend.pid}`);

    fs.writeFileSync(PID_FILE, JSON.stringify([backend.pid, frontend.pid]));

    backend.unref();
    frontend.unref();

    try {
      await waitOn({
        resources: [`http://localhost:${PORT}`],
        timeout: 120000, // 120 seconds
      });
      console.log('Frontend server is ready.');
    } catch (err) {
      console.error('Server did not start in time. Check logs in packages/e2e/logs.', err);
      throw err;
    }
  } else {
    console.log(`Port ${PORT} is in use, assuming servers are already running.`);
  }
}

export default globalSetup;
