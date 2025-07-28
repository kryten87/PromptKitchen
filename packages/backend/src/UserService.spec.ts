import type { User } from '@prompt-kitchen/shared/src/dtos';
import jwt from 'jsonwebtoken';
import { UserRepository } from './UserRepository';
import { UserService } from './UserService';

describe('UserService', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let userService: UserService;
  const jwtSecret = 'test-secret';
  const user: User = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'http://example.com/avatar.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      // ...other methods if needed
    } as any;
    userService = new UserService({ userRepository, jwtSecret });
  });

  describe('findOrCreateGoogleUser', () => {
    it('returns existing user if found', async () => {
      userRepository.findByEmail.mockResolvedValue(user);
      const result = await userService.findOrCreateGoogleUser({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
      expect(result).toBe(user);
      expect(userRepository.createUser).not.toHaveBeenCalled();
    });

    it('creates user if not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.createUser.mockResolvedValue(user);
      const result = await userService.findOrCreateGoogleUser({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
      expect(userRepository.createUser).toHaveBeenCalledWith({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
      expect(result).toBe(user);
    });
  });

  describe('generateJwt', () => {
    it('generates a valid JWT', () => {
      const token = userService.generateJwt(user);
      const decoded = jwt.verify(token, jwtSecret);
      expect((decoded as any).email).toBe(user.email);
      expect((decoded as any).id).toBe(user.id);
    });
  });

  describe('verifyJwt', () => {
    it('verifies a valid JWT', () => {
      const token = userService.generateJwt(user);
      const decoded = userService.verifyJwt(token);
      expect((decoded as any).email).toBe(user.email);
      expect((decoded as any).id).toBe(user.id);
    });

    it('throws for invalid JWT', () => {
      expect(() => userService.verifyJwt('bad.token')).toThrow();
    });
  });
});
