import { TestSuite } from '@prompt-kitchen/shared/src/dtos';
import { Knex } from 'knex';
import { DatabaseConnector } from '../db/db';

interface TestSuiteRow {
  id: string;
  prompt_id: string;
  name: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export class TestSuiteRepository {
  private readonly knex: Knex;

  constructor(db: DatabaseConnector) {
    this.knex = db.knex;
  }

  async getById(id: string): Promise<TestSuite | null> {
    const row = await this.knex('test_suites').where({ id }).first();
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      promptId: row.prompt_id,
      name: row.name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getAllByPromptId(promptId: string): Promise<TestSuite[]> {
    const rows = await this.knex('test_suites').where({ prompt_id: promptId });
    return rows.map((row: TestSuiteRow) => ({
      id: row.id,
      promptId: row.prompt_id,
      name: row.name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async create(testSuite: Omit<TestSuite, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestSuite> {
    const now = new Date();
    const id = Math.random().toString(36).substring(2, 15);
    await this.knex('test_suites').insert({
      id,
      prompt_id: testSuite.promptId,
      name: testSuite.name,
      created_at: now,
      updated_at: now,
    });
    const result = await this.getById(id);
    if (!result) {
      throw new Error('Failed to create test suite');
    }
    return result;
  }

  async update(id: string, updates: Partial<Omit<TestSuite, 'id' | 'promptId' | 'createdAt'>>): Promise<TestSuite | null> {
    const dbUpdates: Partial<TestSuiteRow> = { ...updates, updated_at: new Date() };
    const updatesTyped = updates as Partial<TestSuite> & { promptId?: string };
    if (updatesTyped.promptId) {
      dbUpdates.prompt_id = updatesTyped.promptId;
    }
    await this.knex('test_suites').where({ id }).update(dbUpdates);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.knex('test_suites').where({ id }).delete();
  }
}
