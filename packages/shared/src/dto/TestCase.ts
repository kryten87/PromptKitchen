// packages/shared/src/dtos.ts

import type { TestCaseRunMode } from '../types';
import type { JsonValue } from './JsonValue';

export interface TestCase {
  id: string;
  testSuiteId: string;
  inputs: Record<string, JsonValue>;
  expectedOutput: string | Record<string, JsonValue>;
  runMode: TestCaseRunMode;
  createdAt: Date;
  updatedAt: Date;
}
