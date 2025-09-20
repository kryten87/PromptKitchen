// Simple API client for backend communication
// Handles auth token injection and error handling

import type { Model, Prompt } from '../../shared/src/dtos';
import type { SessionContextValue } from './contexts/SessionContextValue';

export class ApiClient {
  private baseUrl = '/api';
  private session: SessionContextValue | null;

  constructor(session?: SessionContextValue | null) {
    this.session = session || null;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.session?.user?.token || localStorage.getItem('sessionToken');
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    // Only set Content-Type if there's a body
    if (options.body) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });
    if (res.status === 401) {
      // Do not redirect during E2E tests
      if (localStorage.getItem('E2E_TEST_MODE') === 'true') {
        throw new Error(`API error: ${res.status}`);
      }

      if (this.session?.setUser) {
        this.session.setUser(null);
      } else {
        localStorage.removeItem('userSession');
        localStorage.removeItem('sessionToken');
      }
      window.location.href = '/login';
      // Prevent further processing by throwing an error
      throw new Error('Session expired, redirecting to login.');
    }

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    // Handle empty responses (like 204 No Content)
    if (res.status === 204) {
      return undefined as T;
    }

    // Check if response has content before trying to parse JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return undefined as T;
    }

    return res.json();
  }

  async createPrompt(
    projectId: string,
    promptData: Partial<Prompt>,
  ): Promise<Prompt> {
    return this.request<Prompt>(`/prompts`, {
      method: 'POST',
      body: JSON.stringify({ ...promptData, projectId }),
    });
  }

  async updatePrompt(
    promptId: string,
    promptData: Partial<Prompt>,
  ): Promise<Prompt> {
    return this.request<Prompt>(`/prompts/${promptId}`, {
      method: 'PUT',
      body: JSON.stringify(promptData),
    });
  }

  async getModels(): Promise<Model[]> {
    return this.request<Model[]>('/models');
  }

  async refreshModels(): Promise<void> {
    return this.request<void>('/models/refresh', {
      method: 'POST',
    });
  }
}
