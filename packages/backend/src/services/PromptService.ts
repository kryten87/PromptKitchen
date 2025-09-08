import { DatabaseConnector } from '@prompt-kitchen/shared';
import { Prompt, PromptHistory } from '@prompt-kitchen/shared';
import { PromptHistoryRepository, PromptRepository } from '../repositories/PromptRepository';

export class PromptService {
  private readonly promptRepository: PromptRepository;
  private readonly promptHistoryRepository: PromptHistoryRepository;

  constructor(promptRepository: PromptRepository, promptHistoryRepository: PromptHistoryRepository) {
    this.promptRepository = promptRepository;
    this.promptHistoryRepository = promptHistoryRepository;
  }

  static factory(db: DatabaseConnector): PromptService {
    const promptRepository = new PromptRepository(db);
    const promptHistoryRepository = new PromptHistoryRepository(db);
    return new PromptService(promptRepository, promptHistoryRepository);
  }

  async getPromptsForProject(projectId: string): Promise<Prompt[]> {
    return this.promptRepository.getAllByProjectId(projectId);
  }

  async getPromptById(id: string): Promise<Prompt | null> {
    return this.promptRepository.getById(id);
  }

  async createPrompt(prompt: Omit<Prompt, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<Prompt> {
    const created = await this.promptRepository.create({ ...prompt, version: 1 });
    await this.promptHistoryRepository.create({
      promptId: created.id,
      prompt: created.prompt,
      version: created.version,
    });
    return created;
  }

  async updatePrompt(id: string, updates: Partial<Omit<Prompt, 'id' | 'projectId' | 'createdAt'>>): Promise<Prompt | null> {
    const current = await this.promptRepository.getById(id);
    if (!current) return null;
    // Increment version if prompt text is updated
    let newVersion = current.version;
    if (updates.prompt && updates.prompt !== current.prompt) {
      newVersion = current.version + 1;
      updates.version = newVersion;
    }
    const updated = await this.promptRepository.update(id, updates);
    if (updated && updates.prompt && updates.prompt !== current.prompt) {
      await this.promptHistoryRepository.create({
        promptId: updated.id,
        prompt: updated.prompt,
        version: updated.version,
      });
    }
    return updated;
  }

  async deletePrompt(id: string): Promise<void> {
    await this.promptRepository.delete(id);
  }

  async getPromptHistory(promptId: string): Promise<PromptHistory[]> {
    return this.promptHistoryRepository.getAllByPromptId(promptId);
  }

  async restorePromptFromHistory(promptId: string, version: number): Promise<Prompt | null> {
    const history = await this.promptHistoryRepository.getAllByPromptId(promptId);
    const entry = history.find(h => h.version === version);
    if (!entry) return null;
    const prompt = await this.promptRepository.getById(promptId);
    if (!prompt) return null;
    // Copy the historical prompt text to the current prompt, increment version
    const newVersion = prompt.version + 1;
    const updated = await this.promptRepository.update(promptId, { prompt: entry.prompt, version: newVersion });
    if (updated) {
      await this.promptHistoryRepository.create({
        promptId: updated.id,
        prompt: updated.prompt,
        version: updated.version,
      });
    }
    return updated;
  }
}
