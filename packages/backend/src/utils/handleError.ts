import { FastifyReply } from 'fastify';

export const handleError = (reply: FastifyReply, statusCode: number, error: string | Error, supplemental: Record<string, unknown> = {}) => {
  const message = typeof error === 'string' ? error : (error.message || 'An error occurred');
  const payload = {
    ...supplemental,
    error: message,
  }
  return reply.status(statusCode).send(payload);
};

export const handle404 = (reply: FastifyReply, resource: string = '') => {
  return handleError(reply, 404, `${resource} not found`.trim());
};