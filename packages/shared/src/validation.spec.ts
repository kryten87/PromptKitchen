import { definePromptSchema } from './validation';
import * as yup from 'yup';

describe('Validation Tests', () => {
  it('should validate a valid prompt schema', () => {
    const schema = definePromptSchema();
    const validData = {
      id: '1',
      projectId: '1',
      name: 'Test Prompt',
      prompt: 'Hello {{name}}!',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(() => schema.validateSync(validData)).not.toThrow();
  });

  it('should throw an error for invalid prompt schema', () => {
    const schema = definePromptSchema();
    const invalidData = {
      id: '1',
      projectId: '1',
      name: '', // Invalid name
      prompt: 'Hello {{name}}!',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(() => schema.validateSync(invalidData)).toThrow(yup.ValidationError);
  });
});
