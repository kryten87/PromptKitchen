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

export const registry: Record<string, Matcher> = {};

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
registry[toEqualMatcher.name] = toEqualMatcher;

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
registry[toContainMatcher.name] = toContainMatcher;

export const toBeOneOfMatcher: Matcher = {
  name: 'toBeOneOf',
  arity: 'one',
  evaluate(value: unknown, expected: unknown, ctx: MatcherContext): boolean {
    if (!Array.isArray(expected)) return false;
    return expected.some((option) => ctx.deepEqual(value, option));
  },
  describe(value: unknown, expected: unknown, not: boolean): string {
    if (!Array.isArray(expected)) {
      return 'expected value for toBeOneOf must be an array';
    }
    const pass = expected.some((option) => deepEqual(value, option));
    if (!not) {
      if (pass) {
        return `value is one of the expected options`;
      }
      return `expected value to be one of ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`;
    } else {
      if (!pass) {
        return `expected value NOT to be one of ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`;
      }
      return 'value is NOT one of the expected options';
    }
  },
};
registry[toBeOneOfMatcher.name] = toBeOneOfMatcher;

export const toMatchMatcher: Matcher = {
  name: 'toMatch',
  arity: 'one',
  evaluate(value: unknown, expected: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    let pattern: string;
    let flags = '';
    if (typeof expected === 'string') {
      pattern = expected;
    } else if (
      expected && typeof expected === 'object' && 'source' in expected
    ) {
      const expObj = expected as { source: string; flags?: string };
      pattern = expObj.source;
      flags = expObj.flags ?? '';
    } else {
      return false;
    }
    try {
      const re = new RegExp(pattern, flags);
      return re.test(value);
    } catch {
      return false;
    }
  },
  describe(value: unknown, expected: unknown, not: boolean): string {
    if (typeof value !== 'string') {
      return 'toMatch matcher only supports strings';
    }
    let pattern: string;
    let flags = '';
    if (typeof expected === 'string') {
      pattern = expected;
    } else if (
      expected && typeof expected === 'object' && 'source' in expected
    ) {
      const expObj = expected as { source: string; flags?: string };
      pattern = expObj.source;
      flags = expObj.flags ?? '';
    } else {
      return 'expected value for toMatch must be a string or { source, flags }';
    }
    let pass = false;
    try {
      const re = new RegExp(pattern, flags);
      pass = re.test(value);
    } catch {
      return `invalid pattern: ${JSON.stringify(pattern)} with flags ${JSON.stringify(flags)}`;
    }
    const flagMsg = flags ? ` (flags: ${flags})` : '';
    if (!not) {
      if (pass) {
        return `value matches pattern /${pattern}/${flags}${flagMsg}`;
      }
      return `expected value to match /${pattern}/${flags}${flagMsg}, got ${JSON.stringify(value)}`;
    } else {
      if (!pass) {
        return `expected value NOT to match /${pattern}/${flags}${flagMsg}, got ${JSON.stringify(value)}`;
      }
      return `value NOT matches pattern /${pattern}/${flags}${flagMsg}`;
    }
  },
};
registry[toMatchMatcher.name] = toMatchMatcher;

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
registry[toBeNullMatcher.name] = toBeNullMatcher;
