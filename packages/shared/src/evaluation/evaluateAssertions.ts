import { Assertion, AssertionResult, PathMatchMode } from '../types';
import { resolveJsonPath } from './jsonpath';
import { MatcherContext, registry } from './matcher';

export interface EvaluateAssertionsOptions {
  matcherContext: MatcherContext;
}

export function evaluateAssertions(
  actual: unknown,
  assertions: Assertion[],
  opts: EvaluateAssertionsOptions
): { passed: boolean; results: AssertionResult[] } {
  let actualJson: unknown;
  if (typeof actual === 'string') {
    try {
      actualJson = JSON.parse(actual);
    } catch {
      actualJson = actual;
    }
  } else {
    actualJson = actual;
  }
  const results: AssertionResult[] = assertions.map((assertion) => {
    const path = assertion.path;
    const matcher = registry[assertion.matcher];
    const not = Boolean(assertion.not);
    const pathMatch: PathMatchMode = assertion.pathMatch || 'ANY';
    const expected = assertion.expected;
    // Resolve values at path
    let values = resolveJsonPath(actualJson, path);
    if (!values || values.length === 0) {
      values = [undefined];
    }
    // Evaluate matcher for each value
    const passes = values.map((value) => matcher.evaluate(value, expected, opts.matcherContext));
    let aggregate: boolean;
    if (pathMatch === 'ANY') {
      aggregate = passes.some((p) => p);
    } else {
      aggregate = passes.every((p) => p);
    }
    const passed = not ? !aggregate : aggregate;
    // Build message
    const message = matcher.describe(values.length === 1 ? values[0] : values, expected, not);
    return {
      assertionId: assertion.assertionId,
      path,
      matcher: assertion.matcher,
      not,
      pathMatch,
      passed,
      actualSamples: values,
      message,
    };
  });
  return {
    passed: results.every((r) => r.passed),
    results,
  };
}
