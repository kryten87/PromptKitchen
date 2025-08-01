import { EvaluationService } from './EvaluationService';

describe('EvaluationService', () => {
  it('exactStringMatch returns true for exact match', () => {
    expect(EvaluationService.exactStringMatch('foo', 'foo')).toBe(true);
  });
  it('exactStringMatch returns false for non-match', () => {
    expect(EvaluationService.exactStringMatch('foo', 'bar')).toBe(false);
  });
  it('deepJsonEqual returns true for equal objects', () => {
    expect(EvaluationService.deepJsonEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });
  it('deepJsonEqual returns false for different objects', () => {
    expect(EvaluationService.deepJsonEqual({ a: 1 }, { a: 2 })).toBe(false);
  });
  it('deepJsonEqual returns true for equal arrays', () => {
    expect(EvaluationService.deepJsonEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });
  it('deepJsonEqual returns false for different arrays', () => {
    expect(EvaluationService.deepJsonEqual([1, 2], [2, 1])).toBe(false);
  });
  it('deepJsonEqual returns true for nested objects', () => {
    expect(EvaluationService.deepJsonEqual({ a: { b: [1, 2] } }, { a: { b: [1, 2] } })).toBe(true);
  });
  it('deepJsonEqual returns false for different nested objects', () => {
    expect(EvaluationService.deepJsonEqual({ a: { b: [1, 2] } }, { a: { b: [2, 1] } })).toBe(false);
  });
});
