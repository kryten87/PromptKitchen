import { defineProjectSchema } from '@prompt-kitchen/shared/src/validation';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as yup from 'yup';
import { ProjectService } from './ProjectService';

export async function registerProjectRoutes(fastify: FastifyInstance, projectService: ProjectService) {
  // GET /api/projects
  fastify.get('/api/projects', async (request: FastifyRequest, reply: FastifyReply) => {
    // TODO: get userId from session/auth
    const userId = (request as any).user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const projects = await projectService.getProjectsForUser(userId);
    return reply.send(projects);
  });

  // POST /api/projects
  fastify.post('/api/projects', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const schema = defineProjectSchema().omit(['id', 'createdAt', 'updatedAt']);
      const data = await schema.validate(request.body, { abortEarly: false, stripUnknown: true });
      // TODO: get userId from session/auth
      const userId = (request as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      const project = await projectService.createProject({ ...data, userId });
      return reply.status(201).send(project);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return reply.status(400).send({ error: 'Validation failed', details: err.errors });
      }
      throw err;
    }
  });

  // GET /api/projects/:id
  fastify.get('/api/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    const project = await projectService.getProjectById(id);
    if (!project) {
      return reply.status(404).send({ error: 'Not found' });
    }
    return reply.send(project);
  });

  // PUT /api/projects/:id
  fastify.put('/api/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const schema = defineProjectSchema().omit(['id', 'userId', 'createdAt', 'updatedAt']);
      const updates = await schema.validate(request.body, { abortEarly: false, stripUnknown: true });
      const updated = await projectService.updateProject(id, updates);
      if (!updated) {
        return reply.status(404).send({ error: 'Not found' });
      }
      return reply.send(updated);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return reply.status(400).send({ error: 'Validation failed', details: err.errors });
      }
      throw err;
    }
  });

  // DELETE /api/projects/:id
  fastify.delete('/api/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    await projectService.deleteProject(id);
    return reply.status(204).send();
  });
}