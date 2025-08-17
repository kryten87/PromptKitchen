import { DatabaseConnector } from '@prompt-kitchen/shared';
import { Prompt } from '@prompt-kitchen/shared/src/dtos';
import { runMigrations } from '../db/migrate';
import { PromptRepository } from '../repositories/PromptRepository';

describe('PromptRepository', () => {
  let db: DatabaseConnector;
  let promptRepository: PromptRepository;
  let projectId: string;

  beforeAll(async () => {
    db = new DatabaseConnector({ filename: ':memory:' });
    await runMigrations(db);
    promptRepository = new PromptRepository(db);
    projectId = 'proj1';
    await db.knex('projects').insert({
      id: projectId,
      user_id: 'user1',
      name: 'Test Project',
      description: 'desc',
      created_at: new Date(),
      updated_at: new Date(),
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  function promptInput(overrides: Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>> = {}) {
    return {
      projectId,
      name: 'Prompt',
      prompt: 'Prompt text',
      version: 1,
      ...overrides,
    };
  }

  it('should create a prompt', async () => {
    const prompt = await promptRepository.create(promptInput());
    expect(prompt.id).toBeDefined();
    expect(prompt.projectId).toBe(projectId);
    expect(prompt.name).toBe('Prompt');
    expect(prompt.prompt).toBe('Prompt text');
    expect(prompt.version).toBe(1);
  });

  it('should get a prompt by id', async () => {
    const created = await promptRepository.create(promptInput({ name: 'Prompt 2', prompt: 'Prompt 2 text' }));
    const found = await promptRepository.getById(created.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe('Prompt 2');
  });

  it('should get all prompts for a project', async () => {
    await promptRepository.create(promptInput({ name: 'Prompt 3', prompt: 'P3' }));
    const prompts = await promptRepository.getAllByProjectId(projectId);
    expect(prompts.length).toBeGreaterThanOrEqual(2);
    expect(prompts.some(p => p.name === 'Prompt 3')).toBe(true);
  });

  it('should update a prompt', async () => {
    const created = await promptRepository.create(promptInput({ name: 'Prompt 4', prompt: 'P4' }));
    const updated = await promptRepository.update(created.id, { name: 'Prompt 4 updated', prompt: 'P4 new' });
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Prompt 4 updated');
    expect(updated?.prompt).toBe('P4 new');
  });

  it('should delete a prompt', async () => {
    const created = await promptRepository.create(promptInput({ name: 'Prompt 5', prompt: 'P5' }));
    await promptRepository.delete(created.id);
    const found = await promptRepository.getById(created.id);
    expect(found).toBeNull();
  });
});
