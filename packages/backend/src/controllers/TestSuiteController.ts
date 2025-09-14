import { loadPKConfig } from '../config';

import { DatabaseConnector } from '@prompt-kitchen/shared';
import type { JsonValue, TestCaseRunMode } from '@prompt-kitchen/shared';
import type { Assertion } from '@prompt-kitchen/shared';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { ExecutionService } from '../services/ExecutionService';
import { LLMService } from '../services/LLMService';
import { TestSuiteService } from '../services/TestSuiteService';
import { PromptRepository } from '../repositories/PromptRepository';

interface PromptIdParams { promptId: string; }
interface TestSuiteIdParams { id: string; }
interface TestSuiteIdTestCasesParams { testSuiteId: string; }
interface TestCaseIdParams { id: string; }
interface CreateTestSuiteBody { name: string; }
interface CreateTestCaseBody {
  inputs: Record<string, JsonValue>;
  expectedOutput: string | Record<string, JsonValue>;
  assertions?: Assertion[];
  runMode: TestCaseRunMode;
}

export async function registerTestSuiteRoutes(fastify: FastifyInstance, db: DatabaseConnector) {
  const service = TestSuiteService.factory(db);

  // Test Suite CRUD
  fastify.get('/api/prompts/:promptId/test-suites', async (request: FastifyRequest<{ Params: PromptIdParams }>, reply) => {
    const { promptId } = request.params;
    const suites = await service.getTestSuitesByPromptId(promptId);
    reply.send(suites);
  });

  fastify.post('/api/prompts/:promptId/test-suites', async (request: FastifyRequest<{ Params: PromptIdParams; Body: CreateTestSuiteBody }>, reply) => {
    const { promptId } = request.params;
    const { name } = request.body;
    const suite = await service.createTestSuite({ promptId, name });
    reply.code(201).send(suite);
  });

  fastify.put('/api/test-suites/:id', async (request: FastifyRequest<{ Params: TestSuiteIdParams; Body: Record<string, unknown> }>, reply) => {
    const { id } = request.params;
    const updates = request.body;
    const updated = await service.updateTestSuite(id, updates);
    reply.send(updated);
  });

  fastify.delete('/api/test-suites/:id', async (request: FastifyRequest<{ Params: TestSuiteIdParams }>, reply) => {
    const { id } = request.params;
    await service.deleteTestSuite(id);
    reply.code(204).send();
  });

  // Test Case CRUD
  fastify.get('/api/test-suites/:testSuiteId/test-cases', async (request: FastifyRequest<{ Params: TestSuiteIdTestCasesParams }>, reply) => {
    const { testSuiteId } = request.params;
    const cases = await service.getTestCasesBySuiteId(testSuiteId);
    reply.send(cases);
  });

  fastify.post('/api/test-suites/:testSuiteId/test-cases', async (request: FastifyRequest<{ Params: TestSuiteIdTestCasesParams; Body: CreateTestCaseBody }>, reply) => {
    const { testSuiteId } = request.params;
    const { inputs, expectedOutput, assertions, runMode } = request.body;
    const testCase = await service.createTestCase({ testSuiteId, inputs, expectedOutput, assertions, runMode });
    reply.code(201).send(testCase);
  });

  fastify.put('/api/test-cases/:id', async (request: FastifyRequest<{ Params: TestCaseIdParams; Body: Record<string, unknown> }>, reply) => {
    const { id } = request.params;
    const updates = request.body;
    const updated = await service.updateTestCase(id, updates);
    reply.send(updated);
  });

  fastify.delete('/api/test-cases/:id', async (request: FastifyRequest<{ Params: TestCaseIdParams }>, reply) => {
    const { id } = request.params;
    await service.deleteTestCase(id);
    reply.code(204).send();
  });

  // --- Test Suite Execution Endpoints ---
  const llmService = new LLMService({ apiKey: process.env.OPENAI_API_KEY || 'sk-test' });
  const config = loadPKConfig();
  const executionService = new ExecutionService({
    llmService,
    testCaseRepo: service['testCaseRepo'],
    db,
    config,
  });

  fastify.post('/api/test-suites/:id/run', async (request: FastifyRequest<{ Params: TestSuiteIdParams }>, reply) => {
    const { id } = request.params;
    // For now, fetch prompt text and model from test suite's prompt
    const suite = await service.getTestSuiteById(id);
    if (!suite) {
      return reply.status(404).send({ error: 'Test suite not found' });
    }
    // Use PromptRepository to fetch prompt with modelName
    const promptRepo = new PromptRepository(db);
    const prompt = await promptRepo.getById(suite.promptId);
    if (!prompt) {
      return reply.status(404).send({ error: 'Prompt not found' });
    }
    const promptText = prompt.prompt;
    if (!promptText) {
      return reply.status(500).send({ error: 'Prompt text is missing in the database' });
    }
    // Fetch latest prompt history for this prompt
    const promptHistoryRow = await db.knex('prompt_history').where({ prompt_id: suite.promptId }).orderBy('version', 'desc').first();
    if (!promptHistoryRow) {
      return reply.status(404).send({ error: 'Prompt history not found' });
    }
    const runId = await executionService.startTestSuiteRun(id, promptText, promptHistoryRow.id, prompt.modelName);
    reply.send({ runId });
  });

  fastify.get('/api/test-suite-runs/:runId', async (request: FastifyRequest<{ Params: { runId: string } }>, reply) => {
    const { runId } = request.params;
    const run = await executionService.getTestSuiteRun(runId);
    if (!run) {
      return reply.status(404).send({ error: 'Run not found' });
    }
    reply.send(run);
  });
}
