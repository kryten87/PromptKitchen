import type { User } from '@prompt-kitchen/shared/src/dtos';
import { UserRepository } from './UserRepository';
import { promptKitchenDb } from './db/db';

describe('UserRepository', () => {
  const repo = new UserRepository();
  const testUser: Omit<User, 'createdAt' | 'updatedAt'> = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'http://example.com/avatar.png',
  };

  afterAll(async () => {
    await promptKitchenDb('users').where({ id: testUser.id }).del();
    await promptKitchenDb.destroy();
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
