import * as Ajv from 'ajv';
import * as yup from 'yup';

const ajv = new Ajv.default();

export function validateJsonSchema(json: object): boolean {
  try {
    return ajv.validateSchema(json);
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

// Prompt validation schema
definePromptSchema();
export function definePromptSchema() {
  return yup.object({
    id: yup.string().required(),
    projectId: yup.string().required(),
    name: yup.string().required(),
    prompt: yup.string().required(),
    version: yup.number().required(),
    createdAt: yup.date().required(),
    updatedAt: yup.date().required(),
  });
}

// Add more schemas for PromptHistory, TestSuite, TestCase, etc. as needed
