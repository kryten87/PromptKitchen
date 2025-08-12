import { defaultMatcherContext, toContainMatcher } from './matcher';

describe('toContainMatcher', () => {
  describe('array mode', () => {
    it('returns true if any element deep-equals expected', () => {
      expect(toContainMatcher.evaluate([1, 2, 3], 2, defaultMatcherContext)).toBe(true);
      expect(toContainMatcher.evaluate([{ a: 1 }, { b: 2 }], { b: 2 }, defaultMatcherContext)).toBe(true);
    });
    it('returns false if no element deep-equals expected', () => {
      expect(toContainMatcher.evaluate([1, 2, 3], 4, defaultMatcherContext)).toBe(false);
      expect(toContainMatcher.evaluate([{ a: 1 }], { b: 2 }, defaultMatcherContext)).toBe(false);
    });
    it('describe returns correct message for pass/fail', () => {
      expect(toContainMatcher.describe([1, 2, 3], 2, false)).toMatch(/contains expected/);
      expect(toContainMatcher.describe([1, 2, 3], 4, false)).toMatch(/expected value to contain 4/);
    });
    it('describe returns correct message for not modifier', () => {
      expect(toContainMatcher.describe([1, 2, 3], 4, true)).toMatch(/NOT to contain/);
      expect(toContainMatcher.describe([1, 2, 3], 2, true)).toMatch(/NOT contains expected/);
    });
  });

  describe('string mode', () => {
    it('returns true for substring (case-sensitive)', () => {
      expect(toContainMatcher.evaluate('hello world', 'world', defaultMatcherContext)).toBe(true);
      expect(toContainMatcher.evaluate('abc', 'a', defaultMatcherContext)).toBe(true);
    });
    it('returns false for missing substring (case-sensitive)', () => {
      expect(toContainMatcher.evaluate('hello world', 'WORLD', defaultMatcherContext)).toBe(false);
      expect(toContainMatcher.evaluate('abc', 'z', defaultMatcherContext)).toBe(false);
    });
    it('returns true for substring (case-insensitive)', () => {
      expect(
        toContainMatcher.evaluate('hello world', { value: 'WORLD', caseInsensitive: true }, defaultMatcherContext)
      ).toBe(true);
      expect(
        toContainMatcher.evaluate('abc', { value: 'A', caseInsensitive: true }, defaultMatcherContext)
      ).toBe(true);
    });
    it('returns false for missing substring (case-insensitive)', () => {
      expect(
        toContainMatcher.evaluate('hello world', { value: 'planet', caseInsensitive: true }, defaultMatcherContext)
      ).toBe(false);
    });
    it('describe returns correct message for pass/fail', () => {
      expect(toContainMatcher.describe('hello world', 'world', false)).toMatch(/contains expected/);
      expect(toContainMatcher.describe('hello world', 'WORLD', false)).toMatch(/expected value to contain/);
      expect(
        toContainMatcher.describe('hello world', { value: 'WORLD', caseInsensitive: true }, false)
      ).toMatch(/contains expected/);
    });
    it('describe returns correct message for not modifier', () => {
      expect(toContainMatcher.describe('hello world', 'WORLD', true)).toMatch(/NOT to contain/);
      expect(toContainMatcher.describe('hello world', 'world', true)).toMatch(/NOT contains expected/);
    });
  });

  describe('invalid types', () => {
    it('returns false for unsupported types', () => {
      expect(toContainMatcher.evaluate(123, '2', defaultMatcherContext)).toBe(false);
      expect(toContainMatcher.evaluate({}, 'a', defaultMatcherContext)).toBe(false);
    });
    it('describe returns correct error message for unsupported types', () => {
      expect(toContainMatcher.describe(123, '2', false)).toMatch(/only supports arrays and strings/);
      expect(toContainMatcher.describe({}, 'a', false)).toMatch(/only supports arrays and strings/);
    });
    it('describe returns correct error for invalid expected', () => {
      expect(toContainMatcher.describe('abc', 123, false)).toMatch(/must be a string or/);
    });
  });
});
