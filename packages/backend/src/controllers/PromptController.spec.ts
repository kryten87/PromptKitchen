import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PromptService } from '../services/PromptService';
import { registerPromptRoutes } from './PromptController';
import { Prompt, PromptHistory } from '@prompt-kitchen/shared';

// Mock the services
const mockPromptService = {
  getPromptsForProject: jest.fn(),
  createPrompt: jest.fn(),
  updatePrompt: jest.fn(),
  deletePrompt: jest.fn(),
  getPromptHistory: jest.fn(),
  restorePromptFromHistory: jest.fn(),
} as unknown as PromptService;

// Mock Fastify instance
const mockFastify = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
} as unknown as FastifyInstance;

// Mock reply object
const mockReply = {
  send: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
} as unknown as FastifyReply;

describe('PromptController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    registerPromptRoutes(mockFastify, mockPromptService);
  });

  describe('GET /api/projects/:projectId/prompts', () => {
    it('should return prompts for a project', async () => {
      const handler = (mockFastify.get as jest.Mock).mock.calls.find(
        (call) => call[0] === '/api/projects/:projectId/prompts'
      )[1];
      const prompts: Prompt[] = [
        { id: '1', projectId: '1', name: 'Test', prompt: 'Test prompt', version: 1, createdAt: new Date(), updatedAt: new Date(), modelId: null },
      ];
      (mockPromptService.getPromptsForProject as jest.Mock).mockResolvedValue(prompts);
      const request = { params: { projectId: '1' } } as FastifyRequest<{ Params: { projectId: string } }>;

      await handler(request, mockReply);

      expect(mockPromptService.getPromptsForProject).toHaveBeenCalledWith('1');
      expect(mockReply.send).toHaveBeenCalledWith(prompts);
    });
  });

  describe('POST /api/projects/:projectId/prompts', () => {
    const handler = () => (mockFastify.post as jest.Mock).mock.calls.find(
      (call) => call[0] === '/api/projects/:projectId/prompts'
    )[1];

    it('should create a new prompt with modelId', async () => {
      const newPromptData = { name: 'New', prompt: 'New prompt', modelId: '1' };
      const newPrompt: Prompt = { id: '2', projectId: '1', ...newPromptData, version: 1, createdAt: new Date(), updatedAt: new Date() };
      (mockPromptService.createPrompt as jest.Mock).mockResolvedValue(newPrompt);
      const request = {
        params: { projectId: '1' },
        body: newPromptData,
      } as FastifyRequest<{ Params: { projectId: string }; Body: typeof newPromptData }>;

      await handler()(request, mockReply);

      expect(mockPromptService.createPrompt).toHaveBeenCalledWith({
        name: 'New',
        prompt: 'New prompt',
        modelId: '1',
        projectId: '1',
      });
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(newPrompt);
    });

    it('should create a new prompt with null modelId', async () => {
      const newPromptData = { name: 'New', prompt: 'New prompt', modelId: null };
      const newPrompt: Prompt = { id: '2', projectId: '1', name: 'New', prompt: 'New prompt', modelId: null, version: 1, createdAt: new Date(), updatedAt: new Date() };
      (mockPromptService.createPrompt as jest.Mock).mockResolvedValue(newPrompt);
      const request = {
        params: { projectId: '1' },
        body: newPromptData,
      } as FastifyRequest<{ Params: { projectId: string }; Body: typeof newPromptData }>;
  
      await handler()(request, mockReply);
  
      expect(mockPromptService.createPrompt).toHaveBeenCalledWith({
        name: 'New',
        prompt: 'New prompt',
        modelId: null,
        projectId: '1',
      });
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(newPrompt);
    });

    it('should return 400 on validation error', async () => {
      const request = {
        params: { projectId: '1' },
        body: { name: '' }, // Invalid data
      } as FastifyRequest<{ Params: { projectId: string }; Body: { name: string } }>;

      await handler()(request, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation failed' }));
    });
  });

  describe('PUT /api/prompts/:id', () => {
    const handler = () => (mockFastify.put as jest.Mock).mock.calls.find(
      (call) => call[0] === '/api/prompts/:id'
    )[1];

    it('should update a prompt', async () => {
      const updates = { name: 'Updated', prompt: 'Updated prompt', modelId: '2' };
      const updatedPrompt: Prompt = { id: '1', projectId: '1', ...updates, version: 2, createdAt: new Date(), updatedAt: new Date() };
      (mockPromptService.updatePrompt as jest.Mock).mockResolvedValue(updatedPrompt);
      const request = {
        params: { id: '1' },
        body: updates,
      } as FastifyRequest<{ Params: { id: string }; Body: typeof updates }>;

      await handler()(request, mockReply);

      expect(mockPromptService.updatePrompt).toHaveBeenCalledWith('1', updates);
      expect(mockReply.send).toHaveBeenCalledWith(updatedPrompt);
    });

    it('should return 404 if prompt not found', async () => {
      (mockPromptService.updatePrompt as jest.Mock).mockResolvedValue(null);
      const request = {
        params: { id: '999' },
        body: { name: 'Non-existent', prompt: 'Non-existent prompt' },
      } as FastifyRequest<{ Params: { id: string }; Body: { name: string, prompt: string } }>;

      await handler()(request, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Not found' });
    });
  });

  describe('DELETE /api/prompts/:id', () => {
    it('should delete a prompt', async () => {
      const handler = (mockFastify.delete as jest.Mock).mock.calls.find(
        (call) => call[0] === '/api/prompts/:id'
      )[1];
      (mockPromptService.deletePrompt as jest.Mock).mockResolvedValue(undefined);
      const request = { params: { id: '1' } } as FastifyRequest<{ Params: { id:string } }>;

      await handler(request, mockReply);

      expect(mockPromptService.deletePrompt).toHaveBeenCalledWith('1');
      expect(mockReply.status).toHaveBeenCalledWith(204);
    });
  });

  describe('GET /api/prompts/:id/history', () => {
    it('should return prompt history', async () => {
      const handler = (mockFastify.get as jest.Mock).mock.calls.find(
        (call) => call[0] === '/api/prompts/:id/history'
      )[1];
      const history: PromptHistory[] = [
        { id: '1', promptId: '1', prompt: 'Old prompt', version: 1, createdAt: new Date() },
      ];
      (mockPromptService.getPromptHistory as jest.Mock).mockResolvedValue(history);
      const request = { params: { id: '1' } } as FastifyRequest<{ Params: { id: string } }>;

      await handler(request, mockReply);

      expect(mockPromptService.getPromptHistory).toHaveBeenCalledWith('1');
      expect(mockReply.send).toHaveBeenCalledWith(history);
    });
  });

  describe('POST /api/prompts/:id/restore', () => {
    const handler = () => (mockFastify.post as jest.Mock).mock.calls.find(
      (call) => call[0] === '/api/prompts/:id/restore'
    )[1];

    it('should restore a prompt from history', async () => {
      const restoredPrompt: Prompt = { id: '1', projectId: '1', name: 'Restored', prompt: 'Restored prompt', version: 3, createdAt: new Date(), updatedAt: new Date(), modelId: '1' };
      (mockPromptService.restorePromptFromHistory as jest.Mock).mockResolvedValue(restoredPrompt);
      const request = {
        params: { id: '1' },
        body: { version: 2 },
      } as FastifyRequest<{ Params: { id: string }; Body: { version: number } }>;

      await handler()(request, mockReply);

      expect(mockPromptService.restorePromptFromHistory).toHaveBeenCalledWith('1', 2);
      expect(mockReply.send).toHaveBeenCalledWith(restoredPrompt);
    });

    it('should return 400 for invalid version', async () => {
      const request = {
        params: { id: '1' },
        body: {},
      } as FastifyRequest<{ Params: { id: string }; Body: object }>;

      await handler()(request, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Missing or invalid version' });
    });
  });
});
