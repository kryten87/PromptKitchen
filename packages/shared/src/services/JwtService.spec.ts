import jwt, { JwtPayload } from 'jsonwebtoken';
import type { User } from '../dtos';
import { JwtService } from './JwtService';

describe('JwtService', () => {
  const secret = 'test-secret-key';
  const jwtService = new JwtService(secret);
  const user: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('generateJwt', () => {
    it('should generate a valid JWT for the user', () => {
      const token = jwtService.generateJwt(user);
      expect(typeof token).toBe('string');
      // Decode using jsonwebtoken to verify payload
      const decoded = jwt.verify(token, secret);
      expect(decoded).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
    });

    it('should set expiration to 7 days', () => {
      const token = jwtService.generateJwt(user);
      const decoded = jwt.decode(token) as JwtPayload;
      expect(decoded.exp! - decoded.iat!).toBeCloseTo(60 * 60 * 24 * 7, -2); // within a few seconds
    });
  });

  describe('verifyJwt', () => {
    it('should verify a valid JWT and return the payload', () => {
      const token = jwtService.generateJwt(user);
      const payload = jwtService.verifyJwt(token);
      expect(payload).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
      expect(typeof payload.iat).toBe('number');
      expect(typeof payload.exp).toBe('number');
    });

    it('should throw if JWT is invalid', () => {
      expect(() => jwtService.verifyJwt('invalid.token.here')).toThrow();
    });

    it('should throw if JWT is expired', () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign({ id: 'x' }, secret, { expiresIn: -1 });
      expect(() => jwtService.verifyJwt(expiredToken)).toThrow();
    });
  });
});
