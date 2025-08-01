import { LLMRequest, LLMService } from './LLMService';

const FAKE_API_KEY = 'sk-test';
const FAKE_BASE_URL = 'http://localhost:9999';

describe('LLMService', () => {
  it('should construct with default model and base URL', () => {
    const svc = new LLMService({ apiKey: FAKE_API_KEY });
    expect(svc).toBeInstanceOf(LLMService);
    // @ts-expect-error: private
    expect(svc.apiBaseUrl).toBe('https://api.openai.com/v1');
    // @ts-expect-error: private
    expect(svc.defaultModel).toBe('gpt-3.5-turbo');
  });

  it('should use custom base URL and model if provided', () => {
    const svc = new LLMService({ apiKey: FAKE_API_KEY, apiBaseUrl: FAKE_BASE_URL, model: 'gpt-4' });
    // @ts-expect-error: private
    expect(svc.apiBaseUrl).toBe(FAKE_BASE_URL);
    // @ts-expect-error: private
    expect(svc.defaultModel).toBe('gpt-4');
  });

  it('should return a stubbed response if OpenAI is not reachable', async () => {
    const svc = new LLMService({ apiKey: FAKE_API_KEY, apiBaseUrl: FAKE_BASE_URL });
    const req: LLMRequest = { prompt: 'Hello world' };
    await expect(svc.completePrompt(req)).rejects.toThrow();
  });

  it('should throw and log error for OpenAI API errors', async () => {
    const svc = new LLMService({ apiKey: 'bad-key', apiBaseUrl: 'https://api.openai.com/v1' });
    const req: LLMRequest = { prompt: 'Test error' };
    await expect(svc.completePrompt(req)).rejects.toThrow();
  });

  // Optionally, you can mock fetch for a successful response
  it('should parse OpenAI API response correctly', async () => {
    const svc = new LLMService({ apiKey: FAKE_API_KEY, apiBaseUrl: FAKE_BASE_URL });
    const fakeFetch = jest.spyOn(require('undici'), 'fetch').mockImplementation(async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Hello AI' } }] }),
    } as any));
    const req: LLMRequest = { prompt: 'Say hi' };
    // @ts-ignore
    const res = await svc.completePrompt(req);
    expect(res.output).toBe('Hello AI');
    fakeFetch.mockRestore();
  });
});
