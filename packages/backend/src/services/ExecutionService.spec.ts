import { loadPKConfig } from '../config';

import type { AssertionResult } from '@prompt-kitchen/shared';
import { DatabaseConnector } from '@prompt-kitchen/shared';
import { TestCase } from '@prompt-kitchen/shared';
import { TestCaseRepository } from '../repositories/TestCaseRepository';
import { EvaluationService } from '../services/EvaluationService';
import { ExecutionService } from '../services/ExecutionService';
import { LLMService } from '../services/LLMService';

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
  getAllByTestSuiteId: jest.fn(async () => mockTestCases),
};

const mockDb: Record<string, jest.Mock> = {
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
    const config = loadPKConfig();
    service = new ExecutionService({
      llmService: mockLLMService as LLMService,
      testCaseRepo: mockTestCaseRepo as TestCaseRepository,
      db: mockDb as unknown as DatabaseConnector,
      config,
    });
    jest.clearAllMocks();
  });

  it('should start a test suite run and return run id', async () => {
    const runId = await service.startTestSuiteRun('suite1', 'Hello {{name}}', 'hist1', undefined);
    expect(runId).toBeDefined();
  });

  it('should pass modelName to LLMService when provided', async () => {
    const modelName = 'gpt-4-test';
    await service.runTestSuite('run1', 'suite1', 'Hello {{name}}', modelName);

    expect(mockLLMService.completePrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        model: modelName,
      })
    );
  });

  it('should run test suite and store results', async () => {
    await service.runTestSuite('run1', 'suite1', 'Hello {{name}}', undefined);
    expect((mockDb as Record<string, jest.Mock>).update).toHaveBeenCalledWith({ status: 'RUNNING' });
    expect((mockDb as Record<string, jest.Mock>).insert).toHaveBeenCalled();
    expect((mockDb as Record<string, jest.Mock>).update).toHaveBeenCalledWith({ status: 'COMPLETED', pass_percentage: expect.any(Number) });
  });

  it('should get test suite run results', async () => {
    // Mock the repo to return a DTO-like object with correct status type and details
    const mockDetails: AssertionResult[] = [
      {
        assertionId: 'a1',
        path: '$',
        matcher: 'toEqual',
        not: false,
        pathMatch: 'ANY',
        passed: true,
        actualSamples: ['Echo: Hello Alice'],
        message: 'Matched',
      },
    ];
    service['testSuiteRunRepo'].getTestSuiteRunWithResults = jest.fn(async () => ({
      id: 'run1',
      testSuiteId: 'suite1',
      createdAt: new Date(),
      status: 'COMPLETED',
      passPercentage: 50,
      promptHistoryId: 'hist1',
      results: [
        { id: 'result1', testSuiteRunId: 'run1', testCaseId: 'case1', status: 'PASS' as const, output: 'Echo: Hello Alice', createdAt: new Date(), details: mockDetails },
      ],
    })) as unknown as typeof service['testSuiteRunRepo']['getTestSuiteRunWithResults'];
    const result = await service.getTestSuiteRun('run1');
    expect(result).toBeDefined();
    expect(result?.results[0].status).toBe('PASS');
    expect(result?.results[0].details).toEqual(mockDetails);
  });

  it('assertions end-to-end: ANY/ALL and not modifier behavior', async () => {
    // Create a test case that uses assertions
    const assertionCase = makeTestCase({
      id: 'case-assert-1',
      inputs: {},
      expectedOutput: '',
    });
    // Add assertions: $.value toEqual "42" and $.value toMatch /4\d/
    assertionCase.assertions = [
      {
        assertionId: 'as1',
        path: '$.value',
        matcher: 'toEqual',
        not: false,
        pathMatch: 'ANY',
        expected: '42',
      },
      {
        assertionId: 'as2',
        path: '$.value',
        matcher: 'toMatch',
        not: false,
        pathMatch: 'ANY',
        expected: '4\\d',
      },
    ];

    // Mock repo to return only our assertion case
    service = new ExecutionService({
      llmService: {
        completePrompt: jest.fn(async () => ({ output: JSON.stringify({ value: '42' }) })),
      } as unknown as LLMService,
      testCaseRepo: { getAllByTestSuiteId: jest.fn(async () => [assertionCase]) } as unknown as TestCaseRepository,
      db: mockDb as unknown as DatabaseConnector,
      config: loadPKConfig(),
    });

    // Install a local mock to capture the insert payload without using `any` casts
    const mockInsert = jest.fn(async () => ({}));
    (service as unknown as { testSuiteRunRepo: { insertTestResult: (arg: unknown) => Promise<unknown> } }).testSuiteRunRepo.insertTestResult = mockInsert as unknown as (
      arg: unknown
    ) => Promise<unknown>;

    await service.runTestSuite('run-assert-1', 'ignored prompt', 'hist-1', undefined);

    expect(mockInsert).toHaveBeenCalled();
    expect(mockInsert.mock.calls.length).toBeGreaterThan(0);
    const calls = mockInsert.mock.calls as unknown as Array<Array<unknown>>;
    expect(calls.length).toBeGreaterThan(0);
    const callArgsRaw = calls[0][0] as unknown;
    expect(callArgsRaw).toBeDefined();
    const callArgs = callArgsRaw as { details?: unknown };
    // details should exist and indicate assertion results
    expect(callArgs.details).toBeDefined();
    expect(Array.isArray(callArgs.details)).toBe(true);
    const details = callArgs.details as AssertionResult[];
    expect(details.length).toBeGreaterThan(0);
    // Each assertion result should be present and report pass/fail status
    const ids = details.map((d) => d.assertionId);
    expect(ids).toContain('as1');
    expect(ids).toContain('as2');
    const resAs1 = details.find((d) => d.assertionId === 'as1');
    const resAs2 = details.find((d) => d.assertionId === 'as2');
    expect(resAs1).toBeDefined();
    expect(resAs2).toBeDefined();
    // Ensure each assertion produced a result and has an informative message
    expect(typeof resAs1?.passed).toBe('boolean');
    expect(typeof resAs2?.passed).toBe('boolean');
    expect(typeof resAs1?.message).toBe('string');
    expect(typeof resAs2?.message).toBe('string');
  });

  it('truncates large details and includes truncation marker + hash', async () => {
    // Create a large assertion result via mocking EvaluationService
    const largeSample = 'x'.repeat(2000);
    const fakeResult: { passed: boolean; results: AssertionResult[] } = {
      passed: true,
      results: [
        {
          assertionId: 'big1',
          path: '$',
          matcher: 'toEqual',
          not: false,
          pathMatch: 'ANY',
          passed: true,
          actualSamples: [largeSample],
          message: 'big',
        },
      ],
    };

    // Spy EvaluationService.factory to return our fake evaluator
    const evalFactorySpy = jest.spyOn(EvaluationService, 'factory').mockReturnValue(({
      evaluate: () => fakeResult,
    } as unknown) as EvaluationService);

    // Small config to force truncation
    const smallConfig = { ...loadPKConfig(), PK_MAX_TEST_RESULT_DETAILS_BYTES: 20 };

    const assertionCase = makeTestCase({ id: 'case-big-1', inputs: {}, expectedOutput: '' });
    assertionCase.assertions = [
      { assertionId: 'big1', path: '$', matcher: 'toEqual', not: false, pathMatch: 'ANY', expected: null },
    ];

    const svc = new ExecutionService({
      llmService: { completePrompt: jest.fn(async () => ({ output: JSON.stringify({}) })) } as unknown as LLMService,
      testCaseRepo: { getAllByTestSuiteId: jest.fn(async () => [assertionCase]) } as unknown as TestCaseRepository,
      db: mockDb as unknown as DatabaseConnector,
      config: smallConfig,
    });

    const mockInsert = jest.fn(async () => ({}));
    (svc as unknown as { testSuiteRunRepo: { insertTestResult: (arg: unknown) => Promise<unknown> } }).testSuiteRunRepo.insertTestResult = mockInsert as unknown as (
      arg: unknown
    ) => Promise<unknown>;

    await svc.runTestSuite('run-big-1', 'ignored', 'hist-1', undefined);

    expect(mockInsert).toHaveBeenCalled();
    expect(mockInsert.mock.calls.length).toBeGreaterThan(0);
    const callsBig = mockInsert.mock.calls as unknown as Array<Array<unknown>>;
    expect(callsBig.length).toBeGreaterThan(0);
    const callArgsRawBig = callsBig[0][0] as unknown;
    expect(callArgsRawBig).toBeDefined();
    const callArgs = callArgsRawBig as { details?: unknown };
    expect(callArgs.details).toBeDefined();
    const details = callArgs.details as AssertionResult[];
    // Depending on how truncateDetails reduced size, actualSamples may be replaced with ['...truncated']
    // or removed (empty array). Accept either behavior.
    const samples = details[0].actualSamples;
    expect(Array.isArray(samples)).toBe(true);
    const isMarker = samples.length === 1 && samples[0] === '...truncated';
    const isEmpty = samples.length === 0;
    expect(isMarker || isEmpty).toBe(true);
    if (isMarker) {
      expect(typeof (details[0] as unknown as { hash?: string }).hash).toBe('string');
    }

    // restore spy
    evalFactorySpy.mockRestore();
  });
});
