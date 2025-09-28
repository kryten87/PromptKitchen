import { DatabaseConnector } from '@prompt-kitchen/shared';
import { Prompt, PromptHistory } from '@prompt-kitchen/shared';
import { Knex } from 'knex';



interface PromptHistoryRow {
  id: string;
  prompt_id: string;
  prompt: string;
  version: number;
  created_at: string | Date;
}

export class PromptRepository {
  private readonly knex: Knex;

  constructor(db: DatabaseConnector) {
    this.knex = db.knex;
  }

  async getById(id: string): Promise<Prompt | null> {
    const row = await this.knex('prompts')
      .leftJoin('models', 'prompts.model_id', 'models.id')
      .select(
        'prompts.*',
        'models.name as modelName',
        'models.is_active as isModelActive'
      )
      .where('prompts.id', id)
      .first();
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      prompt: row.prompt,
      version: row.version,
      modelId: row.model_id ?? null,
      modelName: row.modelName ?? undefined,
      isModelActive: typeof row.isModelActive === 'boolean' ? row.isModelActive : Boolean(row.isModelActive),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getAllByProjectId(projectId: string): Promise<Prompt[]> {
    const rows = await this.knex('prompts')
      .leftJoin('models', 'prompts.model_id', 'models.id')
      .select(
        'prompts.*',
        'models.name as modelName',
        'models.is_active as isModelActive'
      )
      .where('prompts.project_id', projectId);
    return rows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      prompt: row.prompt,
      version: row.version,
      modelId: row.model_id ?? null,
      modelName: row.modelName ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async create(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt> {
    const now = new Date();
    const id = Math.random().toString(36).substring(2, 15);
    await this.knex('prompts').insert({
      id,
      project_id: prompt.projectId,
      name: prompt.name,
      prompt: prompt.prompt,
      version: 1,
      model_id: prompt.modelId ?? null,
      created_at: now,
      updated_at: now,
    });
    const result = await this.getById(id);
    if (!result) {
      throw new Error('Failed to create prompt');
    }
    return result;
  }

  async update(id: string, updates: Partial<Omit<Prompt, 'id' | 'projectId' | 'createdAt'>>): Promise<Prompt | null> {
    const now = new Date();
    const dbUpdates: Record<string, unknown> = { ...updates, updated_at: now };
    if ('modelId' in updates) {
      dbUpdates.model_id = updates.modelId;
      delete dbUpdates.modelId;
    }
    await this.knex('prompts').where({ id }).update(dbUpdates);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.knex('prompts').where({ id }).del();
  }
}

export class PromptHistoryRepository {
  private readonly knex: Knex;

  constructor(db: DatabaseConnector) {
    this.knex = db.knex;
  }

  async getAllByPromptId(promptId: string): Promise<PromptHistory[]> {
    const rows = await this.knex<PromptHistoryRow>('prompt_history').where({ prompt_id: promptId }).orderBy('version', 'desc');
    return rows.map((row: PromptHistoryRow) => ({
      id: row.id,
      promptId: row.prompt_id,
      prompt: row.prompt,
      version: row.version,
      createdAt: new Date(row.created_at),
    }));
  }

  async getById(id: string): Promise<PromptHistory | null> {
    const rows = await this.knex<PromptHistoryRow>('prompt_history').where({ id }).limit(1);
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    return {
      id: row.id,
      promptId: row.prompt_id,
      prompt: row.prompt,
      version: row.version,
      createdAt: new Date(row.created_at),
    };
  }

  async create(history: Omit<PromptHistory, 'id' | 'createdAt'>): Promise<PromptHistory> {
    const now = new Date();
    const id = Math.random().toString(36).substring(2, 15);
    await this.knex('prompt_history').insert({
      id,
      prompt_id: history.promptId,
      prompt: history.prompt,
      version: history.version,
      created_at: now,
    });
    const rows = await this.knex<PromptHistoryRow>('prompt_history').where({ id });
    const row = rows[0];
    return {
      id: row.id,
      promptId: row.prompt_id,
      prompt: row.prompt,
      version: row.version,
      createdAt: new Date(row.created_at),
    };
  }
}
