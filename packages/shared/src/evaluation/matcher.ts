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


export const toContainMatcher: Matcher = {
  name: 'toContain',
  arity: 'one',
  evaluate(value: unknown, expected: unknown, ctx: MatcherContext): boolean {
    // Array mode: pass if any element deep-equals expected
    if (Array.isArray(value)) {
      return value.some((item) => ctx.deepEqual(item, expected));
    }
    // String mode: expected can be string or { value, caseInsensitive }
    if (typeof value === 'string') {
      let search: string;
      let caseInsensitive = false;
      if (typeof expected === 'string') {
        search = expected;
      } else if (
        expected && typeof expected === 'object' && 'value' in expected
      ) {
        const expObj = expected as { value: string; caseInsensitive?: boolean };
        search = expObj.value;
        caseInsensitive = Boolean(expObj.caseInsensitive);
      } else {
        return false;
      }
      if (caseInsensitive) {
        return value.toLowerCase().includes(search.toLowerCase());
      }
      return value.includes(search);
    }
    return false;
  },
  describe(value: unknown, expected: unknown, not: boolean): string {
    let pass = false;
    let mode = '';
    if (Array.isArray(value)) {
      pass = value.some((item) => deepEqual(item, expected));
      mode = 'array';
    } else if (typeof value === 'string') {
      let search: string;
      let caseInsensitive = false;
      if (typeof expected === 'string') {
        search = expected;
      } else if (
        expected && typeof expected === 'object' && 'value' in expected
      ) {
        const expObj = expected as { value: string; caseInsensitive?: boolean };
        search = expObj.value;
        caseInsensitive = Boolean(expObj.caseInsensitive);
      } else {
        return 'expected value for toContain must be a string or { value, caseInsensitive }';
      }
      if (caseInsensitive) {
        pass = value.toLowerCase().includes(search.toLowerCase());
        mode = 'string (case-insensitive)';
      } else {
        pass = value.includes(search);
        mode = 'string';
      }
    } else {
      return 'toContain matcher only supports arrays and strings';
    }
    if (!not) {
      if (pass) {
        return `value contains expected (${mode})`;
      }
      return `expected value to contain ${JSON.stringify(expected)} (${mode}), got ${JSON.stringify(value)}`;
    } else {
      if (!pass) {
        return `expected value NOT to contain ${JSON.stringify(expected)} (${mode}), got ${JSON.stringify(value)}`;
      }
      return `value NOT contains expected (${mode})`;
    }
  },
};

export const registry: Record<string, Matcher> = {
  toEqual: toEqualMatcher,
  toBeNull: toBeNullMatcher,
  toContain: toContainMatcher,
};
