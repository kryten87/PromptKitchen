import { FastifyInstance } from 'fastify';
import { DatabaseConnector } from './db/db';
import { ExecutionService } from './ExecutionService';
import { LLMService } from './LLMService';
import { TestSuiteService } from './TestSuiteService';

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

  // --- Test Suite Execution Endpoints ---
  const llmService = new LLMService({ apiKey: process.env.OPENAI_API_KEY || 'sk-test' });
  const executionService = new ExecutionService({
    llmService,
    testCaseRepo: service['testCaseRepo'],
    db,
  });

  fastify.post('/api/test-suites/:id/run', async (request, reply) => {
    const { id } = request.params as any;
    // For now, fetch prompt text from test suite's prompt (simplified)
    const suite = await service.getTestSuiteById(id);
    if (!suite) {
      return reply.status(404).send({ error: 'Test suite not found' });
    }
    // Fetch prompt text (assume promptId exists)
    const promptRow = await db.knex('prompts').where({ id: suite.promptId }).first();
    if (!promptRow) {
      return reply.status(404).send({ error: 'Prompt not found' });
    }
    // Fetch latest prompt history for this prompt
    const promptHistoryRow = await db.knex('prompt_history').where({ prompt_id: suite.promptId }).orderBy('version', 'desc').first();
    if (!promptHistoryRow) {
      return reply.status(404).send({ error: 'Prompt history not found' });
    }
    const runId = await executionService.startTestSuiteRun(id, promptRow.prompt_text, promptHistoryRow.id);
    reply.send({ runId });
  });

  fastify.get('/api/test-suite-runs/:runId', async (request, reply) => {
    const { runId } = request.params as any;
    const run = await executionService.getTestSuiteRun(runId);
    if (!run) {
      return reply.status(404).send({ error: 'Run not found' });
    }
    reply.send(run);
  });
}
