// packages/shared/src/dtos.ts

import type { JsonValue } from './JsonValue';

import type { AssertionResult } from '../types';

export interface TestResult {
  id: string;
  testSuiteRunId: string;
  testCaseId: string;
  status: 'PASS' | 'FAIL';
  output: string | Record<string, JsonValue>;
  createdAt: Date;
  details?: AssertionResult[];
}
