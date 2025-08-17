import { DatabaseConnector } from '@prompt-kitchen/shared';
import { runMigrations } from '../db/migrate';
import { ProjectRepository } from '../repositories/ProjectRepository';

describe('ProjectRepository', () => {
  let db: DatabaseConnector;
  let repo: ProjectRepository;

  beforeAll(async () => {
    db = new DatabaseConnector({ filename: ':memory:' });
    await runMigrations(db);
    repo = new ProjectRepository(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should create and fetch a project', async () => {
    const projectData = {
      userId: 'user1',
      name: 'Test Project',
      description: 'desc',
    };
    const created = await repo.create(projectData);
    expect(created).toMatchObject({
      userId: 'user1',
      name: 'Test Project',
      description: 'desc',
    });
    const fetched = await repo.getById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(created.id);
  });

  it('should update a project', async () => {
    const project = await repo.create({ userId: 'user2', name: 'P2', description: '' });
    const updated = await repo.update(project.id, { name: 'P2-updated' });
    expect(updated?.name).toBe('P2-updated');
  });

  it('should delete a project', async () => {
    const project = await repo.create({ userId: 'user3', name: 'P3', description: '' });
    await repo.delete(project.id);
    const fetched = await repo.getById(project.id);
    expect(fetched).toBeNull();
  });
});
