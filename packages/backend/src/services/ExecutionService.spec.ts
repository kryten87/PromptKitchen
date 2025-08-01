import { TestCase } from '@prompt-kitchen/shared/src/dtos';
import { ExecutionService } from './ExecutionService';
import { LLMService } from './LLMService';
import { TestCaseRepository } from './TestCaseRepository';
import { TestSuiteRepository } from './TestSuiteRepository';
import { DatabaseConnector } from './db/db';

// Helper: create a valid TestCase with all required fields
function makeTestCase(partial: Partial<TestCase>): TestCase {
  return {
    id: partial.id || 'case1',
    testSuiteId: partial.testSuiteId || 'suite1',
    inputs: partial.inputs || { name: 'Alice' },
    expectedOutput: partial.expectedOutput || 'Echo: Hello Alice',
    runMode: partial.runMode || 'DEFAULT',
    createdAt: partial.createdAt || new Date(),
    updatedAt: partial.updatedAt || new Date(),
  };
}

const mockTestCases: TestCase[] = [
  makeTestCase({ id: 'case1', inputs: { name: 'Alice' }, expectedOutput: 'Echo: Hello Alice' }),
  makeTestCase({ id: 'case2', inputs: { name: 'Bob' }, expectedOutput: { greeting: 'Hello Bob' } }),
];

const mockLLMService: Partial<LLMService> = {
  completePrompt: jest.fn(async ({ prompt }) => ({ output: `Echo: ${prompt}` })),
};

const mockTestCaseRepo: Partial<TestCaseRepository> = {
  getAllByTestSuiteId: jest.fn(async (suiteId) => mockTestCases),
};

const mockTestSuiteRepo: Partial<TestSuiteRepository> = {};

// Use 'any' for mockDb to avoid type errors
const mockDb: any = {
  knex: jest.fn(() => mockDb),
  insert: jest.fn(() => mockDb),
  returning: jest.fn(() => ['run1']),
  where: jest.fn(() => mockDb),
  update: jest.fn(() => mockDb),
  first: jest.fn(() => ({ id: 'run1', status: 'COMPLETED', pass_percentage: 50 })),
};

describe('ExecutionService', () => {
  let service: ExecutionService;

  beforeEach(() => {
    service = new ExecutionService({
      llmService: mockLLMService as LLMService,
      testCaseRepo: mockTestCaseRepo as TestCaseRepository,
      db: mockDb as DatabaseConnector,
    });
    jest.clearAllMocks();
  });

  it('should start a test suite run and return run id', async () => {
    const runId = await service.startTestSuiteRun('suite1', 'Hello {{name}}', 'hist1');
    expect(runId).toBeDefined();
  });

  it('should run test suite and store results', async () => {
    await service.runTestSuite('run1', 'suite1', 'Hello {{name}}');
    expect(mockDb.update).toHaveBeenCalledWith({ status: 'RUNNING' });
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.update).toHaveBeenCalledWith({ status: 'COMPLETED', pass_percentage: expect.any(Number) });
  });

  it('should get test suite run results', async () => {
    // Mock the repo to return a DTO-like object with correct status type
    service['testSuiteRunRepo'].getTestSuiteRunWithResults = jest.fn(async (runId: string) => ({
      id: 'run1',
      testSuiteId: 'suite1',
      createdAt: new Date(),
      status: 'COMPLETED',
      passPercentage: 50,
      promptHistoryId: 'hist1',
      results: [
        { id: 'result1', testSuiteRunId: 'run1', testCaseId: 'case1', status: 'PASS' as const, output: 'Echo: Hello Alice', createdAt: new Date() },
      ],
    }));
    const result = await service.getTestSuiteRun('run1');
    expect(result?.id).toBe('run1');
    expect(result?.status).toBe('COMPLETED');
    expect(result?.results).toBeDefined();
    expect(result?.results[0].status).toBe('PASS');
    expect(result?.results[0].output).toBe('Echo: Hello Alice');
  });
});
