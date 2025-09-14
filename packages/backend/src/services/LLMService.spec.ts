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
    // Check that the default model was used
    const fetchBody = JSON.parse(mockedFetch.mock.calls[0][1].body);
    expect(fetchBody.model).toBe('gpt-3.5-turbo');
  });

  it('should use the model specified in the request', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Hello from GPT-4' } }] }),
    } as Response);
    const svc = new LLMService({ apiKey: FAKE_API_KEY, apiBaseUrl: FAKE_BASE_URL });
    const req: LLMRequest = { prompt: 'Say hi', model: 'gpt-4-turbo' };
    const res = await svc.completePrompt(req);
    expect(res.output).toBe('Hello from GPT-4');
    // Check that the specified model was used
    const fetchBody = JSON.parse(mockedFetch.mock.calls[0][1].body);
    expect(fetchBody.model).toBe('gpt-4-turbo');
  });

  describe('listModels', () => {
    it('should return a list of model IDs on success', async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { id: 'gpt-3.5-turbo', object: 'model' },
            { id: 'gpt-4', object: 'model' },
          ],
        }),
      } as Response);
      const svc = new LLMService({ apiKey: FAKE_API_KEY, apiBaseUrl: FAKE_BASE_URL });
      const models = await svc.listModels();
      expect(models).toEqual(['gpt-3.5-turbo', 'gpt-4']);
      expect(mockedFetch).toHaveBeenCalledWith(`${FAKE_BASE_URL}/models`, expect.any(Object));
    });

    it('should throw an error if the API call fails', async () => {
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);
      const svc = new LLMService({ apiKey: FAKE_API_KEY, apiBaseUrl: FAKE_BASE_URL });
      await expect(svc.listModels()).rejects.toThrow('OpenAI API error (listModels): 500 Internal Server Error');
    });

    it('should throw an error for an unexpected response structure', async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ unexpected: 'structure' }),
      } as Response);
      const svc = new LLMService({ apiKey: FAKE_API_KEY, apiBaseUrl: FAKE_BASE_URL });
      await expect(svc.listModels()).rejects.toThrow('Unexpected response from OpenAI API (listModels)');
    });
  });
});
