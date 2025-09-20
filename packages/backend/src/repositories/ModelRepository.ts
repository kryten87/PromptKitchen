import { DatabaseConnector } from '@prompt-kitchen/shared';
import { Model } from '@prompt-kitchen/shared';
import { Knex } from 'knex';

interface ModelRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
}

export class ModelRepository {
  private readonly knex: Knex;

  constructor(db: DatabaseConnector) {
    this.knex = db.knex;
  }

  private toModel(row: ModelRow): Model {
    return {
      id: row.id,
      name: row.name,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findAll(): Promise<Model[]> {
    const rows = await this.knex<ModelRow>('models').select();
    return rows.map(this.toModel);
  }

  async findByName(name: string): Promise<Model | undefined> {
    const row = await this.knex<ModelRow>('models').where({ name }).first();
    return row ? this.toModel(row) : undefined;
  }

  async create(name: string): Promise<Model> {
    const now = new Date();
    const id = Math.random().toString(36).substring(2, 15); // simple id for test
    await this.knex<ModelRow>('models').insert({
      id,
      name,
      is_active: true,
      created_at: now,
      updated_at: now,
    });
    const row = await this.knex<ModelRow>('models').where({ id }).first();
    if (!row) throw new Error('Failed to create model');
    return this.toModel(row);
  }

  async update(id: string, updates: Partial<Model>): Promise<void> {
    const dbUpdates: Partial<ModelRow> = { updated_at: new Date() };
    if (typeof updates.name !== 'undefined') {
      dbUpdates.name = updates.name;
    }
    if (typeof updates.isActive !== 'undefined') {
      dbUpdates.is_active = updates.isActive;
    }
    await this.knex<ModelRow>('models').where({ id }).update(dbUpdates);
  }

  async upsert(modelNames: string[]): Promise<void> {
    // Deactivate all models
    await this.knex<ModelRow>('models').update({ is_active: false });
    for (const name of modelNames) {
      const existing = await this.knex<ModelRow>('models').where({ name }).first();
      if (existing) {
        await this.knex<ModelRow>('models').where({ id: existing.id }).update({ is_active: true, updated_at: new Date() });
      } else {
        const now = new Date();
        const id = Math.random().toString(36).substring(2, 15); // simple id for test
        await this.knex<ModelRow>('models').insert({
          id,
          name,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      }
    }
  }
}
