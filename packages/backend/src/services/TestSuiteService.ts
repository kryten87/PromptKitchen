import { TestCase, TestSuite } from '@prompt-kitchen/shared/src/dtos';
import type { DatabaseConnector } from '../db/db';
import { TestCaseRepository } from '../repositories/TestCaseRepository';
import { TestSuiteRepository } from '../repositories/TestSuiteRepository';

export class TestSuiteService {
  private readonly testSuiteRepo: TestSuiteRepository;
  private readonly testCaseRepo: TestCaseRepository;

  constructor(testSuiteRepo: TestSuiteRepository, testCaseRepo: TestCaseRepository) {
    this.testSuiteRepo = testSuiteRepo;
    this.testCaseRepo = testCaseRepo;
  }

  static factory(db: DatabaseConnector): TestSuiteService {
    return new TestSuiteService(
      new TestSuiteRepository(db),
      new TestCaseRepository(db)
    );
  }

  async getTestSuiteById(id: string): Promise<TestSuite | null> {
    return this.testSuiteRepo.getById(id);
  }

  async getTestSuitesByPromptId(promptId: string): Promise<TestSuite[]> {
    return this.testSuiteRepo.getAllByPromptId(promptId);
  }

  async createTestSuite(data: Omit<TestSuite, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestSuite> {
    return this.testSuiteRepo.create(data);
  }

  async updateTestSuite(id: string, updates: Partial<Omit<TestSuite, 'id' | 'promptId' | 'createdAt'>>): Promise<TestSuite | null> {
    return this.testSuiteRepo.update(id, updates);
  }

  async deleteTestSuite(id: string): Promise<void> {
    // Optionally, delete all test cases in the suite first
    const cases = await this.testCaseRepo.getAllByTestSuiteId(id);
    for (const c of cases) {
      await this.testCaseRepo.delete(c.id);
    }
    await this.testSuiteRepo.delete(id);
  }

  async getTestCasesBySuiteId(testSuiteId: string): Promise<TestCase[]> {
    return this.testCaseRepo.getAllByTestSuiteId(testSuiteId);
  }

  async getTestCaseById(id: string): Promise<TestCase | null> {
    return this.testCaseRepo.getById(id);
  }

  async createTestCase(data: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestCase> {
    return this.testCaseRepo.create(data);
  }

  async updateTestCase(id: string, updates: Partial<Omit<TestCase, 'id' | 'testSuiteId' | 'createdAt'>>): Promise<TestCase | null> {
    return this.testCaseRepo.update(id, updates);
  }

  async deleteTestCase(id: string): Promise<void> {
    await this.testCaseRepo.delete(id);
  }
}
