import * as deepEqualLib from 'fast-deep-equal';

/**
 * Performs a deep equality check between two values using fast-deep-equal.
 * @param a - First value
 * @param b - Second value
 * @returns true if values are deeply equal, false otherwise
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  return deepEqualLib.default(a, b);
}
