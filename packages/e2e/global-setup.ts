import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Example: could run migrations, seed DB, etc.
  // For now, just log start
  console.log('Global setup: starting E2E tests');
}

export default globalSetup;
