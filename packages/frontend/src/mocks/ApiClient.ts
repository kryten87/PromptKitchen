import type { ApiClient } from '../ApiClient';

export const createMockApiClient = () => {
  return {
    request: jest.fn()
  } as unknown as ApiClient;
};
