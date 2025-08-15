// ExecutionService.ts
import type { Assertion, AssertionResult } from '@prompt-kitchen/shared';
import { TestResult, TestSuiteRun } from '@prompt-kitchen/shared/src/dtos';
import { DatabaseConnector } from '../db/db';
import { TestCaseRepository } from '../repositories/TestCaseRepository';
import { TestSuiteRunRepository } from '../repositories/TestSuiteRunRepository';
import { EvaluationService } from './EvaluationService';
import { LLMService } from './LLMService';

export class ExecutionService {
  private readonly llmService: LLMService;
  private readonly testCaseRepo: TestCaseRepository;
  private readonly testSuiteRunRepo: TestSuiteRunRepository;

  constructor(opts: {
    llmService: LLMService;
    testCaseRepo: TestCaseRepository;
    db: DatabaseConnector;
    testSuiteRunRepo?: TestSuiteRunRepository;
  }) {
    this.llmService = opts.llmService;
    this.testCaseRepo = opts.testCaseRepo;
    this.testSuiteRunRepo = opts.testSuiteRunRepo || new TestSuiteRunRepository(opts.db);
  }

  async startTestSuiteRun(testSuiteId: string, promptText: string, promptHistoryId: string): Promise<string> {
    const runId = await this.testSuiteRunRepo.createTestSuiteRun({
      testSuiteId,
      promptHistoryId,
      runAt: new Date(),
      status: 'PENDING',
      passPercentage: 0,
    });
    this.runTestSuite(runId, testSuiteId, promptText);
    return runId;
  }

  async runTestSuite(runId: string, testSuiteId: string, promptText: string): Promise<void> {
    await this.testSuiteRunRepo.updateTestSuiteRunStatus(runId, 'RUNNING');
    const cases = await this.testCaseRepo.getAllByTestSuiteId(testSuiteId);
    let toRun = cases.filter(tc => tc.runMode === 'DEFAULT' || tc.runMode === 'ONLY');
    if (cases.some(tc => tc.runMode === 'ONLY')) {
      toRun = cases.filter(tc => tc.runMode === 'ONLY');
    }
    let passCount = 0;
    for (const testCase of toRun) {
      let prompt = promptText;
      if (typeof prompt !== 'string') {
        throw new Error('Prompt text is undefined or not a string');
      }
      for (const [key, value] of Object.entries(testCase.inputs)) {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }
      const llmResult = await this.llmService.completePrompt({ prompt });
      // Evaluate assertions if present
      let pass = false;
      let details: AssertionResult[] | undefined = undefined;
      // @ts-expect-error: assertions property may exist on testCase
      const assertions: Assertion[] | undefined = testCase.assertions;
      if (assertions && assertions.length > 0) {
        const evaluationService = EvaluationService.factory();
        const evalResult = evaluationService.evaluate(llmResult.output, assertions);
        pass = evalResult.passed;
        details = evalResult.results;
      } else {
        if (typeof testCase.expectedOutput === 'string') {
          pass = EvaluationService.exactStringMatch(testCase.expectedOutput, llmResult.output);
        } else {
          try {
            const actualJson = JSON.parse(llmResult.output);
            pass = EvaluationService.deepJsonEqual(testCase.expectedOutput, actualJson);
          } catch {
            pass = false;
          }
        }
      }
      if (pass) passCount++;
      await this.testSuiteRunRepo.insertTestResult({
        testSuiteRunId: runId,
        testCaseId: testCase.id,
        actualOutput: llmResult.output,
        status: pass ? 'PASS' : 'FAIL',
        createdAt: new Date(),
        details,
      });
    }
    await this.testSuiteRunRepo.updateTestSuiteRunStatus(
      runId,
      'COMPLETED',
      toRun.length ? (passCount / toRun.length) * 100 : 0
    );
  }

  async getTestSuiteRun(runId: string): Promise<(TestSuiteRun & { results: TestResult[]; status: string; passPercentage: number; promptHistoryId: string }) | null> {
    return this.testSuiteRunRepo.getTestSuiteRunWithResults(runId);
  }
}
