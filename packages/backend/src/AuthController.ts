// packages/backend/src/AuthController.ts
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { UserService } from './UserService';
import { createAuthMiddleware } from './authMiddleware';

export interface AuthControllerDeps {
  userService: UserService;
}

export function registerAuthController(server: FastifyInstance, deps: AuthControllerDeps) {
  // Protect /api/auth/me with JWT middleware
  server.get(
    '/api/auth/me',
    { preHandler: createAuthMiddleware(deps.userService) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // User info is attached to request by middleware
      const payload = (request as any).user;
      const user = await deps.userService.getUserById(payload.id);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.send({ user });
    }
  );

  // Logout (client should just delete token, but endpoint for completeness)
  server.post('/api/auth/logout', async (_request: FastifyRequest, reply: FastifyReply) => {
    // No server-side session to destroy (JWT is stateless)
    return reply.send({ success: true });
  });
}
