import { DatabaseConnector } from '@prompt-kitchen/shared';
import { Project } from '@prompt-kitchen/shared';
import { Knex } from 'knex';

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export class ProjectRepository {
  private readonly knex: Knex;

  constructor(db: DatabaseConnector) {
    this.knex = db.knex;
  }

  async getById(id: string): Promise<Project | null> {
    const row = await this.knex<ProjectRow>('projects').where({ id }).first();
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getAllByUserId(userId: string): Promise<Project[]> {
    const rows = await this.knex<ProjectRow>('projects').whereRaw('user_id = ?', [userId]);
    return rows.map((row: ProjectRow) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const now = new Date();
    const id = Math.random().toString(36).substring(2, 15); // simple id for test
    await this.knex<ProjectRow>('projects').insert({
      id,
      user_id: project.userId,
      name: project.name,
      description: project.description,
      created_at: now,
      updated_at: now,
    });
    const result = await this.getById(id);
    if (!result) {
      throw new Error('Failed to create project');
    }
    return result;
  }

  async update(id: string, updates: Partial<Omit<Project, 'id' | 'userId' | 'createdAt'>>): Promise<Project | null> {
    const dbUpdates: Partial<ProjectRow> = { ...updates, updated_at: new Date() };
    const updatesTyped = updates as Partial<Project> & { userId?: string };
    if (updatesTyped.userId) {
      dbUpdates.user_id = updatesTyped.userId;
    }
    await this.knex('projects').where({ id }).update(dbUpdates);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.knex<ProjectRow>('projects').where({ id }).delete();
  }
}
