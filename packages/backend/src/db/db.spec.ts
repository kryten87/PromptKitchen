import { promptKitchenDb } from './db';

describe('Database Connection', () => {
  it('should connect to the database and perform a simple query', async () => {
    try {
      const result = await promptKitchenDb.raw('SELECT 1+1 as result');
      expect(result).toBeDefined();
    } catch (error) {
      // The test will fail if an error is thrown
      expect(error).toBeUndefined();
    }
  });

  afterAll(async () => {
    await promptKitchenDb.destroy();
  });
});
