import { DatabaseConnector, runMigrations } from '@prompt-kitchen/shared';
import type { Assertion, TestSuite } from '@prompt-kitchen/shared';
import fs from 'fs';
import path from 'path';
import { TestSuiteService } from '../services/TestSuiteService';
import { ExecutionService } from '../services/ExecutionService';
import { registerTestSuiteRoutes } from './TestSuiteController';
import Fastify, { FastifyInstance } from 'fastify';

jest.mock('../services/ExecutionService');

const TEST_DB_PATH = path.join(__dirname, '../../test-controller.sqlite3');

describe('TestSuiteController', () => {
  let db: DatabaseConnector;
  let service: TestSuiteService;
  let testSuite: TestSuite;

  beforeAll(async () => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    db = new DatabaseConnector({ dbFile: TEST_DB_PATH });
    await runMigrations(db);
    service = TestSuiteService.factory(db);

    // Seed data
    await db.knex('users').insert({ id: 'user-1', name: 'Test User', email: 'test@example.com' });
    await db.knex('projects').insert({ id: 'project-1', name: 'Test Project', user_id: 'user-1' });
    await db.knex('models').insert({ id: 1, name: 'gpt-4' });
    const [prompt] = await db.knex('prompts').insert({
      id: 'prompt-1',
      project_id: 'project-1',
      name: 'Test Prompt',
      prompt: 'Test prompt',
      model_id: 1,
    }).returning('*');
    await db.knex('prompt_history').insert({
      prompt_id: prompt.id,
      version: 1,
      prompt: 'Test prompt',
    });

    testSuite = await service.createTestSuite({
      promptId: 'prompt-1',
      name: 'Test Suite',
    });
  });

  afterAll(async () => {
    await db.knex.destroy();
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  });

  describe('TestSuiteService Tests', () => {
    it('should create a test case with assertions (reproducing POST bug)', async () => {
      const assertions: Assertion[] = [
        {
          assertionId: 'assertion-1',
          path: '$.result',
          matcher: 'toEqual',
          expected: 'success',
          not: false,
          pathMatch: 'ANY',
        },
        {
          assertionId: 'assertion-2',
          path: '$.status',
          matcher: 'toContain',
          expected: 'completed',
          not: false,
          pathMatch: 'ALL',
        },
      ];

      const testCaseData = {
        testSuiteId: testSuite.id,
        inputs: { action: 'test' },
        expectedOutput: { result: 'success', status: 'completed' },
        assertions,
        runMode: 'DEFAULT' as const,
      };

      const createdTestCase = await service.createTestCase(testCaseData);
      
      expect(createdTestCase).toHaveProperty('id');
      expect(createdTestCase.testSuiteId).toBe(testSuite.id);
      expect(createdTestCase.inputs.action).toBe('test');
      expect(createdTestCase.expectedOutput).toEqual({ result: 'success', status: 'completed' });
      expect(createdTestCase.runMode).toBe('DEFAULT');
      expect(createdTestCase.assertions).toEqual(assertions);

      const fetchedTestCase = await service.getTestCaseById(createdTestCase.id);
      expect(fetchedTestCase).not.toBeNull();
      expect(fetchedTestCase?.assertions).toEqual(assertions);
    });

    it('should create a test case without assertions', async () => {
      const testCaseData = {
        testSuiteId: testSuite.id,
        inputs: { foo: 'bar' },
        expectedOutput: 'simple output',
        runMode: 'DEFAULT' as const,
      };

      const createdTestCase = await service.createTestCase(testCaseData);
      
      expect(createdTestCase).toHaveProperty('id');
      expect(createdTestCase.testSuiteId).toBe(testSuite.id);
      expect(createdTestCase.inputs.foo).toBe('bar');
      expect(createdTestCase.expectedOutput).toBe('simple output');
      expect(createdTestCase.runMode).toBe('DEFAULT');
      expect(createdTestCase.assertions).toBeUndefined();
    });

    it('should update a test case with assertions', async () => {
      const initialData = {
        testSuiteId: testSuite.id,
        inputs: { initial: 'value' },
        expectedOutput: 'initial output',
        runMode: 'DEFAULT' as const,
      };

      const createdTestCase = await service.createTestCase(initialData);
      
      const assertions: Assertion[] = [
        {
          assertionId: 'assertion-1',
          path: '$.updated',
          matcher: 'toEqual',
          expected: true,
          not: false,
          pathMatch: 'ANY',
        },
      ];

      const updateData = {
        inputs: { updated: 'value' },
        expectedOutput: { updated: true },
        assertions,
        runMode: 'SKIP' as const,
      };

      const updatedTestCase = await service.updateTestCase(createdTestCase.id, updateData);
      
      expect(updatedTestCase).not.toBeNull();
      expect(updatedTestCase?.id).toBe(createdTestCase.id);
      expect(updatedTestCase?.inputs.updated).toBe('value');
      expect(updatedTestCase?.expectedOutput).toEqual({ updated: true });
      expect(updatedTestCase?.runMode).toBe('SKIP');
      expect(updatedTestCase?.assertions).toEqual(assertions);
    });
  });

  describe('TestSuiteController Routes', () => {
    let fastify: FastifyInstance;
    let mockStartTestSuiteRun: jest.SpyInstance;

    beforeAll(async () => {
      fastify = Fastify();
      await registerTestSuiteRoutes(fastify, db);
      
      // Mock the implementation of startTestSuiteRun
      mockStartTestSuiteRun = jest.spyOn(ExecutionService.prototype, 'startTestSuiteRun')
        .mockResolvedValue('mock-run-id');
    });

    afterAll(() => {
      fastify.close();
      mockStartTestSuiteRun.mockRestore();
    });

    it('POST /api/test-suites/:id/run should start a test suite run', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: `/api/test-suites/${testSuite.id}/run`,
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual({ runId: 'mock-run-id' });

      // Verify that the service method was called with the correct model name
      const promptHistory = await db.knex('prompt_history').where({ prompt_id: testSuite.promptId }).first();
      expect(mockStartTestSuiteRun).toHaveBeenCalledWith(
        testSuite.id,
        'Test prompt',
        promptHistory.id,
        'gpt-4' // This is the modelName from the seeded prompt
      );
    });
  });
});
