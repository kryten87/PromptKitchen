/**
 * @jest-environment jsdom
 */
import { ApiClient } from './ApiClient';

globalThis.fetch = globalThis.fetch || (async () => new Response(JSON.stringify({ foo: 'bar' }), { status: 200 }));

describe('ApiClient', () => {
  beforeAll(() => {
    // Polyfill Response for Node test environment
    globalThis.Response = window.Response;
  });

  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ foo: 'bar' })
    } as unknown as Response)) as typeof fetch;
  });

  it('sends requests with correct headers and returns data', async () => {
    localStorage.setItem('sessionToken', 'abc123');
    const data = await ApiClient.request('/test', { method: 'GET' });
    expect(data).toEqual({ foo: 'bar' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer abc123',
        }),
      })
    );
  });

  it('throws on non-ok response', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({})
    } as unknown as Response);
    await expect(ApiClient.request('/fail')).rejects.toThrow('API error: 500');
  });
});
