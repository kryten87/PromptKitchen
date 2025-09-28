import { definePromptSchema } from '@prompt-kitchen/shared';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as yup from 'yup';
import { PromptService } from '../services/PromptService';
import { handle404, handleError } from '../utils/handleError';

interface ProjectIdParams { projectId: string; }
interface PromptIdParams { id: string; }
interface PromptHistoryIdParams { id: string; }
interface RestoreBody { version: number; }

export async function registerPromptRoutes(fastify: FastifyInstance, promptService: PromptService) {
  // GET /api/projects/:projectId/prompts
  fastify.get('/api/projects/:projectId/prompts', async (request: FastifyRequest<{ Params: ProjectIdParams }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const prompts = await promptService.getPromptsForProject(projectId);
    return reply.send(prompts);
  });

  // POST /api/projects/:projectId/prompts
  fastify.post('/api/projects/:projectId/prompts', async (request: FastifyRequest<{ Params: ProjectIdParams }>, reply: FastifyReply) => {
    try {
      const schema = definePromptSchema().omit(['id', 'projectId', 'version', 'createdAt', 'updatedAt']);
      const data = await schema.validate(request.body, { abortEarly: false, stripUnknown: true });
      const { projectId } = request.params;
      const prompt = await promptService.createPrompt({ ...data, projectId, modelId: data.modelId ?? null });
      return reply.status(201).send(prompt);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return handleError(reply, 400, 'Validation failed', { details: err.errors });
      }
      return handleError(reply, 500, err as Error);
    }
  });

  // PUT /api/prompts/:id
  fastify.put('/api/prompts/:id', async (request: FastifyRequest<{ Params: PromptIdParams }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const schema = definePromptSchema().omit(['id', 'projectId', 'version', 'createdAt', 'updatedAt']);
      const updates = await schema.validate(request.body, { abortEarly: false, stripUnknown: true });
      const updated = await promptService.updatePrompt(id, updates);
      if (!updated) {
        return handle404(reply, 'Prompt');
      }
      return reply.send(updated);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return handleError(reply, 400, 'Validation failed', { details: err.errors });
      }
      return handleError(reply, 500, err as Error);
    }
  });

  // DELETE /api/prompts/:id
  fastify.delete('/api/prompts/:id', async (request: FastifyRequest<{ Params: PromptIdParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    await promptService.deletePrompt(id);
    return reply.status(204).send();
  });

  // GET /api/prompts/:id/history
  fastify.get('/api/prompts/:id/history', async (request: FastifyRequest<{ Params: PromptIdParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    const history = await promptService.getPromptHistory(id);
    return reply.send(history);
  });

  // GET /api/prompt-history/:id
  fastify.get('/api/prompt-history/:id', async (request: FastifyRequest<{ Params: PromptHistoryIdParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    const history = await promptService.getPromptHistoryById(id);
    if (!history) {
      return handle404(reply, 'Prompt history');
    }
    return reply.send(history);
  });

  // POST /api/prompts/:id/restore
  fastify.post('/api/prompts/:id/restore', async (request: FastifyRequest<{ Params: PromptIdParams; Body: RestoreBody }>, reply: FastifyReply) => {
    const { id } = request.params;
    const { version } = request.body;
    if (typeof version !== 'number') {
      return reply.status(400).send({ error: 'Missing or invalid version' });
    }
    const restored = await promptService.restorePromptFromHistory(id, version);
    if (!restored) {
      return handle404(reply, 'Prompt or version');
    }
    return reply.send(restored);
  });
}
