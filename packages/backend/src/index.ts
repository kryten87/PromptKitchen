// Load environment variables from .env file if present
import dotenv from 'dotenv';
dotenv.config();

import fastifyOauth2 from '@fastify/oauth2';
import Fastify from 'fastify';
import { registerAuthController } from './AuthController';
import { DatabaseConnector } from './db/db';
import { runMigrations } from './db/migrate';
import { registerTestSuiteRoutes } from './TestSuiteController';
import { UserRepository } from './UserRepository';
import { UserService } from './UserService';

// Patch FastifyInstance type to include googleOAuth2
import type { OAuth2Namespace } from '@fastify/oauth2';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
}

const server = Fastify({
  logger: true,
});

// Dependency injection setup
const dbFile = process.env.DB_FILE || './dev.sqlite3';
const dbConnector = new DatabaseConnector({ filename: dbFile });
const userRepository = new UserRepository(dbConnector);
const userService = new UserService({
  userRepository,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
});

registerAuthController(server, { userService });
registerTestSuiteRoutes(server, dbConnector);

// Register Google OAuth2
server.register(fastifyOauth2, {
  name: 'googleOAuth2',
  scope: ['profile', 'email'],
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID!,
      secret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    auth: fastifyOauth2.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: '/auth/google',
  callbackUri: process.env.GOOGLE_OAUTH_REDIRECT_URL!,
});

// Google OAuth callback route
server.get('/auth/google/callback', async function (request, reply) {
  // The OAuth2Token type is not specific to Google, so we need to cast to any to access access_token
  const token = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request) as any;
  // Fetch user info from Google
  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const userInfo = await userInfoRes.json();
  // TODO: Create or update user in DB here
  // TODO: Issue a JWT for the user and return it to the frontend (not implemented in this step)
  // For now, just redirect to frontend with a placeholder
  reply.redirect('/');
});

server.get('/', async () => {
  return { hello: 'world' };
});

async function start() {
  await runMigrations(dbConnector); // Run DB migrations after connection
  try {
    await server.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
    server.log.info('Server started');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
