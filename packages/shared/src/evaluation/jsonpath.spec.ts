import { normalizeJsonPath, resolveJsonPath } from './jsonpath';

describe('normalizeJsonPath', () => {
  it('prepends $ for dot notation', () => {
    expect(normalizeJsonPath('user.name')).toBe('$.user.name');
    expect(normalizeJsonPath('.user.name')).toBe('$.user.name');
  });

  it('prepends $ for bracket notation', () => {
    expect(normalizeJsonPath('[0].foo')).toBe('$[0].foo');
  });

  it('returns $ for empty string', () => {
    expect(normalizeJsonPath('')).toBe('$');
  });

  it('returns $ for non-string', () => {
  expect(normalizeJsonPath(undefined as unknown as string)).toBe('$');
  expect(normalizeJsonPath(null as unknown as string)).toBe('$');
  expect(normalizeJsonPath(123 as unknown as string)).toBe('$');
  });

  it('returns unchanged if already starts with $', () => {
    expect(normalizeJsonPath('$.foo')).toBe('$.foo');
    expect(normalizeJsonPath('$[0].bar')).toBe('$[0].bar');
  });
});

describe('resolveJsonPath', () => {
  const obj = {
    user: { name: 'Alice', age: 30 },
    items: [ { id: 1, status: 'READY' }, { id: 2, status: 'PENDING' } ],
    nullValue: null,
    str: 'hello world',
  };

  it('resolves simple dot path', () => {
    expect(resolveJsonPath(obj, 'user.name')).toEqual(['Alice']);
  });

  it('resolves bracket path', () => {
    expect(resolveJsonPath(obj, 'items[0].status')).toEqual(['READY']);
  });

  it('resolves wildcard', () => {
    expect(resolveJsonPath(obj, 'items[*].status')).toEqual(['READY', 'PENDING']);
  });

  it('returns $ for empty path', () => {
    expect(resolveJsonPath(obj, '')).toEqual([obj]);
  });

  it('returns $ for non-string path', () => {
  expect(resolveJsonPath(obj, undefined as unknown as string)).toEqual([obj]);
  });

  it('returns [undefined] for invalid path', () => {
    expect(resolveJsonPath(obj, '$.notfound')).toEqual([undefined]);
    expect(resolveJsonPath(obj, 'notfound')).toEqual([undefined]);
  });

  it('handles null values', () => {
    expect(resolveJsonPath(obj, 'nullValue')).toEqual([null]);
  });

  it('handles primitives', () => {
    expect(resolveJsonPath(obj, 'str')).toEqual(['hello world']);
  });

  it('handles array root', () => {
    expect(resolveJsonPath([1,2,3], '$[1]')).toEqual([2]);
  });
});
