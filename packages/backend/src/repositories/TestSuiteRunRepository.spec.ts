import { DatabaseConnector, runMigrations } from '@prompt-kitchen/shared';
import { TestSuiteRunRepository } from '../repositories/TestSuiteRunRepository';

// Use a real DatabaseConnector with an in-memory SQLite DB for testing
const db = new DatabaseConnector({ dbFile: ':memory:' });

describe('TestSuiteRunRepository', () => {
  let repo: TestSuiteRunRepository;

  beforeAll(async () => {
    await runMigrations(db);
  });

  beforeEach(() => {
    repo = new TestSuiteRunRepository(db);
  });

  afterAll(async () => {
    await db.knex.destroy();
  });

  it('should create a test suite run', async () => {
    const runId = await repo.createTestSuiteRun({
      testSuiteId: 'suite1',
      promptHistoryId: 'hist1',
      runAt: new Date(),
      status: 'PENDING',
      passPercentage: 0,
    });
    expect(runId).toBeDefined();
    const row = await db.knex('test_suite_runs').where({ id: runId }).first();
    expect(row).toBeTruthy();
  });

  it('should update test suite run status', async () => {
    const runId = await repo.createTestSuiteRun({
      testSuiteId: 'suite2',
      promptHistoryId: 'hist2',
      runAt: new Date(),
      status: 'PENDING',
      passPercentage: 0,
    });
    await repo.updateTestSuiteRunStatus(runId, 'RUNNING');
    let row = await db.knex('test_suite_runs').where({ id: runId }).first();
    expect(row.status).toBe('RUNNING');
    await repo.updateTestSuiteRunStatus(runId, 'COMPLETED', 100);
    row = await db.knex('test_suite_runs').where({ id: runId }).first();
    expect(row.status).toBe('COMPLETED');
    expect(row.pass_percentage).toBe(100);
  });

  it('should insert a test result', async () => {
    const runId = await repo.createTestSuiteRun({
      testSuiteId: 'suite3',
      promptHistoryId: 'hist3',
      runAt: new Date(),
      status: 'PENDING',
      passPercentage: 0,
    });
    await db.knex('test_results').insert({
      id: 'test-result-1',
      test_suite_run_id: runId,
      test_case_id: 'case1',
      actual_output: 'output',
      status: 'PASS',
    });
    const results = await db.knex('test_results').where({ test_suite_run_id: runId });
    expect(results.length).toBe(1);
    expect(results[0].status).toBe('PASS');
  });

  it('should get test suite run with results', async () => {
    const runId = await repo.createTestSuiteRun({
      testSuiteId: 'suite4',
      promptHistoryId: 'hist4',
      runAt: new Date(),
      status: 'PENDING',
      passPercentage: 0,
    });
    await db.knex('test_results').insert({
      id: 'test-result-2',
      test_suite_run_id: runId,
      test_case_id: 'case2',
      actual_output: 'output2',
      status: 'FAIL',
      created_at: new Date(),
    });
    const result = await repo.getTestSuiteRunWithResults(runId);
    expect(result).toBeTruthy();
    expect(result?.id).toBe(runId);
    expect(result?.testSuiteId).toBe('suite4');
    expect(result?.results.length).toBe(1);
    expect(result?.results[0].status).toBe('FAIL');
    expect(result?.results[0].output).toBe('output2');
    expect(result?.status).toBe('PENDING');
    expect(result?.promptHistoryId).toBe('hist4');
  });
});
