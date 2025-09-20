import { DatabaseConnector, runMigrations } from '@prompt-kitchen/shared';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ProjectService } from '../services/ProjectService';

describe('ProjectService', () => {
  let db: DatabaseConnector;
  let repo: ProjectRepository;
  let service: ProjectService;

  beforeAll(async () => {
    db = new DatabaseConnector({ dbFile: ':memory:' });
    await runMigrations(db);
    repo = new ProjectRepository(db);
    service = new ProjectService(repo);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should create and fetch a project', async () => {
    const created = await service.createProject({ userId: 'u1', name: 'Proj', description: 'desc' });
    expect(created.name).toBe('Proj');
    const fetched = await service.getProjectById(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should get projects for a user', async () => {
    await service.createProject({ userId: 'u2', name: 'A', description: '' });
    await service.createProject({ userId: 'u2', name: 'B', description: '' });
    const projects = await service.getProjectsForUser('u2');
    expect(projects.length).toBeGreaterThanOrEqual(2);
  });

  it('should update a project', async () => {
    const created = await service.createProject({ userId: 'u3', name: 'Old', description: '' });
    const updated = await service.updateProject(created.id, { name: 'New' });
    expect(updated?.name).toBe('New');
  });

  it('should delete a project', async () => {
    const created = await service.createProject({ userId: 'u4', name: 'Del', description: '' });
    await service.deleteProject(created.id);
    const fetched = await service.getProjectById(created.id);
    expect(fetched).toBeNull();
  });

  it('should not update a non-existent project', async () => {
    const updated = await service.updateProject('nonexistent', { name: 'X' });
    expect(updated).toBeNull();
  });

  it('should return null for non-existent project', async () => {
    const fetched = await service.getProjectById('doesnotexist');
    expect(fetched).toBeNull();
  });
});
