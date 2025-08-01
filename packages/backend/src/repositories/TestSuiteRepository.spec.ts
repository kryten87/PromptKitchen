import fs from 'fs';
import path from 'path';
import { DatabaseConnector } from './db/db';
import { TestCaseRepository } from './TestCaseRepository';
import { TestSuiteRepository } from './TestSuiteRepository';

let db: DatabaseConnector;
let suiteRepo: TestSuiteRepository;
let caseRepo: TestCaseRepository;

const TEST_DB_PATH = path.join(__dirname, '../../dev.test.suite.sqlite3');

async function runMigrations(db: DatabaseConnector) {
  await db.knex.migrate.latest({
    directory: path.join(__dirname, '../migrations'),
  });
}

beforeAll(async () => {
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  db = new DatabaseConnector({ filename: TEST_DB_PATH });
  await runMigrations(db);
  suiteRepo = new TestSuiteRepository(db);
  caseRepo = new TestCaseRepository(db);
  // Create a test suite for foreign key
  await suiteRepo.create({ promptId: 'prompt1', name: 'Suite 1' });
});

afterAll(async () => {
  await db.knex.destroy();
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
});

describe('TestSuiteRepository', () => {
  it('should create, get, update, and delete a test suite', async () => {
    // Create
    const created = await suiteRepo.create({ promptId: 'prompt1', name: 'Suite 1' });
    expect(created).toHaveProperty('id');
    expect(created.name).toBe('Suite 1');
    expect(created.promptId).toBe('prompt1');

    // Get by id
    const fetched = await suiteRepo.getById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(created.id);

    // Update
    const updated = await suiteRepo.update(created.id, { name: 'Suite 1 Updated' });
    expect(updated?.name).toBe('Suite 1 Updated');

    // Get all by promptId
    const all = await suiteRepo.getAllByPromptId('prompt1');
    expect(all.length).toBeGreaterThan(0);

    // Delete
    await suiteRepo.delete(created.id);
    const afterDelete = await suiteRepo.getById(created.id);
    expect(afterDelete).toBeNull();
  });
});

describe('TestCaseRepository', () => {
  it('should create, get, update, and delete a test case', async () => {
    // Create
    const created = await caseRepo.create({
      testSuiteId: 'suite1',
      inputs: { foo: 'bar' },
      expectedOutput: 'baz',
      runMode: 'DEFAULT',
    });
    expect(created).toHaveProperty('id');
    expect(created.testSuiteId).toBe('suite1');
    expect(created.inputs['foo'] || (typeof created.inputs === 'string' ? JSON.parse(created.inputs).foo : undefined)).toBe('bar');
    expect(created.expectedOutput).toBe('baz');
    expect(created.runMode).toBe('DEFAULT');

    // Get by id
    const fetched = await caseRepo.getById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(created.id);

    // Update
    const updated = await caseRepo.update(created.id, { expectedOutput: 'qux' });
    const updatedOutput = typeof updated?.expectedOutput === 'string' ? updated?.expectedOutput : JSON.stringify(updated?.expectedOutput);
    expect(updatedOutput).toBe('qux');

    // Get all by testSuiteId
    const all = await caseRepo.getAllByTestSuiteId('suite1');
    expect(all.length).toBeGreaterThan(0);

    // Delete
    await caseRepo.delete(created.id);
    const afterDelete = await caseRepo.getById(created.id);
    expect(afterDelete).toBeNull();
  });
});
