// Top-level imports only
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';

/**
 * Generates a temp SQLite file path for Playwright E2E tests.
 * @returns Absolute path to temp SQLite file
 */
export function sqliteTempPath(): string {
  const randomId = randomBytes(8).toString('hex');
  return join(tmpdir(), `prompt-kitchen-e2e-${randomId}.sqlite3`);
}

/**
 * Generates a per-worker temp SQLite file path for Playwright E2E tests.
 * @param workerId Unique Playwright worker id
 * @returns Absolute path to temp SQLite file
 */
export function getSqliteTempPath(workerId: string): string {
  // Use a deterministic filename for each worker
  return join(tmpdir(), `prompt-kitchen-e2e-worker-${workerId}.sqlite3`);
}
