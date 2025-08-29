// toKebabCase.ts
// Converts a string to kebab-case (lowercase, hyphens between words, removes non-alphanumeric except '-')
// Usage: import { toKebabCase } from './toKebabCase'

export function toKebabCase(input: string): string {
  return input
    // Replace underscores, spaces, and non-alphanumeric (except hyphen) with hyphens
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    // Insert hyphen between lowercase/uppercase (camelCase)
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    // Insert hyphen between number and uppercase letter
    .replace(/([0-9])([A-Z])/g, '$1-$2')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Lowercase
    .toLowerCase()
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

