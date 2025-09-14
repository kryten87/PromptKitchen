import { ModelRepository } from '../repositories/ModelRepository';
import { LLMService } from './LLMService';
import { ModelService } from './ModelService';

describe('ModelService', () => {
  let modelRepository: ModelRepository;
  let llmService: LLMService;
  let modelService: ModelService;

  beforeEach(() => {
    // Create mock instances
    modelRepository = {
      upsert: jest.fn(),
    } as unknown as ModelRepository;

    llmService = {
      listModels: jest.fn(),
    } as unknown as LLMService;

    // Instantiate the service with mocks
    modelService = new ModelService(modelRepository, llmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshModels', () => {
    it('should fetch models from LLMService and upsert them via ModelRepository', async () => {
      // Arrange
      const fakeModels = ['gpt-4', 'gpt-3.5-turbo'];
      (llmService.listModels as jest.Mock).mockResolvedValue(fakeModels);

      // Act
      await modelService.refreshModels();

      // Assert
      expect(llmService.listModels).toHaveBeenCalledTimes(1);
      expect(modelRepository.upsert).toHaveBeenCalledTimes(1);
      expect(modelRepository.upsert).toHaveBeenCalledWith(fakeModels);
    });

    it('should handle empty list of models', async () => {
      // Arrange
      const emptyModelList: string[] = [];
      (llmService.listModels as jest.Mock).mockResolvedValue(emptyModelList);

      // Act
      await modelService.refreshModels();

      // Assert
      expect(llmService.listModels).toHaveBeenCalledTimes(1);
      expect(modelRepository.upsert).toHaveBeenCalledTimes(1);
      expect(modelRepository.upsert).toHaveBeenCalledWith(emptyModelList);
    });

    it('should propagate errors from llmService.listModels', async () => {
      // Arrange
      const error = new Error('Failed to fetch models');
      (llmService.listModels as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(modelService.refreshModels()).rejects.toThrow(error);
      expect(modelRepository.upsert).not.toHaveBeenCalled();
    });

    it('should propagate errors from modelRepository.upsert', async () => {
      // Arrange
      const fakeModels = ['gpt-4'];
      const error = new Error('Database error');
      (llmService.listModels as jest.Mock).mockResolvedValue(fakeModels);
      (modelRepository.upsert as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(modelService.refreshModels()).rejects.toThrow(error);
      expect(llmService.listModels).toHaveBeenCalledTimes(1);
      expect(modelRepository.upsert).toHaveBeenCalledWith(fakeModels);
    });
  });
});
