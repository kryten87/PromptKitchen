import { EvaluationService } from './EvaluationService';
import type { Assertion } from '@prompt-kitchen/shared';

describe('EvaluationService', () => {
  it('compares deep JSON correctly', () => {
    expect(EvaluationService.deepJsonEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(EvaluationService.deepJsonEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(EvaluationService.deepJsonEqual([1, 2], [1, 2])).toBe(true);
    expect(EvaluationService.deepJsonEqual([1, 2], [2, 1])).toBe(false);
  });

  it('compares strings correctly', () => {
    expect(EvaluationService.exactStringMatch('hello', 'hello')).toBe(true);
    expect(EvaluationService.exactStringMatch('hello', 'world')).toBe(false);
  });

  it('evaluates basic assertions', () => {
    const svc = EvaluationService.factory();
    const actual = { foo: 'bar' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a1',
        path: '$.foo',
        matcher: 'toEqual',
        not: false,
        pathMatch: 'ANY',
        expected: 'bar',
      },
    ];
    const result = svc.evaluate(actual, assertions);
    expect(result.passed).toBe(true);
  });

  it('throws on invalid regex in compileSafeRegex', () => {
    const svc = EvaluationService.factory();
    // @ts-expect-error: accessing private method for testing
    expect(() => svc.matcherContext.compileSafeRegex('[', 'i')).toThrow();
  });

  it('evaluates not modifier', () => {
    const svc = EvaluationService.factory();
    const actual = { foo: 'bar' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a2',
        path: '$.foo',
        matcher: 'toMatch',
        not: true,
        pathMatch: 'ANY',
        expected: 'baz',
      },
    ];
    const result = svc.evaluate(actual, assertions);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  it('enforces allowed regex flags (throws on disallowed flags)', () => {
    const svc = EvaluationService.factory();
    // @ts-expect-error: accessing private method for testing
    expect(() => svc.matcherContext.compileSafeRegex('abc', 'x')).toThrow();
  });

  it('allows valid regex flags', () => {
    const svc = EvaluationService.factory();
    // @ts-expect-error: accessing private method for testing
    const regex = svc.matcherContext.compileSafeRegex('abc', 'i');
    expect(regex).toBeInstanceOf(RegExp);
    expect(regex.flags).toBe('i');
  });

  it('evaluates toMatch with regex flags object', () => {
    const svc = EvaluationService.factory();
    const actual = { text: 'Hello World' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a3',
        path: '$.text',
        matcher: 'toMatch',
        not: false,
        pathMatch: 'ANY',
        expected: { source: 'hello', flags: 'i' }, // Case-insensitive
      },
    ];
    const result = svc.evaluate(actual, assertions);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  it('evaluates toMatch with string pattern (no flags)', () => {
    const svc = EvaluationService.factory();
    const actual = { text: 'Hello World' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a4',
        path: '$.text',
        matcher: 'toMatch',
        not: false,
        pathMatch: 'ANY',
        expected: 'Hello', // Case-sensitive string
      },
    ];
    const result = svc.evaluate(actual, assertions);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  it('evaluates toMatch fails with case-sensitive pattern', () => {
    const svc = EvaluationService.factory();
    const actual = { text: 'Hello World' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a5',
        path: '$.text',
        matcher: 'toMatch',
        not: false,
        pathMatch: 'ANY',
        expected: 'hello', // Case-sensitive, should fail
      },
    ];
    const result = svc.evaluate(actual, assertions);
    expect(result.passed).toBe(false);
    expect(result.results[0].passed).toBe(false);
  });

  it('throws on regex source that exceeds max length', () => {
    const svc = EvaluationService.factory();
    const longPattern = 'a'.repeat(2000); // Exceeds default 1024 limit
    // @ts-expect-error: accessing private method for testing
    expect(() => svc.matcherContext.compileSafeRegex(longPattern, 'i')).toThrow(/exceeds maximum length/);
  });
});
