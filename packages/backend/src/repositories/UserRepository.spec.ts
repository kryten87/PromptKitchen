import { DatabaseConnector, runMigrations } from '@prompt-kitchen/shared';
import type { User } from '@prompt-kitchen/shared';
import { UserRepository } from '../repositories/UserRepository';

describe('UserRepository', () => {
  let db: DatabaseConnector;
  let repo: UserRepository;
  const testUser: Omit<User, 'createdAt' | 'updatedAt'> = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'http://example.com/avatar.png',
  };

  beforeAll(async () => {
    db = new DatabaseConnector({ dbFile: ':memory:' });
    await runMigrations(db);
    repo = new UserRepository(db);
  });

  afterAll(async () => {
    await db.knex('users').where({ id: testUser.id }).del();
    await db.destroy();
  });

  it('should create and find a user by id', async () => {
    await repo.createUser(testUser);
    const found = await repo.findById(testUser.id);
    expect(found).not.toBeNull();
    expect(found?.email).toBe(testUser.email);
  });

  it('should find a user by email', async () => {
    const found = await repo.findByEmail(testUser.email);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(testUser.id);
  });

  it('should update a user', async () => {
    await repo.updateUser(testUser.id, { name: 'Updated Name' });
    const found = await repo.findById(testUser.id);
    expect(found?.name).toBe('Updated Name');
  });
});
