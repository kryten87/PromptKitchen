/**
 * @jest-environment jsdom
 */
import { ApiClient } from './ApiClient';
import type { Prompt } from '../../shared/src/dtos';

globalThis.fetch = globalThis.fetch || (async () => new Response(JSON.stringify({ foo: 'bar' }), { status: 200 }));

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeAll(() => {
    // Polyfill Response for Node test environment
    globalThis.Response = window.Response;
  });

  beforeEach(() => {
    apiClient = new ApiClient();
    localStorage.clear();
    globalThis.fetch = jest.fn(async (url, options) => {
      let body: unknown = {};
      if (url.toString().includes('/models')) {
        if (options?.method === 'POST') {
          // refreshModels
          return { ok: true, status: 204, headers: { get: () => null }, json: async () => null } as unknown as Response;
        }
        // getModels
        body = [{ id: '1', name: 'Test Model' }];
      } else if (url.toString().includes('/prompts')) {
        // create/update prompt
        body = { id: '1', ...JSON.parse(options?.body as string) };
      }

      return {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn((name: string) => {
            if (name === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: async () => body,
      } as unknown as Response;
    }) as typeof fetch;
  });

  it('sends requests with correct headers', async () => {
    localStorage.setItem('sessionToken', 'abc123');
    await apiClient.request('/test', { method: 'GET' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer abc123',
        }),
      }),
    );
  });

  it('throws on non-ok response', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: {
        get: jest.fn((name: string) => {
          if (name === 'content-type') return 'application/json';
          return null;
        }),
      },
      json: async () => ({}),
    } as unknown as Response);
    await expect(apiClient.request('/fail')).rejects.toThrow('API error: 500');
  });

  describe('createPrompt', () => {
    it('sends prompt data and returns a new prompt', async () => {
      const promptData: Partial<Prompt> = {
        name: 'Test Prompt',
        prompt: 'This is a test',
        modelId: '1',
      };
      const newPrompt = await apiClient.createPrompt('proj-1', promptData);
      expect(newPrompt.name).toBe('Test Prompt');
      expect(newPrompt.modelId).toBe('1');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/prompts'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ...promptData, projectId: 'proj-1' }),
        }),
      );
    });
  });

  describe('updatePrompt', () => {
    it('sends updated prompt data and returns the updated prompt', async () => {
      const promptData: Partial<Prompt> = {
        name: 'Updated Prompt',
        modelId: '2',
      };
      const updatedPrompt = await apiClient.updatePrompt('prompt-1', promptData);
      expect(updatedPrompt.name).toBe('Updated Prompt');
      expect(updatedPrompt.modelId).toBe('2');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/prompts/prompt-1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(promptData),
        }),
      );
    });
  });

  describe('getModels', () => {
    it('fetches and returns a list of models', async () => {
      const models = await apiClient.getModels();
      expect(models).toEqual([{ id: '1', name: 'Test Model' }]);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/models'),
        expect.any(Object),
      );
    });
  });

  describe('refreshModels', () => {
    it('sends a POST request to refresh models', async () => {
      await apiClient.refreshModels();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/models/refresh'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });
});
