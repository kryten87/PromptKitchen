import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ModelService } from '../services/ModelService';
import { ModelRepository } from '../repositories/ModelRepository';
import { registerModelRoutes } from './ModelController';
import { Model } from '@prompt-kitchen/shared';

// Mock the services
const mockModelService = {
  refreshModels: jest.fn(),
} as unknown as ModelService;

const mockModelRepository = {
  findAll: jest.fn(),
} as unknown as ModelRepository;

// Mock Fastify instance
const mockFastify = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  addHook: jest.fn(),
  register: jest.fn(),
} as unknown as FastifyInstance;

// Mock reply object
const mockReply = {
  send: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
} as unknown as FastifyReply;

describe('ModelController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    registerModelRoutes(mockFastify, mockModelService, mockModelRepository);
  });

  describe('GET /api/models', () => {
    it('should return a list of active models', async () => {
      const handler = (mockFastify.get as jest.Mock).mock.calls.find(
        (call) => call[0] === '/api/models'
      )[1];
      const models: Model[] = [
        { id: '1', name: 'model-1', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'model-2', isActive: false, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'model-3', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      (mockModelRepository.findAll as jest.Mock).mockResolvedValue(models);

      await handler({} as FastifyRequest, mockReply);

      expect(mockModelRepository.findAll).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith([
        { id: '1', name: 'model-1', isActive: true, createdAt: models[0].createdAt, updatedAt: models[0].updatedAt },
        { id: '3', name: 'model-3', isActive: true, createdAt: models[2].createdAt, updatedAt: models[2].updatedAt },
      ]);
    });

    it('should return an empty list if there are no active models', async () => {
      const handler = (mockFastify.get as jest.Mock).mock.calls.find(
        (call) => call[0] === '/api/models'
      )[1];
      const models: Model[] = [
        { id: '1', name: 'model-1', isActive: false, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'model-2', isActive: false, createdAt: new Date(), updatedAt: new Date() },
      ];
      (mockModelRepository.findAll as jest.Mock).mockResolvedValue(models);
  
      await handler({} as FastifyRequest, mockReply);
  
      expect(mockModelRepository.findAll).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith([]);
    });

    it('should return a 500 error if fetching models fails', async () => {
      const handler = (mockFastify.get as jest.Mock).mock.calls.find(
        (call) => call[0] === '/api/models'
      )[1];
      (mockModelRepository.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      await handler({} as FastifyRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Failed to fetch models' });
    });
  });

  describe('POST /api/models/refresh', () => {
    it('should call modelService.refreshModels and return success', async () => {
      const handler = (mockFastify.post as jest.Mock).mock.calls.find(
        (call) => call[0] === '/api/models/refresh'
      )[1];
      (mockModelService.refreshModels as jest.Mock).mockResolvedValue(undefined);

      await handler({} as FastifyRequest, mockReply);

      expect(mockModelService.refreshModels).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith({ success: true });
    });

    it('should return a 500 error if refreshing models fails', async () => {
      const handler = (mockFastify.post as jest.Mock).mock.calls.find(
        (call) => call[0] === '/api/models/refresh'
      )[1];
      (mockModelService.refreshModels as jest.Mock).mockRejectedValue(new Error('Service error'));

      await handler({} as FastifyRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Failed to refresh models' });
    });
  });
});
