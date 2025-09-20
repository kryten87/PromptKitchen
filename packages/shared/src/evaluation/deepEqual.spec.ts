import { deepEqual } from './deepEqual';

describe('deepEqual', () => {
  it('should return true for primitives that are equal', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('abc', 'abc')).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
  });

  it('should return false for primitives that are not equal', () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual('abc', 'def')).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it('should return true for deeply equal objects', () => {
    expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([{ x: 1 }, { y: 2 }], [{ x: 1 }, { y: 2 }])).toBe(true);
  });

  it('should return false for objects with different values', () => {
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  it('should ignore object key order', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it('should respect array order', () => {
    expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
  });
});
