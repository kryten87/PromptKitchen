// Simple API client for backend communication
// Handles auth token injection and error handling

export class ApiClient {
  static baseUrl = '/api'; // Use a static fallback for build/test, Vite will replace in dev

  static async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('sessionToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const res = await fetch(`${ApiClient.baseUrl}${path}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return res.json();
  }
}
