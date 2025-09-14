import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ModelService } from '../services/ModelService';
import { ModelRepository } from '../repositories/ModelRepository';

export function registerModelRoutes(
  fastify: FastifyInstance,
  modelService: ModelService,
  modelRepository: ModelRepository
) {
  // GET /api/models: Return all active models
  fastify.get('/api/models', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const models = await modelRepository.findAll();
      // Only return active models
      const activeModels = models.filter((m) => m.isActive);
      return reply.send(activeModels);
    } catch {
      return reply.status(500).send({ error: 'Failed to fetch models' });
    }
  });

  // POST /api/models/refresh: Refresh models from OpenAI
  fastify.post('/api/models/refresh', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      await modelService.refreshModels();
      return reply.send({ success: true });
    } catch {
      return reply.status(500).send({ error: 'Failed to refresh models' });
    }
  });
}
