// LLMService.ts
// Abstraction for connecting to OpenAI API (or other LLMs in the future)

import { fetch } from 'undici';

export interface LLMServiceOptions {
  apiKey: string;
  apiBaseUrl?: string;
  model?: string;
}

export interface LLMRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  output: string;
  raw?: unknown;
}

export class LLMService {
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;
  private readonly defaultModel: string;

  constructor(options: LLMServiceOptions) {
    this.apiKey = options.apiKey;
    this.apiBaseUrl = options.apiBaseUrl || 'https://api.openai.com/v1';
    this.defaultModel = options.model || 'gpt-3.5-turbo';
  }

  /**
   * Fetches the list of available model IDs from the OpenAI API.
   * @returns Promise<string[]> Array of model IDs
   */
  async listModels(): Promise<string[]> {
    const url = `${this.apiBaseUrl}/models`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`OpenAI API error (listModels): ${res.status} ${error}`);
    }
    const data = await res.json() as { data: Array<{ id: string }> };
    if (!data || !Array.isArray(data.data)) {
      throw new Error('Unexpected response from OpenAI API (listModels)');
    }
    // Only return model IDs (strings)
    return data.data.map((model) => model.id);
  }

  /**
   * Executes a prompt using the specified model (or default).
   * @param request LLMRequest
   * @returns LLMResponse
   */
  async completePrompt(request: LLMRequest): Promise<LLMResponse> {
    const model = request.model || this.defaultModel;
    const url = `${this.apiBaseUrl}/chat/completions`;
    const body = {
      model,
      messages: [
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 512
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${error}`);
    }
    const data: unknown = await res.json();
    // Type assertion because fetch returns unknown
    const output =
      typeof data === 'object' &&
      data !== null &&
      'choices' in data &&
      Array.isArray((data as { choices?: unknown }).choices) &&
      (data as { choices: Array<{ message?: { content?: string } }> }).choices.length > 0 &&
      (data as { choices: Array<{ message?: { content?: string } }> }).choices[0].message &&
      typeof (data as { choices: Array<{ message: { content?: string } }> }).choices[0].message.content === 'string'
        ? (data as { choices: Array<{ message: { content: string } }> }).choices[0].message.content
        : '';
    return { output, raw: data };
  }
}

