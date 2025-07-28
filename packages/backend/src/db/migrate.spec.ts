import { DatabaseConnector } from './db';
import { runMigrations } from './migrate';

describe('Database Migration System', () => {
  let db: DatabaseConnector;

  beforeAll(async () => {
    db = new DatabaseConnector({ filename: ':memory:' });
    await runMigrations(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should run migrations without error (idempotent)', async () => {
    await expect(runMigrations(db)).resolves.toBeUndefined();
    await expect(runMigrations(db)).resolves.toBeUndefined();
  });
});
