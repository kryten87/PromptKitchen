import { DatabaseConnector, runMigrations } from '@prompt-kitchen/shared';
import { Prompt } from '@prompt-kitchen/shared';
import { PromptRepository } from '../repositories/PromptRepository';
import { ModelRepository } from './ModelRepository';

describe('PromptRepository', () => {
  let db: DatabaseConnector;
  let promptRepository: PromptRepository;
  let modelRepository: ModelRepository;
  let projectId: string;
  let modelId: string;

  beforeAll(async () => {
    db = new DatabaseConnector({ dbFile: ':memory:' });
    await runMigrations(db);
    promptRepository = new PromptRepository(db);
    modelRepository = new ModelRepository(db);
    projectId = 'proj1';
    await db.knex('projects').insert({
      id: projectId,
      user_id: 'user1',
      name: 'Test Project',
      description: 'desc',
      created_at: new Date(),
      updated_at: new Date(),
    });
    const model = await modelRepository.create('gpt-4');
    modelId = model.id;
  });

  afterAll(async () => {
    await db.destroy();
  });

  function promptInput(overrides: Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>> = {}) {
    return {
      projectId,
      modelId: null,
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
    expect(prompt.modelId).toBeNull();
    expect(prompt.modelName).toBeUndefined();
  });

  it('should create a prompt with a model', async () => {
    const prompt = await promptRepository.create(promptInput({ modelId }));
    expect(prompt.id).toBeDefined();
    expect(prompt.modelId).toBe(modelId);
    expect(prompt.modelName).toBe('gpt-4');
  });

  it('should get a prompt by id', async () => {
    const created = await promptRepository.create(promptInput({ name: 'Prompt 2', prompt: 'Prompt 2 text', modelId }));
    const found = await promptRepository.getById(created.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe('Prompt 2');
    expect(found?.modelId).toBe(modelId);
    expect(found?.modelName).toBe('gpt-4');
  });

  it('should get all prompts for a project', async () => {
    await promptRepository.create(promptInput({ name: 'Prompt 3', prompt: 'P3', modelId }));
    const prompts = await promptRepository.getAllByProjectId(projectId);
    expect(prompts.length).toBeGreaterThanOrEqual(2);
    const prompt = prompts.find(p => p.name === 'Prompt 3');
    expect(prompt).toBeDefined();
    expect(prompt?.modelId).toBe(modelId);
    expect(prompt?.modelName).toBe('gpt-4');
  });

  it('should update a prompt', async () => {
    const created = await promptRepository.create(promptInput({ name: 'Prompt 4', prompt: 'P4' }));
    const updated = await promptRepository.update(created.id, { name: 'Prompt 4 updated', prompt: 'P4 new' });
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Prompt 4 updated');
    expect(updated?.prompt).toBe('P4 new');
  });

  it('should update a prompt modelId', async () => {
    const created = await promptRepository.create(promptInput({ name: 'Prompt 4.1', prompt: 'P4.1' }));
    expect(created.modelId).toBeNull();

    const updated = await promptRepository.update(created.id, { modelId });
    expect(updated).not.toBeNull();
    expect(updated?.modelId).toBe(modelId);
    expect(updated?.modelName).toBe('gpt-4');

    const updated2 = await promptRepository.update(created.id, { modelId: null });
    expect(updated2).not.toBeNull();
    expect(updated2?.modelId).toBeNull();
    expect(updated2?.modelName).toBeUndefined();
  });

  it('should delete a prompt', async () => {
    const created = await promptRepository.create(promptInput({ name: 'Prompt 5', prompt: 'P5' }));
    await promptRepository.delete(created.id);
    const found = await promptRepository.getById(created.id);
    expect(found).toBeNull();
  });
});
