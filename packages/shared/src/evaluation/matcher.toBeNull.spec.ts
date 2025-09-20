import { defaultMatcherContext, toBeNullMatcher } from './matcher';

describe('toBeNullMatcher', () => {
  it('returns true for null', () => {
    expect(toBeNullMatcher.evaluate(null, undefined, defaultMatcherContext)).toBe(true);
  });

  it('returns false for non-null values', () => {
    expect(toBeNullMatcher.evaluate(undefined, undefined, defaultMatcherContext)).toBe(false);
    expect(toBeNullMatcher.evaluate(0, undefined, defaultMatcherContext)).toBe(false);
    expect(toBeNullMatcher.evaluate('', undefined, defaultMatcherContext)).toBe(false);
    expect(toBeNullMatcher.evaluate({}, undefined, defaultMatcherContext)).toBe(false);
  });

  it('describe returns correct message for pass/fail', () => {
    expect(toBeNullMatcher.describe(null, undefined, false)).toMatch(/is null/);
    expect(toBeNullMatcher.describe(1, undefined, false)).toMatch(/expected value to be null, got 1/);
    expect(toBeNullMatcher.describe(undefined, undefined, false)).toMatch(/expected value to be null, got undefined/);
  });

  it('describe returns correct message for not modifier', () => {
    expect(toBeNullMatcher.describe(1, undefined, true)).toMatch(/NOT to be null/);
    expect(toBeNullMatcher.describe(null, undefined, true)).toMatch(/NOT is null/);
  });
});
