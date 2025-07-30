import { TestResult, TestSuiteRun } from '@prompt-kitchen/shared/src/dtos';
import { randomUUID } from 'crypto';
import { Knex } from 'knex';
import { DatabaseConnector } from './db/db';

export class TestSuiteRunRepository {
  private readonly knex: Knex;

  constructor(db: DatabaseConnector) {
    this.knex = db.knex;
  }

  async createTestSuiteRun(data: Omit<TestSuiteRun, 'id' | 'createdAt'> & { id?: string; promptHistoryId: string; runAt: Date; status: string; passPercentage: number }): Promise<string> {
    const id = data.id || randomUUID();
    await this.knex('test_suite_runs').insert({
      id,
      test_suite_id: data.testSuiteId,
      prompt_history_id: data.promptHistoryId,
      run_at: data.runAt,
      status: data.status,
      pass_percentage: data.passPercentage,
    });
    return id;
  }

  async updateTestSuiteRunStatus(runId: string, status: string, passPercentage?: number): Promise<void> {
    const update: any = { status };
    if (typeof passPercentage === 'number') {
      update.pass_percentage = passPercentage;
    }
    await this.knex('test_suite_runs').where({ id: runId }).update(update);
  }

  async insertTestResult(data: Omit<TestResult, 'id' | 'createdAt' | 'output'> & { id?: string; actualOutput: string; createdAt: Date }): Promise<void> {
    const id = data.id || randomUUID();
    await this.knex('test_results').insert({
      id,
      test_suite_run_id: data.testSuiteRunId,
      test_case_id: data.testCaseId,
      actual_output: data.actualOutput,
      status: data.status,
      created_at: data.createdAt,
    });
  }

  /**
   * Returns a TestSuiteRun DTO with an array of TestResult DTOs as 'results'.
   */
  async getTestSuiteRunWithResults(runId: string): Promise<(TestSuiteRun & { results: TestResult[]; status: string; passPercentage: number; promptHistoryId: string }) | null> {
    const run = await this.knex('test_suite_runs').where({ id: runId }).first();
    if (!run) return null;
    const resultsRows = await this.knex('test_results').where({ test_suite_run_id: runId });
    // Map DB row to DTOs
    const testSuiteRun: TestSuiteRun & { status: string; passPercentage: number; promptHistoryId: string } = {
      id: run.id,
      testSuiteId: run.test_suite_id,
      createdAt: new Date(run.run_at),
      status: run.status,
      passPercentage: run.pass_percentage,
      promptHistoryId: run.prompt_history_id,
    };
    const results: TestResult[] = resultsRows.map((row: any) => ({
      id: row.id,
      testSuiteRunId: row.test_suite_run_id,
      testCaseId: row.test_case_id,
      status: row.status === 'PASS' ? 'PASS' : 'FAIL',
      output: row.actual_output,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    }));
    return { ...testSuiteRun, results };
  }
}
