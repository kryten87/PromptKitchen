// Top-level imports only
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Generates a per-worker temp SQLite file path for Playwright E2E tests.
 * @param workerId Unique Playwright worker id
 * @returns Absolute path to temp SQLite file
 */
export function getSqliteTempPath(workerId: string): string {
  // Use a deterministic filename for each worker
  return join(tmpdir(), `prompt-kitchen-e2e-worker-${workerId}.sqlite3`);
}
