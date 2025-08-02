import { fetch } from 'undici';
import { LLMRequest, LLMService } from '../services/LLMService';

jest.mock('undici', () => ({
  fetch: jest.fn(),
}));

const mockedFetch = fetch as jest.Mock;

const FAKE_API_KEY = 'sk-test';
const FAKE_BASE_URL = 'http://localhost:9999';

describe('LLMService', () => {
  beforeEach(() => {
    mockedFetch.mockClear();
  });

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
    mockedFetch.mockRejectedValue(new Error('fetch failed'));
    const svc = new LLMService({ apiKey: FAKE_API_KEY, apiBaseUrl: FAKE_BASE_URL });
    const req: LLMRequest = { prompt: 'Hello world' };
    await expect(svc.completePrompt(req)).rejects.toThrow(/fetch failed/);
  });

  it('should throw and log error for OpenAI API errors', async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => '{"error": {"message": "Incorrect API key provided: bad-key."}}',
      json: async () => ({}),
    } as Response);
    const svc = new LLMService({ apiKey: 'bad-key', apiBaseUrl: 'https://api.openai.com/v1' });
    const req: LLMRequest = { prompt: 'Test error' };
    await expect(svc.completePrompt(req)).rejects.toThrow(/OpenAI API error: 401/);
  });

  it('should parse OpenAI API response correctly', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Hello AI' } }] }),
    } as Response);
    const svc = new LLMService({ apiKey: FAKE_API_KEY, apiBaseUrl: FAKE_BASE_URL });
    const req: LLMRequest = { prompt: 'Say hi' };
    const res = await svc.completePrompt(req);
    expect(res.output).toBe('Hello AI');
  });
});
