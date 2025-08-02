import type { TestCaseRunMode } from '@prompt-kitchen/shared/src/dtos';
import { TestCase } from '@prompt-kitchen/shared/src/dtos';
import { Knex } from 'knex';
import { DatabaseConnector } from '../db/db';

interface TestCaseRow {
  id: string;
  test_suite_id: string;
  inputs: string;
  expected_output: string;
  run_mode: string;
  output_type?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export class TestCaseRepository {
  private readonly knex: Knex;

  constructor(db: DatabaseConnector) {
    this.knex = db.knex;
  }

  async getById(id: string): Promise<TestCase | null> {
    const row = await this.knex<TestCaseRow>('test_cases').where({ id }).first();
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      testSuiteId: row.test_suite_id,
      inputs: typeof row.inputs === 'string' ? JSON.parse(row.inputs) : row.inputs,
      expectedOutput: typeof row.expected_output === 'string' && row.output_type === 'json' ? JSON.parse(row.expected_output) : row.expected_output,
      runMode: row.run_mode as TestCaseRunMode,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getAllByTestSuiteId(testSuiteId: string): Promise<TestCase[]> {
    const rows = await this.knex('test_cases').where({ test_suite_id: testSuiteId });
    return rows.map((row: TestCaseRow) => ({
      id: row.id,
      testSuiteId: row.test_suite_id,
      inputs: typeof row.inputs === 'string' ? JSON.parse(row.inputs) : row.inputs,
      expectedOutput: typeof row.expected_output === 'string' && row.output_type === 'json' ? JSON.parse(row.expected_output) : row.expected_output,
      runMode: row.run_mode as TestCaseRunMode,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async create(testCase: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestCase> {
    const now = new Date();
    const id = Math.random().toString(36).substring(2, 15);
    await this.knex<TestCaseRow>('test_cases').insert({
      id,
      test_suite_id: testCase.testSuiteId,
      inputs: JSON.stringify(testCase.inputs),
      expected_output: typeof testCase.expectedOutput === 'string' ? testCase.expectedOutput : JSON.stringify(testCase.expectedOutput),
      run_mode: testCase.runMode,
      output_type: typeof testCase.expectedOutput === 'string' ? 'string' : 'json',
      created_at: now,
      updated_at: now,
    });
    const result = await this.getById(id);
    if (!result) {
      throw new Error('Failed to create test case');
    }
    return result;
  }

  async update(id: string, updates: Partial<Omit<TestCase, 'id' | 'testSuiteId' | 'createdAt'>>): Promise<TestCase | null> {
    const dbUpdates: Partial<TestCaseRow> = { updated_at: new Date() };
    const updatesTyped = updates as Partial<TestCase> & { testSuiteId?: string; expectedOutput?: string | Record<string, unknown> };
    if (updatesTyped.testSuiteId) {
      dbUpdates.test_suite_id = updatesTyped.testSuiteId;
    }
    if (updatesTyped.inputs) {
      dbUpdates.inputs = JSON.stringify(updatesTyped.inputs);
    }
    if (updatesTyped.expectedOutput !== undefined) {
      dbUpdates.expected_output = typeof updatesTyped.expectedOutput === 'string' ? updatesTyped.expectedOutput : JSON.stringify(updatesTyped.expectedOutput);
      dbUpdates.output_type = typeof updatesTyped.expectedOutput === 'string' ? 'string' : 'json';
    }
    if (updatesTyped.runMode) {
      dbUpdates.run_mode = updatesTyped.runMode;
    }
    await this.knex('test_cases').where({ id }).update(dbUpdates);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.knex<TestCaseRow>('test_cases').where({ id }).delete();
  }
}
