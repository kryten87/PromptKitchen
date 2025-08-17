import { MatcherContext, toBeOneOfMatcher } from './matcher';

describe('toBeOneOfMatcher', () => {
  const ctx: MatcherContext = {
    deepEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  };

  it('returns true if value is deeply equal to any option', () => {
    expect(toBeOneOfMatcher.evaluate(2, [1, 2, 3], ctx)).toBe(true);
    expect(toBeOneOfMatcher.evaluate('foo', ['bar', 'foo', 'baz'], ctx)).toBe(true);
    expect(toBeOneOfMatcher.evaluate({ a: 1 }, [{ a: 2 }, { a: 1 }], ctx)).toBe(true);
  });

  it('returns false if value is not equal to any option', () => {
    expect(toBeOneOfMatcher.evaluate(4, [1, 2, 3], ctx)).toBe(false);
    expect(toBeOneOfMatcher.evaluate('qux', ['bar', 'foo', 'baz'], ctx)).toBe(false);
    expect(toBeOneOfMatcher.evaluate({ a: 3 }, [{ a: 2 }, { a: 1 }], ctx)).toBe(false);
  });

  it('returns false if expected is not an array', () => {
    expect(toBeOneOfMatcher.evaluate(2, 2 as unknown, ctx)).toBe(false);
    expect(toBeOneOfMatcher.evaluate('foo', null as unknown, ctx)).toBe(false);
  });

  describe('describe()', () => {
    it('describes a passing case', () => {
      expect(toBeOneOfMatcher.describe(2, [1, 2, 3], false)).toMatch(/value is one of/);
    });
    it('describes a failing case', () => {
      expect(toBeOneOfMatcher.describe(4, [1, 2, 3], false)).toMatch(/expected value to be one of/);
    });
    it('describes a passing negated case', () => {
      expect(toBeOneOfMatcher.describe(4, [1, 2, 3], true)).toMatch(/expected value NOT to be one of/);
    });
    it('describes a failing negated case', () => {
      expect(toBeOneOfMatcher.describe(2, [1, 2, 3], true)).toMatch(/value is NOT one of/);
    });
    it('describes error for non-array expected', () => {
      expect(toBeOneOfMatcher.describe(2, 2 as unknown, false)).toMatch(/must be an array/);
    });
  });
});
