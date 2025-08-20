import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import kill from 'tree-kill';

const PID_FILE = path.join(__dirname, '.server-pids');

async function globalTeardown(config: FullConfig) {
  console.log('Global teardown: finished E2E tests');

  if (fs.existsSync(PID_FILE)) {
    const pids: number[] = JSON.parse(fs.readFileSync(PID_FILE, 'utf-8'));
    console.log(`Found PIDs to terminate: ${pids.join(', ')}`);

    const killPromises = pids.map(pid => {
      return new Promise<void>((resolve, reject) => {
        kill(pid, 'SIGKILL', (err) => {
          if (err) {
            console.error(`Failed to kill process ${pid}:`, err);
            // Do not reject, just log the error and continue
          } else {
            console.log(`Process ${pid} terminated.`);
          }
          resolve();
        });
      });
    });

    await Promise.all(killPromises);

    fs.unlinkSync(PID_FILE);
    console.log('PID file deleted.');
  } else {
    console.log('No PID file found, assuming servers were not started by this process.');
  }
}

export default globalTeardown;
