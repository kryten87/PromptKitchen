// EvaluationService.ts
// Provides methods for exact string match and deep JSON equality

export class EvaluationService {
  static exactStringMatch(expected: string, actual: string): boolean {
    return expected === actual;
  }

  static deepJsonEqual(expected: any, actual: any): boolean {
    // Recursively compare two JSON objects/arrays
    if (typeof expected !== typeof actual) return false;
    if (typeof expected !== 'object' || expected === null || actual === null) {
      return expected === actual;
    }
    if (Array.isArray(expected)) {
      if (!Array.isArray(actual) || expected.length !== actual.length) return false;
      for (let i = 0; i < expected.length; i++) {
        if (!EvaluationService.deepJsonEqual(expected[i], actual[i])) return false;
      }
      return true;
    }
    // Compare object keys (ignore order)
    const expectedKeys = Object.keys(expected).sort();
    const actualKeys = Object.keys(actual).sort();
    if (expectedKeys.length !== actualKeys.length) return false;
    for (let i = 0; i < expectedKeys.length; i++) {
      if (expectedKeys[i] !== actualKeys[i]) return false;
      if (!EvaluationService.deepJsonEqual(expected[expectedKeys[i]], actual[actualKeys[i]])) return false;
    }
    return true;
  }
}
