// packages/backend/src/AuthController.spec.ts
import { User } from '@prompt-kitchen/shared/src/dtos';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { createAuthMiddleware } from '../authMiddleware';
import { registerAuthController } from '../controllers/AuthController';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';

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
  const userRepository: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
  } as unknown as jest.Mocked<UserRepository>;
  const userService = new UserService({
    userRepository,
    jwtSecret,
  });

  it('returns user info for valid JWT', async () => {
    const server = Fastify();
    // Mock findById to return the user
    (userService as unknown as { getUserById: jest.Mock }).getUserById = jest.fn().mockResolvedValue(user);
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
    const userServiceMock = { verifyJwt: jest.fn() };
    const middleware = createAuthMiddleware(userServiceMock as unknown as UserService);
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as FastifyReply;
    // No Authorization header
    await middleware({ headers: {} } as unknown as FastifyRequest, reply);
    expect(reply.status).toHaveBeenCalledWith(401);
    // Invalid Authorization header
    await middleware({ headers: { authorization: 'Invalid' } } as unknown as FastifyRequest, reply);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it('attaches user to request if JWT is valid in middleware', async () => {
    const userServiceMock = { verifyJwt: jest.fn().mockReturnValue({ id: 'user-1' }) };
    const middleware = createAuthMiddleware(userServiceMock as unknown as UserService);
    const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as FastifyReply;
    const request = { headers: { authorization: 'Bearer validtoken' } } as FastifyRequest & { user?: unknown };
    await middleware(request, reply);
    expect((request as { user?: unknown }).user).toEqual({ id: 'user-1' });
  });
});
