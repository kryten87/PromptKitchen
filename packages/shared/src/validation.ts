import Ajv from 'ajv';
import * as yup from 'yup';

const ajv = new Ajv();

export function validateJsonSchema(json: object): boolean {
  try {
    const valid = ajv.validateSchema(json);
    if (typeof valid === 'boolean') {
      return valid;
    }
    // This path is not expected for non-async schemas, but handles the union type.
    return false;
  } catch {
    return false;
  }
}

// User validation schema
defineUserSchema();
export function defineUserSchema() {
  return yup.object({
    id: yup.string().required(),
    email: yup.string().email().required(),
    name: yup.string().required(),
    avatarUrl: yup.string().url().optional(),
    createdAt: yup.date().required(),
    updatedAt: yup.date().required(),
  });
}

// Project validation schema
defineProjectSchema();
export function defineProjectSchema() {
  return yup.object({
    id: yup.string().required(),
    userId: yup.string().required(),
    name: yup.string().required(),
    description: yup.string().optional(),
    createdAt: yup.date().required(),
    updatedAt: yup.date().required(),
  });
}

// Model validation schema
defineModelSchema();
export function defineModelSchema() {
  return yup.object({
    id: yup.string().required(),
    name: yup.string().required(),
    isActive: yup.boolean().required(),
    createdAt: yup.date().required(),
    updatedAt: yup.date().required(),
  });
}

// Prompt validation schema
definePromptSchema();
export function definePromptSchema() {
  return yup.object({
    id: yup.string().required(),
    projectId: yup.string().required(),
    name: yup.string().required(),
    prompt: yup.string().required(),
    version: yup.number().required(),
    modelId: yup.string().optional().nullable(),
    createdAt: yup.date().required(),
    updatedAt: yup.date().required(),
  });
}

// Add more schemas for PromptHistory, TestSuite, TestCase, etc. as needed
