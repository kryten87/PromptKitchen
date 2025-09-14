import {
  defineModelSchema,
  defineProjectSchema,
  definePromptSchema,
  defineUserSchema,
  validateJsonSchema,
} from './validation';

describe('validation', () => {
  describe('validateJsonSchema', () => {
    it('should return true for a valid schema', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
        },
        required: ['foo'],
      };
      expect(validateJsonSchema(schema)).toBe(true);
    });

    it('should return false for an invalid schema', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'invalid-type' },
        },
      };
      expect(validateJsonSchema(schema)).toBe(false);
    });

    it('should return true for an empty schema', () => {
      // An empty schema is valid and allows any value.
      expect(validateJsonSchema({})).toBe(true);
    });
  });

  describe('defineUserSchema', () => {
    const userSchema = defineUserSchema();

    it('should validate a correct user object', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'http://example.com/avatar.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await expect(userSchema.validate(user)).resolves.toEqual(user);
    });

    it('should fail validation for an invalid user object', async () => {
      const user = { id: 'user-123' }; // Missing required fields
      await expect(userSchema.validate(user)).rejects.toThrow();
    });
  });

  describe('defineProjectSchema', () => {
    const projectSchema = defineProjectSchema();

    it('should validate a correct project object', async () => {
      const project = {
        id: 'proj-123',
        userId: 'user-123',
        name: 'My Project',
        description: 'A test project',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await expect(projectSchema.validate(project)).resolves.toEqual(project);
    });

    it('should fail validation for an invalid project object', async () => {
      const project = { id: 'proj-123' }; // Missing required fields
      await expect(projectSchema.validate(project)).rejects.toThrow();
    });
  });

  describe('defineModelSchema', () => {
    const modelSchema = defineModelSchema();

    it('should validate a correct model object', async () => {
      const model = {
        id: 'model-123',
        name: 'gpt-4',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await expect(modelSchema.validate(model)).resolves.toEqual(model);
    });

    it('should fail validation for an invalid model object', async () => {
      const model = { id: 'model-123' }; // Missing required fields
      await expect(modelSchema.validate(model)).rejects.toThrow();
    });
  });

  describe('definePromptSchema', () => {
    const promptSchema = definePromptSchema();

    it('should validate a correct prompt object with a modelId', async () => {
      const prompt = {
        id: 'prompt-123',
        projectId: 'proj-123',
        name: 'My Prompt',
        prompt: 'Translate to French',
        version: 1,
        modelId: 'model-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await expect(promptSchema.validate(prompt)).resolves.toEqual(prompt);
    });

    it('should allow modelId to be null', async () => {
      const prompt = {
        id: 'prompt-123',
        projectId: 'proj-123',
        name: 'My Prompt',
        prompt: 'Translate to French',
        version: 1,
        modelId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await expect(promptSchema.validate(prompt)).resolves.toEqual(prompt);
    });

    it('should fail validation for an invalid prompt object', async () => {
      const prompt = { id: 'prompt-123' }; // Missing required fields
      await expect(promptSchema.validate(prompt)).rejects.toThrow();
    });
  });
});
