import fs from 'fs';
import path from 'path';
import { DatabaseConnector } from './db/db';
import { TestCaseRepository } from './TestCaseRepository';
import { TestSuiteRepository } from './TestSuiteRepository';

const TEST_DB_PATH = path.join(__dirname, '../../dev.test.sqlite3');

async function runMigrations(db: DatabaseConnector) {
  await db.knex.migrate.latest({
    directory: path.join(__dirname, '../migrations'),
  });
}

describe('TestCaseRepository', () => {
  let db: DatabaseConnector;
  let repo: TestCaseRepository;
  let suiteRepo: TestSuiteRepository;
  let testSuiteId: string;

  beforeAll(async () => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db = new DatabaseConnector({ filename: TEST_DB_PATH });
    await runMigrations(db);
    repo = new TestCaseRepository(db);
    suiteRepo = new TestSuiteRepository(db);
    // Create a test suite for foreign key
    const suite = await suiteRepo.create({
      promptId: 'prompt1',
      name: 'Suite 1',
    });
    testSuiteId = suite.id;
  });

  afterAll(async () => {
    await db.knex.destroy();
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  });

  let createdId: string;

  it('should create a test case', async () => {
    const created = await repo.create({
      testSuiteId,
      inputs: { foo: 'bar' },
      expectedOutput: 'baz',
      runMode: 'DEFAULT',
    });
    expect(created).toHaveProperty('id');
    expect(created.testSuiteId).toBe(testSuiteId);
    expect(created.inputs.foo).toBe('bar');
    expect(created.expectedOutput).toBe('baz');
    expect(created.runMode).toBe('DEFAULT');
    createdId = created.id;
  });

  it('should get a test case by id', async () => {
    const fetched = await repo.getById(createdId);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(createdId);
    expect(fetched?.testSuiteId).toBe(testSuiteId);
  });

  it('should get all test cases by testSuiteId', async () => {
    const all = await repo.getAllByTestSuiteId(testSuiteId);
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
    expect(all.some(tc => tc.id === createdId)).toBe(true);
  });

  it('should update a test case', async () => {
    const updated = await repo.update(createdId, { expectedOutput: 'qux' });
    expect(updated).not.toBeNull();
    expect(updated?.expectedOutput).toBe('qux');
  });

  it('should delete a test case', async () => {
    await repo.delete(createdId);
    const afterDelete = await repo.getById(createdId);
    expect(afterDelete).toBeNull();
  });
});
