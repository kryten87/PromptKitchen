import { defaultMatcherContext, toEqualMatcher } from './matcher';

describe('toEqualMatcher', () => {
  it('returns true for deeply equal primitives', () => {
    expect(toEqualMatcher.evaluate(1, 1, defaultMatcherContext)).toBe(true);
    expect(toEqualMatcher.evaluate('abc', 'abc', defaultMatcherContext)).toBe(true);
    expect(toEqualMatcher.evaluate(null, null, defaultMatcherContext)).toBe(true);
  });

  it('returns false for non-equal primitives', () => {
    expect(toEqualMatcher.evaluate(1, 2, defaultMatcherContext)).toBe(false);
    expect(toEqualMatcher.evaluate('abc', 'def', defaultMatcherContext)).toBe(false);
    expect(toEqualMatcher.evaluate(null, undefined, defaultMatcherContext)).toBe(false);
  });

  it('returns true for deeply equal objects', () => {
    expect(toEqualMatcher.evaluate({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }, defaultMatcherContext)).toBe(true);
    expect(toEqualMatcher.evaluate([1, 2, 3], [1, 2, 3], defaultMatcherContext)).toBe(true);
  });

  it('returns false for objects with different values', () => {
    expect(toEqualMatcher.evaluate({ a: 1 }, { a: 2 }, defaultMatcherContext)).toBe(false);
    expect(toEqualMatcher.evaluate([1, 2, 3], [1, 2, 4], defaultMatcherContext)).toBe(false);
  });

  it('describe returns correct message for pass/fail', () => {
    expect(toEqualMatcher.describe(1, 1, false)).toMatch(/deeply equals expected/);
    expect(toEqualMatcher.describe(1, 2, false)).toMatch(/expected value to deeply equal 2, got 1/);
    expect(toEqualMatcher.describe({ a: 1 }, { a: 2 }, false)).toMatch(/expected value to deeply equal/);
    expect(toEqualMatcher.describe({ a: 1 }, { a: 1 }, false)).toMatch(/deeply equals expected/);
  });

  it('describe returns correct message for not modifier', () => {
    expect(toEqualMatcher.describe(1, 2, true)).toMatch(/NOT to deeply equal/);
    expect(toEqualMatcher.describe(1, 1, true)).toMatch(/NOT deeply equals expected/);
  });
});
