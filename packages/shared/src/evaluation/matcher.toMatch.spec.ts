import { defaultMatcherContext, toMatchMatcher } from './matcher';

describe('toMatchMatcher', () => {
  describe('string pattern', () => {
    it('returns true if string matches pattern', () => {
      expect(toMatchMatcher.evaluate('hello world', 'hello', defaultMatcherContext)).toBe(true);
      expect(toMatchMatcher.evaluate('abc123', '\\d+', defaultMatcherContext)).toBe(true);
    });
    it('returns false if string does not match pattern', () => {
      expect(toMatchMatcher.evaluate('hello world', 'bye', defaultMatcherContext)).toBe(false);
      expect(toMatchMatcher.evaluate('abc', '\\d+', defaultMatcherContext)).toBe(false);
    });
  });

  describe('object pattern with flags', () => {
    it('returns true for case-insensitive match', () => {
      expect(toMatchMatcher.evaluate('Hello', { source: 'hello', flags: 'i' }, defaultMatcherContext)).toBe(true);
    });
    it('returns false for missing match', () => {
      expect(toMatchMatcher.evaluate('Hello', { source: 'bye', flags: 'i' }, defaultMatcherContext)).toBe(false);
    });
    it('returns true for multiline flag', () => {
      expect(toMatchMatcher.evaluate('foo\nbar', { source: '^bar', flags: 'm' }, defaultMatcherContext)).toBe(true);
    });
  });

  describe('invalid types', () => {
    it('returns false for non-string value', () => {
      expect(toMatchMatcher.evaluate(123, '123', defaultMatcherContext)).toBe(false);
      expect(toMatchMatcher.evaluate({}, 'abc', defaultMatcherContext)).toBe(false);
    });
    it('returns false for invalid pattern', () => {
      expect(toMatchMatcher.evaluate('abc', { source: '[', flags: 'i' }, defaultMatcherContext)).toBe(false);
    });
  });

  describe('describe', () => {
    it('returns correct message for pass/fail', () => {
      expect(toMatchMatcher.describe('hello', 'hello', false)).toMatch(/matches pattern/);
      expect(toMatchMatcher.describe('hello', 'bye', false)).toMatch(/expected value to match/);
      expect(toMatchMatcher.describe('hello', { source: 'hello', flags: 'i' }, false)).toMatch(/matches pattern/);
    });
    it('returns correct message for not modifier', () => {
      expect(toMatchMatcher.describe('hello', 'bye', true)).toMatch(/NOT to match/);
      expect(toMatchMatcher.describe('hello', 'hello', true)).toMatch(/NOT matches pattern/);
    });
    it('returns error for non-string value', () => {
      expect(toMatchMatcher.describe(123, '123', false)).toMatch(/only supports strings/);
    });
    it('returns error for invalid pattern', () => {
      expect(toMatchMatcher.describe('abc', { source: '[', flags: 'i' }, false)).toMatch(/invalid pattern/);
    });
  });
});
