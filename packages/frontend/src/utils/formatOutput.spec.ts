import { formatOutputForDiff } from './formatOutput';

describe('formatOutputForDiff', () => {
  it('should pretty print JSON strings', () => {
    const jsonString = '{"name":"John","age":30,"city":"New York"}';
    const result = formatOutputForDiff(jsonString);
    const expected = JSON.stringify(JSON.parse(jsonString), null, 2);
    expect(result).toBe(expected);
    expect(result).toContain('  "name": "John"');
    expect(result).toContain('  "age": 30');
  });

  it('should return plain strings as-is when they are not valid JSON', () => {
    const plainString = 'Hello World';
    const result = formatOutputForDiff(plainString);
    expect(result).toBe('Hello World');
  });

  it('should pretty print non-string objects', () => {
    const obj = { name: 'John', age: 30, city: 'New York' };
    const result = formatOutputForDiff(obj);
    const expected = JSON.stringify(obj, null, 2);
    expect(result).toBe(expected);
    expect(result).toContain('  "name": "John"');
    expect(result).toContain('  "age": 30');
  });

  it('should pretty print arrays', () => {
    const arr = [{ name: 'John' }, { name: 'Jane' }];
    const result = formatOutputForDiff(arr);
    const expected = JSON.stringify(arr, null, 2);
    expect(result).toBe(expected);
    expect(result).toContain('  {');
    expect(result).toContain('    "name": "John"');
  });

  it('should handle null values', () => {
    const result = formatOutputForDiff(null);
    expect(result).toBe('null');
  });

  it('should handle undefined values', () => {
    const result = formatOutputForDiff(undefined);
    expect(result).toBe(undefined); // JSON.stringify(undefined) returns undefined
  });

  it('should handle number values', () => {
    const result = formatOutputForDiff(42);
    expect(result).toBe('42');
  });

  it('should handle boolean values', () => {
    const result = formatOutputForDiff(true);
    expect(result).toBe('true');
  });

  it('should handle malformed JSON strings gracefully', () => {
    const malformedJson = '{"name": "John", "age":}';
    const result = formatOutputForDiff(malformedJson);
    expect(result).toBe(malformedJson); // Should return as-is since it's not valid JSON
  });

  it('should pretty print nested JSON objects when passed as string', () => {
    const nestedJsonString = '{"user":{"name":"John","details":{"age":30,"address":{"street":"123 Main St","city":"New York"}}}}';
    const result = formatOutputForDiff(nestedJsonString);
    expect(result).toContain('  "user": {');
    expect(result).toContain('    "name": "John"');
    expect(result).toContain('      "age": 30');
    expect(result).toContain('        "street": "123 Main St"');
  });
});