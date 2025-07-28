import { DatabaseConnector } from './db';

describe('DatabaseConnector', () => {
  let db: DatabaseConnector;

  afterEach(async () => {
    if (db) await db.destroy();
  });

  it('should connect to the database and perform a simple query', async () => {
    db = new DatabaseConnector({ filename: ':memory:' });
    const result = await db.knex.raw('SELECT 1+1 as result');
    expect(result).toBeDefined();
  });

  it('should use the provided filename', async () => {
    db = new DatabaseConnector({ filename: ':memory:' });
    const result = await db.knex.raw('SELECT 2+2 as result');
    expect(result).toBeDefined();
  });
});
