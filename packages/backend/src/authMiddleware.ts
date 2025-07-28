// packages/backend/src/authMiddleware.ts
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UserService } from './UserService';

export function createAuthMiddleware(userService: UserService) {
  return async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid Authorization header' });
    }
    try {
      const token = authHeader.substring('Bearer '.length);
      const payload = userService.verifyJwt(token);
      // Attach user info to request for downstream handlers
      (request as any).user = payload;
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }
  };
}
