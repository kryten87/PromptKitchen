// Utility for resolving JSONPath with sugar normalization
// All imports must be static and at the top

import { JSONPath } from 'jsonpath-plus';

/**
 * Normalizes a path to JSONPath syntax (prepends $ if missing)
 */
export function normalizeJsonPath(path: string): string {
  if (typeof path !== 'string') {
    return '$';
  }
  const trimmed = path.trim();
  if (trimmed.startsWith('$')) {
    return trimmed;
  }
  if (trimmed === '') {
    return '$';
  }
  // Accept dot/bracket notation, prepend $
  return `$${trimmed.startsWith('.') || trimmed.startsWith('[') ? '' : '.'}${trimmed}`;
}

/**
 * Resolves values at a JSONPath in the given object, with sugar normalization
 */
export function resolveJsonPath(actual: unknown, path: string): unknown[] {
  const normalized = normalizeJsonPath(path);
  try {
    // jsonpath-plus expects json to be object, array, or primitive
    const result = JSONPath({ path: normalized, json: actual as object });
    if (Array.isArray(result)) {
      return result;
    }
    return [result];
  } catch {
    // On error, treat as no results
    return [undefined];
  }
}
