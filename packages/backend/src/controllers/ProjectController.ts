import { defineProjectSchema } from '@prompt-kitchen/shared';
import { FastifyInstance } from 'fastify';
import * as yup from 'yup';
import { createAuthMiddleware } from '../authMiddleware';
import { ProjectService } from '../services/ProjectService';
import type { JwtPayload, UserService } from '../services/UserService';
import { handle404, handleError } from '../utils/handleError';

interface ProjectIdParams {
  id: string;
}

export async function registerProjectRoutes(fastify: FastifyInstance, projectService: ProjectService, userService: UserService) {
  const authMiddleware = createAuthMiddleware(userService);

  // GET /api/projects
  fastify.get(
    '/api/projects',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const userId = (request as { user?: JwtPayload }).user?.id;
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      const projects = await projectService.getProjectsForUser(userId);
      return reply.send(projects);
    },
  );

  // POST /api/projects
  fastify.post(
    '/api/projects',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const schema = defineProjectSchema().omit(['id', 'userId', 'createdAt', 'updatedAt']);
        const data = await schema.validate(request.body, { abortEarly: false, stripUnknown: true });
        const userId = (request as { user?: JwtPayload }).user?.id;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
        const project = await projectService.createProject({ ...data, userId });
        return reply.status(201).send(project);
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          return handleError(reply, 400, 'Validation failed', { details: err.errors });
        }
        throw err;
      }
    },
  );

  // GET /api/projects/:id
  fastify.get<{ Params: ProjectIdParams }>(
    '/api/projects/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const { id } = request.params;
      const project = await projectService.getProjectById(id);
      if (!project) {
        return handle404(reply, 'Project');
      }
      return reply.send(project);
    },
  );

  // PUT /api/projects/:id
  fastify.put<{ Params: ProjectIdParams }>(
    '/api/projects/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const schema = defineProjectSchema().omit(['id', 'userId', 'createdAt', 'updatedAt']);
        const updates = await schema.validate(request.body, { abortEarly: false, stripUnknown: true });
        const updated = await projectService.updateProject(id, updates);
        if (!updated) {
          return handle404(reply, 'Project');
        }
        return reply.send(updated);
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          return reply.status(400).send({ error: 'Validation failed', details: err.errors });
        }
        throw err;
      }
    },
  );

  // DELETE /api/projects/:id
  fastify.delete<{ Params: ProjectIdParams }>(
    '/api/projects/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const { id } = request.params;
      await projectService.deleteProject(id);
      return reply.status(204).send();
    },
  );
}