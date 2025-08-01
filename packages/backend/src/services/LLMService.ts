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
  raw?: any;
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
    try {
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
        // Log error for debugging
        console.error('OpenAI API error:', res.status, error);
        throw new Error(`OpenAI API error: ${res.status} ${error}`);
      }
      const data = await res.json();
      // Type assertion because fetch returns unknown
      const output = (data as any).choices?.[0]?.message?.content ?? '';
      return { output, raw: data };
    } catch (err) {
      // Log error for debugging
      console.error('LLMService.completePrompt error:', err);
      throw err;
    }
  }
}
