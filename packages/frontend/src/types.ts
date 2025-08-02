// packages/frontend/src/types.ts
export interface UserSession {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  token: string;
}
