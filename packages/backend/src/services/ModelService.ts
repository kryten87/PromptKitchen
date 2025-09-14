import { ModelRepository } from '../repositories/ModelRepository';
import { LLMService } from './LLMService';

/**
 * TEMPORARY: Augment LLMService with listModels for typechecking until Task 2.2 is complete.
 */
declare module './LLMService' {
  interface LLMService {
    listModels(): Promise<string[]>;
  }
}

export class ModelService {
  private readonly modelRepository: ModelRepository;
  private readonly llmService: LLMService;

  constructor(modelRepository: ModelRepository, llmService: LLMService) {
    this.modelRepository = modelRepository;
    this.llmService = llmService;
  }

  /**
   * Fetches the list of model names from the LLM provider and upserts them in the database.
   */
  async refreshModels(): Promise<void> {
    // This method assumes llmService.listModels() returns Promise<string[]>
    const modelNames = await this.llmService.listModels();
    await this.modelRepository.upsert(modelNames);
  }
}
