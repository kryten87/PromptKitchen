export function formatOutputForDiff(output: unknown): string {
  if (typeof output === 'string') {
    // Check if it's a JSON string by trying to parse it
    try {
      const parsed = JSON.parse(output);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Not JSON, return as-is
      return output;
    }
  } else {
    // Non-string values, stringify with pretty formatting
    return JSON.stringify(output, null, 2);
  }
}