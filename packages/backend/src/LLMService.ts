// LLMService.ts
// Abstraction for connecting to OpenAI API (or other LLMs in the future)

export interface LLMServiceOptions {
  apiKey: string;
  apiBaseUrl?: string;
}

export interface LLMRequest {
  prompt: string;
  // Add more fields as needed (e.g., model, temperature)
}

export interface LLMResponse {
  output: string;
}

export class LLMService {
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;

  constructor(options: LLMServiceOptions) {
    this.apiKey = options.apiKey;
    this.apiBaseUrl = options.apiBaseUrl || 'https://api.openai.com/v1';
  }

  async completePrompt(request: LLMRequest): Promise<LLMResponse> {
    // For now, just a stub. Real implementation would call OpenAI API.
    // Replace with fetch to OpenAI API as needed.
    return { output: `LLM output for: ${request.prompt}` };
  }
}
