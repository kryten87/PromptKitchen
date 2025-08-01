// packages/backend/src/AuthController.spec.ts
import { User } from '@prompt-kitchen/shared/src/dtos';
import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { registerAuthController } from './AuthController';
import { UserService } from './UserService';

describe('AuthController', () => {
  const user: User = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'http://avatar',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const jwtSecret = 'test-secret';
  const userService = new UserService({
    userRepository: {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
    } as any,
    jwtSecret,
  });

  it('returns user info for valid JWT', async () => {
    const server = Fastify();
    // Mock findById to return the user
    (userService as any).getUserById = jest.fn().mockResolvedValue(user);
    registerAuthController(server, { userService });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, jwtSecret);
    const response = await server.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).user.id).toBe(user.id);
  });

  it('returns 401 for missing/invalid JWT', async () => {
    const server = Fastify();
    registerAuthController(server, { userService });
    const response = await server.inject({
      method: 'GET',
      url: '/api/auth/me',
    });
    expect(response.statusCode).toBe(401);
  });

  it('logout endpoint always returns success', async () => {
    const server = Fastify();
    registerAuthController(server, { userService });
    const response = await server.inject({
      method: 'POST',
      url: '/api/auth/logout',
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).success).toBe(true);
  });

  it('returns 401 if JWT is missing or invalid in middleware', async () => {
    const { createAuthMiddleware } = require('./authMiddleware');
    const userServiceMock = { verifyJwt: jest.fn() };
    const middleware = createAuthMiddleware(userServiceMock as any);
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    // No Authorization header
    await middleware({ headers: {} } as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(401);
    // Invalid Authorization header
    await middleware({ headers: { authorization: 'Invalid' } } as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it('attaches user to request if JWT is valid in middleware', async () => {
    const { createAuthMiddleware } = require('./authMiddleware');
    const userServiceMock = { verifyJwt: jest.fn().mockReturnValue({ id: 'user-1' }) };
    const middleware = createAuthMiddleware(userServiceMock as any);
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const request: any = { headers: { authorization: 'Bearer validtoken' } };
    await middleware(request, reply as any);
    expect(request.user).toEqual({ id: 'user-1' });
  });
});
