import { Assertion } from '../types';
import { evaluateAssertions, EvaluateAssertionsOptions } from './evaluateAssertions';
import { MatcherContext } from './matcher';

const matcherContext: MatcherContext = {
  deepEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
};
const opts: EvaluateAssertionsOptions = { matcherContext };

describe('evaluateAssertions', () => {
  it('passes with toEqual matcher (ANY, single value)', () => {
    const actual = { foo: 42 };
    const assertions: Assertion[] = [
      {
        assertionId: 'a1',
        path: '$.foo',
        matcher: 'toEqual',
        expected: 42,
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
    expect(result.results[0].actualSamples).toEqual([42]);
  });

  it('fails with toEqual matcher (ANY, single value)', () => {
    const actual = { foo: 42 };
    const assertions: Assertion[] = [
      {
        assertionId: 'a2',
        path: '$.foo',
        matcher: 'toEqual',
        expected: 99,
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(false);
    expect(result.results[0].passed).toBe(false);
    expect(result.results[0].actualSamples).toEqual([42]);
  });

  it('passes with toBeNull matcher (ANY, single value)', () => {
    const actual = { foo: null };
    const assertions: Assertion[] = [
      {
        assertionId: 'a3',
        path: '$.foo',
        matcher: 'toBeNull',
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
    expect(result.results[0].actualSamples).toEqual([null]);
  });

  it('handles path with no results (returns [undefined])', () => {
    const actual = { foo: 42 };
    const assertions: Assertion[] = [
      {
        assertionId: 'a4',
        path: '$.bar',
        matcher: 'toBeNull',
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(false);
    expect(result.results[0].actualSamples).toEqual([undefined]);
  });

  it('passes with toContain matcher (array, ANY)', () => {
    const actual = { arr: [1, 2, 3] };
    const assertions: Assertion[] = [
      {
        assertionId: 'a5',
        path: '$.arr',
        matcher: 'toContain',
        expected: 2,
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  it('fails with toContain matcher (array, ANY)', () => {
    const actual = { arr: [1, 2, 3] };
    const assertions: Assertion[] = [
      {
        assertionId: 'a6',
        path: '$.arr',
        matcher: 'toContain',
        expected: 99,
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(false);
    expect(result.results[0].passed).toBe(false);
  });

  it('passes with toMatch matcher (string)', () => {
    const actual = { str: 'hello world' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a7',
        path: '$.str',
        matcher: 'toMatch',
        expected: 'hello',
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  it('fails with toMatch matcher (string)', () => {
    const actual = { str: 'hello world' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a8',
        path: '$.str',
        matcher: 'toMatch',
        expected: 'bye',
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(false);
    expect(result.results[0].passed).toBe(false);
  });

  it('passes with toBeOneOf matcher', () => {
    const actual = { val: 'foo' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a9',
        path: '$.val',
        matcher: 'toBeOneOf',
        expected: ['bar', 'foo', 'baz'],
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  it('handles pathMatch ALL (all values must pass)', () => {
    const actual = { arr: [2, 2, 2] };
    const assertions: Assertion[] = [
      {
        assertionId: 'a10',
        path: '$.arr[*]',
        matcher: 'toEqual',
        expected: 2,
        pathMatch: 'ALL',
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  it('handles pathMatch ALL (fails if any value fails)', () => {
    const actual = { arr: [2, 3, 2] };
    const assertions: Assertion[] = [
      {
        assertionId: 'a11',
        path: '$.arr[*]',
        matcher: 'toEqual',
        expected: 2,
        pathMatch: 'ALL',
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(false);
    expect(result.results[0].passed).toBe(false);
  });

  it('applies not modifier (inverts result)', () => {
    const actual = { foo: 42 };
    const assertions: Assertion[] = [
      {
        assertionId: 'a12',
        path: '$.foo',
        matcher: 'toEqual',
        expected: 99,
        not: true,
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  it('multiple assertions: all must pass', () => {
    const actual = { foo: 42, bar: 'baz' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a13',
        path: '$.foo',
        matcher: 'toEqual',
        expected: 42,
      },
      {
        assertionId: 'a14',
        path: '$.bar',
        matcher: 'toEqual',
        expected: 'baz',
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(true);
    expect(result.results.every((r) => r.passed)).toBe(true);
  });

  it('multiple assertions: fails if any fail', () => {
    const actual = { foo: 42, bar: 'baz' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a15',
        path: '$.foo',
        matcher: 'toEqual',
        expected: 42,
      },
      {
        assertionId: 'a16',
        path: '$.bar',
        matcher: 'toEqual',
        expected: 'qux',
      },
    ];
    const result = evaluateAssertions(actual, assertions, opts);
    expect(result.passed).toBe(false);
    expect(result.results[1].passed).toBe(false);
  });
});
