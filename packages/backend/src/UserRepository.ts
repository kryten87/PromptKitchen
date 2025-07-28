import type { User } from '@prompt-kitchen/shared/src/dtos';
import type { Knex } from 'knex';

export class UserRepository {
  private knex: Knex;

  constructor(db: { knex: Knex }) {
    this.knex = db.knex;
  }

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const dbUser = {
      ...user,
      created_at: now,
      updated_at: now,
    };
    await this.knex('users').insert(dbUser);
    return this.findById(user.id) as Promise<User>;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.knex('users').where({ id }).first();
    return row ? this.toUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.knex('users').where({ email }).first();
    return row ? this.toUser(row) : null;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    const now = new Date();
    await this.knex('users').where({ id }).update({ ...updates, updated_at: now });
    return this.findById(id);
  }

  private toUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatarUrl || row.avatar_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
