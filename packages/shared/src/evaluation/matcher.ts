export const toBeNullMatcher: Matcher = {
  name: 'toBeNull',
  arity: 'none',
  evaluate(value: unknown): boolean {
    return value === null;
  },
  describe(value: unknown, _expected: unknown, not: boolean): string {
    const pass = value === null;
    if (!not) {
      if (pass) {
        return 'value is null';
      }
      return `expected value to be null, got ${JSON.stringify(value)}`;
    } else {
      if (!pass) {
        return `expected value NOT to be null, got ${JSON.stringify(value)}`;
      }
      return 'value NOT is null';
    }
  },
};
// Matcher interfaces and registry scaffold for enhanced test matching
// All imports must be static and at the top of the file

import { MatcherName } from '../types';
import { deepEqual } from './deepEqual';

export interface MatcherContext {
  deepEqual(a: unknown, b: unknown): boolean;
}

/**
 * Default MatcherContext implementation using fast-deep-equal
 */
export const defaultMatcherContext: MatcherContext = {
  deepEqual,
};

export interface Matcher {
  name: MatcherName | string;
  arity: 'none' | 'one';
  evaluate(value: unknown, expected: unknown, ctx: MatcherContext): boolean;
  describe(value: unknown, expected: unknown, not: boolean): string;
}

export const toEqualMatcher: Matcher = {
  name: 'toEqual',
  arity: 'one',
  evaluate(value: unknown, expected: unknown, ctx: MatcherContext): boolean {
    return ctx.deepEqual(value, expected);
  },
  describe(value: unknown, expected: unknown, not: boolean): string {
    const pass = deepEqual(value, expected);
    if (!not) {
      if (pass) {
        return 'value deeply equals expected';
      }
      return `expected value to deeply equal ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`;
    } else {
      if (!pass) {
        return `expected value NOT to deeply equal ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`;
      }
      return 'value NOT deeply equals expected';
    }
  },
};

export const registry: Record<string, Matcher> = {
  toEqual: toEqualMatcher,
  toBeNull: toBeNullMatcher,
};
