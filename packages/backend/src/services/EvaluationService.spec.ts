import { Assertion } from '../../../shared/src/types';
import { EvaluationService } from './EvaluationService';

describe('EvaluationService', () => {
  it('factory method returns an instance', () => {
    const svc = EvaluationService.factory();
    expect(svc).toBeInstanceOf(EvaluationService);
  });

  it('evaluates toEqual matcher correctly', () => {
    const svc = EvaluationService.factory();
    const actual = { foo: 1 };
    const assertions: Assertion[] = [
      {
        assertionId: 'a1',
        path: '$.foo',
        matcher: 'toEqual',
        not: false,
        pathMatch: 'ANY',
        expected: 1,
      },
    ];
    const result = svc.evaluate(actual, assertions);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  it('throws on invalid regex in compileSafeRegex', () => {
    const svc = EvaluationService.factory();
    // @ts-expect-error: intentionally testing error handling for invalid regex
    expect(() => svc.matcherContext.compileSafeRegex('[', 'i')).toThrow();
  });

  it('evaluates not modifier', () => {
    const svc = EvaluationService.factory();
    const actual = { foo: 'bar' };
    const assertions: Assertion[] = [
      {
        assertionId: 'a2',
        path: '$.foo',
        matcher: 'toMatch',
        not: true,
        pathMatch: 'ANY',
        expected: 'baz',
      },
    ];
    const result = svc.evaluate(actual, assertions);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });
});
