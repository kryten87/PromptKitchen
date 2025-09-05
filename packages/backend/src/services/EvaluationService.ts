import type { Assertion, AssertionResult, MatcherContext } from '@prompt-kitchen/shared';
import { evaluateAssertions } from '@prompt-kitchen/shared';
import { loadPKConfig } from '../config';
// EvaluationService.ts
// Provides methods for exact string match and deep JSON equality

interface BackendMatcherContext extends MatcherContext {
  compileSafeRegex(source: string, flags?: string): RegExp;
}

export class EvaluationService {
  private readonly matcherContext: BackendMatcherContext;
  private readonly config: ReturnType<typeof loadPKConfig>;
  
  constructor() {
    this.config = loadPKConfig();
    // Backend-safe regex compiler for matcher context
    this.matcherContext = {
      deepEqual: EvaluationService.deepJsonEqual,
      compileSafeRegex: this.compileSafeRegex.bind(this),
    };
  }

  private compileSafeRegex(source: string, flags?: string): RegExp {
    // Validate source length
    if (source.length > this.config.PK_REGEX_MAX_SOURCE_LEN) {
      throw new Error(`Regex source exceeds maximum length of ${this.config.PK_REGEX_MAX_SOURCE_LEN} characters`);
    }

    // Validate flags
    const allowedFlags = this.config.PK_REGEX_ALLOWED_FLAGS;
    if (flags) {
      for (const flag of flags) {
        if (!allowedFlags.includes(flag)) {
          throw new Error(`Regex flag '${flag}' is not allowed. Allowed flags: ${allowedFlags}`);
        }
      }
    }

    try {
      return new RegExp(source, flags || '');
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${(error as Error).message}`);
    }
  }

  static exactStringMatch(expected: string, actual: string): boolean {
    return expected === actual;
  }

  static deepJsonEqual(expected: unknown, actual: unknown): boolean {
    // Recursively compare two JSON objects/arrays
    if (typeof expected !== typeof actual) {
      return false;
    }
    if (typeof expected !== 'object' || expected === null || actual === null) {
      return expected === actual;
    }
    if (Array.isArray(expected)) {
      if (!Array.isArray(actual) || expected.length !== actual.length) {
        return false;
      }
      for (let i = 0; i < expected.length; i++) {
        if (!EvaluationService.deepJsonEqual(expected[i], (actual as unknown[])[i])) {
          return false;
        }
      }
      return true;
    }
    // Compare object keys (ignore order)
    const expectedKeys = Object.keys(expected as object).sort();
    const actualKeys = Object.keys(actual as object).sort();
    if (expectedKeys.length !== actualKeys.length) return false;
    for (let i = 0; i < expectedKeys.length; i++) {
      if (expectedKeys[i] !== actualKeys[i]) return false;
      if (!EvaluationService.deepJsonEqual((expected as Record<string, unknown>)[expectedKeys[i]], (actual as Record<string, unknown>)[actualKeys[i]])) return false;
    }
    return true;
  }

  /**
   * Evaluates assertions against actual output.
   * @param actual The actual output (string or JSON)
   * @param assertions Array of Assertion DTOs
   * @returns { passed: boolean, results: AssertionResult[] }
   */
  evaluate(actual: unknown, assertions: Assertion[]): { passed: boolean; results: AssertionResult[] } {
    // Use shared evaluateAssertions, inject matcherContext
    // The shared function expects options: { matcherContext }
    // If evaluateAssertions signature changes, update here accordingly
    return (typeof evaluateAssertions === 'function')
      ? evaluateAssertions(actual, assertions, { matcherContext: this.matcherContext })
      : { passed: false, results: [] };
  }

  /**
   * Static factory for DI
   */
  static factory(): EvaluationService {
    return new EvaluationService();
  }
}
