// Simple API client for backend communication
// Handles auth token injection and error handling

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
}
