import type { DatabaseConnector } from '@prompt-kitchen/shared';
import { Prompt, PromptHistory } from '@prompt-kitchen/shared';
import type { PromptHistoryRepository, PromptRepository } from '../repositories/PromptRepository';
import { PromptService } from '../services/PromptService';

describe('PromptService (simple mocks)', () => {
  let promptRepository: jest.Mocked<PromptRepository>;
  let promptHistoryRepository: jest.Mocked<PromptHistoryRepository>;
  let promptService: PromptService;

  beforeEach(() => {
    promptRepository = {
      getAllByProjectId: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<PromptRepository>;
    promptHistoryRepository = {
      getAllByPromptId: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<PromptHistoryRepository>;
    promptService = new PromptService(promptRepository, promptHistoryRepository);
  });

  it('should create a prompt and add to history', async () => {
    const prompt: Prompt = {
      id: 'id1', projectId: 'proj1', name: 'Prompt', prompt: 'Prompt text', version: 1, createdAt: new Date(), updatedAt: new Date()
    };
    promptRepository.create.mockResolvedValue(prompt);
    promptHistoryRepository.create.mockResolvedValue({} as PromptHistory);
    const result = await promptService.createPrompt({ projectId: 'proj1', name: 'Prompt', prompt: 'Prompt text' });
    expect(result).toBe(prompt);
    expect(promptRepository.create).toHaveBeenCalledWith({ projectId: 'proj1', name: 'Prompt', prompt: 'Prompt text', version: 1 });
    expect(promptHistoryRepository.create).toHaveBeenCalledWith({ promptId: 'id1', prompt: 'Prompt text', version: 1 });
  });

  it('should update a prompt and create a new history entry if prompt text changes', async () => {
    const prompt: Prompt = { id: 'id2', projectId: 'proj1', name: 'Prompt', prompt: 'Old', version: 1, createdAt: new Date(), updatedAt: new Date() };
    const updatedPrompt: Prompt = { ...prompt, prompt: 'New', version: 2 };
    promptRepository.getById.mockResolvedValue(prompt);
    promptRepository.update.mockResolvedValue(updatedPrompt);
    promptHistoryRepository.create.mockResolvedValue({} as PromptHistory);
    const result = await promptService.updatePrompt('id2', { prompt: 'New' });
    expect(result).toBe(updatedPrompt);
    expect(promptRepository.update).toHaveBeenCalledWith('id2', { prompt: 'New', version: 2 });
    expect(promptHistoryRepository.create).toHaveBeenCalledWith({ promptId: 'id2', prompt: 'New', version: 2 });
  });

  it('should not create a new history entry if prompt text does not change', async () => {
    const prompt: Prompt = { id: 'id3', projectId: 'proj1', name: 'Prompt', prompt: 'Same', version: 1, createdAt: new Date(), updatedAt: new Date() };
    const updatedPrompt: Prompt = { ...prompt, name: 'Prompt2' };
    promptRepository.getById.mockResolvedValue(prompt);
    promptRepository.update.mockResolvedValue(updatedPrompt);
    const result = await promptService.updatePrompt('id3', { name: 'Prompt2' });
    expect(result).toBe(updatedPrompt);
    expect(promptRepository.update).toHaveBeenCalledWith('id3', { name: 'Prompt2' });
    expect(promptHistoryRepository.create).toHaveBeenCalledTimes(0);
  });

  it('should restore a prompt from history', async () => {
    const prompt: Prompt = { id: 'id4', projectId: 'proj1', name: 'Prompt', prompt: 'Third', version: 3, createdAt: new Date(), updatedAt: new Date() };
    const history: PromptHistory[] = [
      { id: 'h1', promptId: 'id4', prompt: 'First', version: 1, createdAt: new Date() },
      { id: 'h2', promptId: 'id4', prompt: 'Second', version: 2, createdAt: new Date() },
      { id: 'h3', promptId: 'id4', prompt: 'Third', version: 3, createdAt: new Date() },
    ];
    const updatedPrompt: Prompt = { ...prompt, prompt: 'First', version: 4 };
    promptHistoryRepository.getAllByPromptId.mockResolvedValue(history);
    promptRepository.getById.mockResolvedValue(prompt);
    promptRepository.update.mockResolvedValue(updatedPrompt);
    promptHistoryRepository.create.mockResolvedValue({} as PromptHistory);
    const result = await promptService.restorePromptFromHistory('id4', 1);
    expect(result).toBe(updatedPrompt);
    expect(promptRepository.update).toHaveBeenCalledWith('id4', { prompt: 'First', version: 4 });
    expect(promptHistoryRepository.create).toHaveBeenCalledWith({ promptId: 'id4', prompt: 'First', version: 4 });
  });

  it('should get all prompts for a project', async () => {
    const prompts: Prompt[] = [
      { id: 'id5', projectId: 'proj1', name: 'Prompt1', prompt: 'A', version: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 'id6', projectId: 'proj1', name: 'Prompt2', prompt: 'B', version: 1, createdAt: new Date(), updatedAt: new Date() },
    ];
    promptRepository.getAllByProjectId.mockResolvedValue(prompts);
    const result = await promptService.getPromptsForProject('proj1');
    expect(result).toBe(prompts);
    expect(promptRepository.getAllByProjectId).toHaveBeenCalledWith('proj1');
  });

  it('should delete a prompt', async () => {
    promptRepository.delete.mockResolvedValue(undefined);
    await promptService.deletePrompt('id7');
    expect(promptRepository.delete).toHaveBeenCalledWith('id7');
  });
});

describe('PromptService.factory', () => {
  it('should create a PromptService with repositories', () => {
    const db = { knex: {} } as unknown;
    const service = PromptService.factory(db as unknown as DatabaseConnector);
    expect(service).toBeInstanceOf(PromptService);
    expect((service as unknown as { promptRepository: unknown }).promptRepository).toBeDefined();
    expect((service as unknown as { promptHistoryRepository: unknown }).promptHistoryRepository).toBeDefined();
  });
});
