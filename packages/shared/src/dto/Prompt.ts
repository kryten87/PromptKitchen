export interface Prompt {
  id: string;
  projectId: string;
  name: string;
  prompt: string;
  version: number;
  modelId: string | null;
  modelName?: string;
  createdAt: Date;
  updatedAt: Date;
}
