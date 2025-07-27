import { promptKitchenDb } from './db';

describe('Database Connection', () => {
  it('should connect to the database and perform a simple query', async () => {
    const result = await promptKitchenDb.raw('SELECT 1+1 as result');
    expect(result).toBeDefined();
  });

  it('should use the DB_FILE environment variable if set', async () => {
    process.env.DB_FILE = './dev.sqlite3';
    const { promptKitchenDb: testDb } = await import('./db');
    const result = await testDb.raw('SELECT 2+2 as result');
    expect(result).toBeDefined();
    await testDb.destroy();
  });

  afterAll(async () => {
    await promptKitchenDb.destroy();
  });
});
