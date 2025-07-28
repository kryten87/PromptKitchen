// packages/backend/src/AuthController.ts
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { UserService } from './UserService';

export interface AuthControllerDeps {
  userService: UserService;
}

export function registerAuthController(server: FastifyInstance, deps: AuthControllerDeps) {
  // Get current user info from JWT
  server.get('/api/auth/me', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Missing or invalid Authorization header' });
      }
      const token = authHeader.substring('Bearer '.length);
      const payload = deps.userService.verifyJwt(token);
      // Add a method to UserService to fetch user by id
      const user = await deps.userService.getUserById(payload.id);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.send({ user });
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }
  });

  // Logout (client should just delete token, but endpoint for completeness)
  server.post('/api/auth/logout', async (_request: FastifyRequest, reply: FastifyReply) => {
    // No server-side session to destroy (JWT is stateless)
    return reply.send({ success: true });
  });
}
