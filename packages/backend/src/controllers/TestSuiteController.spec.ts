import { DatabaseConnector, runMigrations } from '@prompt-kitchen/shared';
import type { Assertion } from '@prompt-kitchen/shared';
import fs from 'fs';
import path from 'path';
import { TestSuiteService } from '../services/TestSuiteService';

const TEST_DB_PATH = path.join(__dirname, '../../test-controller.sqlite3');

describe('TestSuiteController Integration Tests', () => {
  let db: DatabaseConnector;
  let service: TestSuiteService;
  let testSuiteId: string;

  beforeAll(async () => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db = new DatabaseConnector({ filename: TEST_DB_PATH });
    await runMigrations(db);
    service = TestSuiteService.factory(db);

    // Create a test suite for foreign key
    const suite = await service.createTestSuite({
      promptId: 'prompt-1',
      name: 'Test Suite',
    });
    testSuiteId = suite.id;
  });

  afterAll(async () => {
    await db.knex.destroy();
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  });

  it('should create a test case with assertions (reproducing POST bug)', async () => {
    const assertions: Assertion[] = [
      {
        assertionId: 'assertion-1',
        path: '$.result',
        matcher: 'toEqual',
        expected: 'success',
        not: false,
        pathMatch: 'ANY',
      },
      {
        assertionId: 'assertion-2',
        path: '$.status',
        matcher: 'toContain',
        expected: 'completed',
        not: false,
        pathMatch: 'ALL',
      },
    ];

    // This simulates what the POST controller should do
    const testCaseData = {
      testSuiteId,
      inputs: { action: 'test' },
      expectedOutput: { result: 'success', status: 'completed' },
      assertions,
      runMode: 'DEFAULT' as const,
    };

    const createdTestCase = await service.createTestCase(testCaseData);
    
    expect(createdTestCase).toHaveProperty('id');
    expect(createdTestCase.testSuiteId).toBe(testSuiteId);
    expect(createdTestCase.inputs.action).toBe('test');
    expect(createdTestCase.expectedOutput).toEqual({ result: 'success', status: 'completed' });
    expect(createdTestCase.runMode).toBe('DEFAULT');
    expect(createdTestCase.assertions).toEqual(assertions);

    // Verify the test case is properly persisted by fetching it again
    const fetchedTestCase = await service.getTestCaseById(createdTestCase.id);
    expect(fetchedTestCase).not.toBeNull();
    expect(fetchedTestCase?.assertions).toEqual(assertions);
  });

  it('should create a test case without assertions', async () => {
    const testCaseData = {
      testSuiteId,
      inputs: { foo: 'bar' },
      expectedOutput: 'simple output',
      runMode: 'DEFAULT' as const,
    };

    const createdTestCase = await service.createTestCase(testCaseData);
    
    expect(createdTestCase).toHaveProperty('id');
    expect(createdTestCase.testSuiteId).toBe(testSuiteId);
    expect(createdTestCase.inputs.foo).toBe('bar');
    expect(createdTestCase.expectedOutput).toBe('simple output');
    expect(createdTestCase.runMode).toBe('DEFAULT');
    expect(createdTestCase.assertions).toBeUndefined();
  });

  it('should update a test case with assertions', async () => {
    // First create a test case without assertions
    const initialData = {
      testSuiteId,
      inputs: { initial: 'value' },
      expectedOutput: 'initial output',
      runMode: 'DEFAULT' as const,
    };

    const createdTestCase = await service.createTestCase(initialData);
    
    // Now update it with assertions
    const assertions: Assertion[] = [
      {
        assertionId: 'assertion-1',
        path: '$.updated',
        matcher: 'toEqual',
        expected: true,
        not: false,
        pathMatch: 'ANY',
      },
    ];

    const updateData = {
      inputs: { updated: 'value' },
      expectedOutput: { updated: true },
      assertions,
      runMode: 'SKIP' as const,
    };

    const updatedTestCase = await service.updateTestCase(createdTestCase.id, updateData);
    
    expect(updatedTestCase).not.toBeNull();
    expect(updatedTestCase?.id).toBe(createdTestCase.id);
    expect(updatedTestCase?.inputs.updated).toBe('value');
    expect(updatedTestCase?.expectedOutput).toEqual({ updated: true });
    expect(updatedTestCase?.runMode).toBe('SKIP');
    expect(updatedTestCase?.assertions).toEqual(assertions);
  });
});