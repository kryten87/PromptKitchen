import { FastifyInstance } from 'fastify';
import { TestSuiteService } from './TestSuiteService';
import { DatabaseConnector } from './db/db';

export async function registerTestSuiteRoutes(fastify: FastifyInstance, db: DatabaseConnector) {
  const service = TestSuiteService.factory(db);

  // Test Suite CRUD
  fastify.get('/api/prompts/:promptId/test-suites', async (request, reply) => {
    const { promptId } = request.params as any;
    const suites = await service.getTestSuitesByPromptId(promptId);
    reply.send(suites);
  });

  fastify.post('/api/prompts/:promptId/test-suites', async (request, reply) => {
    const { promptId } = request.params as any;
    const { name } = request.body as any;
    const suite = await service.createTestSuite({ promptId, name });
    reply.code(201).send(suite);
  });

  fastify.put('/api/test-suites/:id', async (request, reply) => {
    const { id } = request.params as any;
    const updates = request.body as any;
    const updated = await service.updateTestSuite(id, updates);
    reply.send(updated);
  });

  fastify.delete('/api/test-suites/:id', async (request, reply) => {
    const { id } = request.params as any;
    await service.deleteTestSuite(id);
    reply.code(204).send();
  });

  // Test Case CRUD
  fastify.get('/api/test-suites/:testSuiteId/test-cases', async (request, reply) => {
    const { testSuiteId } = request.params as any;
    const cases = await service.getTestCasesBySuiteId(testSuiteId);
    reply.send(cases);
  });

  fastify.post('/api/test-suites/:testSuiteId/test-cases', async (request, reply) => {
    const { testSuiteId } = request.params as any;
    const { inputs, expectedOutput, runMode } = request.body as any;
    const testCase = await service.createTestCase({ testSuiteId, inputs, expectedOutput, runMode });
    reply.code(201).send(testCase);
  });

  fastify.put('/api/test-cases/:id', async (request, reply) => {
    const { id } = request.params as any;
    const updates = request.body as any;
    const updated = await service.updateTestCase(id, updates);
    reply.send(updated);
  });

  fastify.delete('/api/test-cases/:id', async (request, reply) => {
    const { id } = request.params as any;
    await service.deleteTestCase(id);
    reply.code(204).send();
  });
}
