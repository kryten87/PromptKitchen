// packages/shared/src/dtos.ts

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id: string;
  projectId: string;
  name: string;
  prompt: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptHistory {
  id: string;
  promptId: string;
  prompt: string;
  version: number;
  createdAt: Date;
}

export interface TestSuite {
  id: string;
  promptId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TestCaseRunMode = 'DEFAULT' | 'SKIP' | 'ONLY';

export interface TestCase {
  id: string;
  testSuiteId: string;
  inputs: Record<string, any>;
  expectedOutput: string | Record<string, any>;
  runMode: TestCaseRunMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestSuiteRun {
  id: string;
  testSuiteId: string;
  createdAt: Date;
}

export interface TestResult {
  id: string;
  testSuiteRunId: string;
  testCaseId: string;
  status: 'PASS' | 'FAIL';
  output: string | Record<string, any>;
  createdAt: Date;
}
