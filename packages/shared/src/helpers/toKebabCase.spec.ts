import { toKebabCase } from './toKebabCase';

describe('toKebabCase', () => {
  it('converts spaces to hyphens and lowercases', () => {
    expect(toKebabCase('Hello World')).toBe('hello-world');
  });

  it('removes non-alphanumeric except hyphens', () => {
    expect(toKebabCase('foo@bar!baz#')).toBe('foo-bar-baz');
  });

  it('handles underscores and camelCase', () => {
    expect(toKebabCase('fooBar_bazQux')).toBe('foo-bar-baz-qux');
  });

  it('collapses multiple hyphens', () => {
    expect(toKebabCase('foo--bar---baz')).toBe('foo-bar-baz');
  });

  it('trims leading and trailing hyphens', () => {
    expect(toKebabCase('--foo-bar--')).toBe('foo-bar');
  });

  it('returns empty string for only non-alphanumeric', () => {
    expect(toKebabCase('!@#$%^&*()')).toBe('');
  });

  it('handles mixed input', () => {
    expect(toKebabCase('  Foo_Bar--Baz!!Qux ')).toBe('foo-bar-baz-qux');
  });

  it('preserves single hyphens between words', () => {
    expect(toKebabCase('foo-bar baz_qux')).toBe('foo-bar-baz-qux');
  });

  it('handles numbers', () => {
    expect(toKebabCase('foo123Bar456')).toBe('foo123-bar456');
  });

  it('handles empty string', () => {
    expect(toKebabCase('')).toBe('');
  });
});
