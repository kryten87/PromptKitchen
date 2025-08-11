// Matcher interfaces and registry scaffold for enhanced test matching
// All imports must be static and at the top of the file

import { MatcherName } from '../types';

export interface MatcherContext {
  deepEqual(a: unknown, b: unknown): boolean;
}

export interface Matcher {
  name: MatcherName | string;
  arity: 'none' | 'one';
  evaluate(value: unknown, expected: unknown, ctx: MatcherContext): boolean;
  describe(value: unknown, expected: unknown, not: boolean): string;
}

export const registry: Record<string, Matcher> = {};
