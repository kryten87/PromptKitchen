// packages/shared/src/dtos.ts

import type { JsonValue } from './JsonValue';

export interface TestResult {
  id: string;
  testSuiteRunId: string;
  testCaseId: string;
  status: 'PASS' | 'FAIL';
  output: string | Record<string, JsonValue>;
  createdAt: Date;
}
