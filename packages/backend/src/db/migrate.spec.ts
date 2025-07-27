import { promptKitchenDb } from './db';
import { runMigrations } from './migrate';

describe('Database Migration System', () => {
  afterAll(async () => {
    await promptKitchenDb.destroy();
  });

  it('should run migrations without error (idempotent)', async () => {
    await expect(runMigrations()).resolves.toBeUndefined();
    await expect(runMigrations()).resolves.toBeUndefined();
  });
});
