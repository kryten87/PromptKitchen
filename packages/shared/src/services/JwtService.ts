import * as jwt from 'jsonwebtoken';
import type { User } from '../dtos';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  iat?: number;
  exp?: number;
}

export class JwtService {
  private jwtSecret: string;

  constructor(secret: string) {
    this.jwtSecret = secret;
  }

  /**
   * Generates a JWT for the given user.
   */
  generateJwt(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
    return token;
  }

  /**
   * Verifies a JWT and returns the decoded payload.
   */
  verifyJwt(token: string): JwtPayload {
    return jwt.verify(token, this.jwtSecret) as JwtPayload;
  }
}
