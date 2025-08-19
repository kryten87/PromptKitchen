import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Example: could clean up temp files, DB, etc.
  // For now, just log end
  console.log('Global teardown: finished E2E tests');
}

export default globalTeardown;
