import type { ApiClient } from '../ApiClient';

export const createMockApiClient = () => {
  return {
    request: jest.fn(),
    getModels: jest.fn().mockResolvedValue([]),
    refreshModels: jest.fn().mockResolvedValue(undefined),
  } as unknown as ApiClient;
};
