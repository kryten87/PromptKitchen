import { TestCase } from '@prompt-kitchen/shared/src/dtos';
import { Knex } from 'knex';
import { DatabaseConnector } from './db/db';

export class TestCaseRepository {
  private readonly knex: Knex;

  constructor(db: DatabaseConnector) {
    this.knex = db.knex;
  }

  async getById(id: string): Promise<TestCase | null> {
    const row = await this.knex('test_cases').where({ id }).first();
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      testSuiteId: row.test_suite_id,
      inputs: typeof row.inputs === 'string' ? JSON.parse(row.inputs) : row.inputs,
      expectedOutput: row.expected_output,
      runMode: row.run_mode,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getAllByTestSuiteId(testSuiteId: string): Promise<TestCase[]> {
    const rows = await this.knex('test_cases').where({ test_suite_id: testSuiteId });
    return rows.map((row: any) => ({
      id: row.id,
      testSuiteId: row.test_suite_id,
      inputs: typeof row.inputs === 'string' ? JSON.parse(row.inputs) : row.inputs,
      expectedOutput: row.expected_output,
      runMode: row.run_mode,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async create(testCase: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestCase> {
    const now = new Date();
    const id = Math.random().toString(36).substring(2, 15);
    await this.knex('test_cases').insert({
      id,
      test_suite_id: testCase.testSuiteId,
      inputs: JSON.stringify(testCase.inputs),
      expected_output: testCase.expectedOutput,
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
    const dbUpdates: any = { ...updates, updated_at: new Date() };
    if (dbUpdates.testSuiteId) {
      dbUpdates.test_suite_id = dbUpdates.testSuiteId;
      delete dbUpdates.testSuiteId;
    }
    if (dbUpdates.inputs && typeof dbUpdates.inputs !== 'string') {
      dbUpdates.inputs = JSON.stringify(dbUpdates.inputs);
    }
    if (dbUpdates.expectedOutput !== undefined) {
      dbUpdates.expected_output = dbUpdates.expectedOutput;
      dbUpdates.output_type = typeof dbUpdates.expectedOutput === 'string' ? 'string' : 'json';
      delete dbUpdates.expectedOutput;
    }
    await this.knex('test_cases').where({ id }).update(dbUpdates);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.knex('test_cases').where({ id }).delete();
  }
}
