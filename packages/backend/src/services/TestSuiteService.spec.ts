import { TestCase, TestSuite } from '@prompt-kitchen/shared/src/dtos';
import type { DatabaseConnector } from '../db/db';
import { TestCaseRepository } from '../repositories/TestCaseRepository';
import { TestSuiteRepository } from '../repositories/TestSuiteRepository';
import { TestSuiteService } from '../services/TestSuiteService';

describe('TestSuiteService', () => {
  let testSuiteRepo: jest.Mocked<TestSuiteRepository>;
  let testCaseRepo: jest.Mocked<TestCaseRepository>;
  let service: TestSuiteService;

  const testSuite: TestSuite = {
    id: 'suite-1',
    promptId: 'prompt-1',
    name: 'Suite 1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const testCase: TestCase = {
    id: 'case-1',
    testSuiteId: 'suite-1',
    inputs: { foo: 'bar' },
    expectedOutput: 'baz',
    runMode: 'DEFAULT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    testSuiteRepo = {
      getById: jest.fn(),
      getAllByPromptId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<TestSuiteRepository>;
    testCaseRepo = {
      getById: jest.fn(),
      getAllByTestSuiteId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<TestCaseRepository>;
    service = new TestSuiteService(testSuiteRepo, testCaseRepo);
  });

  it('factory method creates a service instance', () => {
    const db = {} as unknown as DatabaseConnector;
    const svc = TestSuiteService.factory(db);
    expect(svc).toBeInstanceOf(TestSuiteService);
  });

  it('getTestSuiteById returns a suite', async () => {
    testSuiteRepo.getById.mockResolvedValue(testSuite);
    const result = await service.getTestSuiteById('suite-1');
    expect(result).toBe(testSuite);
    expect(testSuiteRepo.getById).toHaveBeenCalledWith('suite-1');
  });

  it('getTestSuitesByPromptId returns suites', async () => {
    testSuiteRepo.getAllByPromptId.mockResolvedValue([testSuite]);
    const result = await service.getTestSuitesByPromptId('prompt-1');
    expect(result).toEqual([testSuite]);
    expect(testSuiteRepo.getAllByPromptId).toHaveBeenCalledWith('prompt-1');
  });

  it('createTestSuite creates a suite', async () => {
    testSuiteRepo.create.mockResolvedValue(testSuite);
    const data = { promptId: 'prompt-1', name: 'Suite 1' };
    const result = await service.createTestSuite(data);
    expect(result).toBe(testSuite);
    expect(testSuiteRepo.create).toHaveBeenCalledWith(data);
  });

  it('updateTestSuite updates a suite', async () => {
    testSuiteRepo.update.mockResolvedValue({ ...testSuite, name: 'Updated' });
    const result = await service.updateTestSuite('suite-1', { name: 'Updated' });
    expect(result?.name).toBe('Updated');
    expect(testSuiteRepo.update).toHaveBeenCalledWith('suite-1', { name: 'Updated' });
  });

  it('deleteTestSuite deletes all cases and the suite', async () => {
    testCaseRepo.getAllByTestSuiteId.mockResolvedValue([testCase]);
    testCaseRepo.delete.mockResolvedValue();
    testSuiteRepo.delete.mockResolvedValue();
    await service.deleteTestSuite('suite-1');
    expect(testCaseRepo.getAllByTestSuiteId).toHaveBeenCalledWith('suite-1');
    expect(testCaseRepo.delete).toHaveBeenCalledWith('case-1');
    expect(testSuiteRepo.delete).toHaveBeenCalledWith('suite-1');
  });

  it('getTestCasesBySuiteId returns cases', async () => {
    testCaseRepo.getAllByTestSuiteId.mockResolvedValue([testCase]);
    const result = await service.getTestCasesBySuiteId('suite-1');
    expect(result).toEqual([testCase]);
    expect(testCaseRepo.getAllByTestSuiteId).toHaveBeenCalledWith('suite-1');
  });

  it('getTestCaseById returns a case', async () => {
    testCaseRepo.getById.mockResolvedValue(testCase);
    const result = await service.getTestCaseById('case-1');
    expect(result).toBe(testCase);
    expect(testCaseRepo.getById).toHaveBeenCalledWith('case-1');
  });

  it('createTestCase creates a case', async () => {
    testCaseRepo.create.mockResolvedValue(testCase);
    const data = { testSuiteId: 'suite-1', inputs: { foo: 'bar' }, expectedOutput: 'baz', runMode: 'DEFAULT' as const };
    const result = await service.createTestCase(data);
    expect(result).toBe(testCase);
    expect(testCaseRepo.create).toHaveBeenCalledWith(data);
  });

  it('updateTestCase updates a case', async () => {
    testCaseRepo.update.mockResolvedValue({ ...testCase, expectedOutput: 'qux' });
    const result = await service.updateTestCase('case-1', { expectedOutput: 'qux' });
    expect(result?.expectedOutput).toBe('qux');
    expect(testCaseRepo.update).toHaveBeenCalledWith('case-1', { expectedOutput: 'qux' });
  });

  it('deleteTestCase deletes a case', async () => {
    testCaseRepo.delete.mockResolvedValue();
    await service.deleteTestCase('case-1');
    expect(testCaseRepo.delete).toHaveBeenCalledWith('case-1');
  });
});
