export interface Prompt {
  id: string;
  projectId: string;
  name: string;
  prompt: string;
  version: number;
  modelId: string | null;
  modelName?: string;
  isModelActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
