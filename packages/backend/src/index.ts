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
  scope: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
  callbackUriParams: {
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  },
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
  server.log.error({ request }, 'incoming request to auth/google/callback');
  const token = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request) as any;
  console.log('........... got token', token);
  if (token) {
    const res = token.token;
    const base64Url = res.id_token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    const decoded = JSON.parse(jsonPayload);
    console.log('..........decoded token', decoded);
  }
  let userInfo;
  // Always try userinfo endpoint first, fallback to id_token if needed
  try {
    const userInfoRes = await fetch('https://openidconnect.googleapis.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    console.log('.............got user info response', userInfoRes);

    userInfo = await userInfoRes.json();
    console.log('.............got user info', userInfo);

    if (!userInfo.email) {
      // If userinfo endpoint fails or doesn't return email, try id_token
      if (token.id_token) {
        const base64Url = token.id_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
        const decoded = JSON.parse(jsonPayload);
        // Only use decoded if it has an email
        if (decoded.email) {
          userInfo = decoded;
        }
      }
    }
  } catch (err) {
    // If fetch fails, fallback to id_token
    console.log('..........caught error');
    console.log('..........checking token', token);
    if (token.id_token) {
      const base64Url = token.id_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
      userInfo = JSON.parse(jsonPayload);
      console.log('..........decoded token', userInfo);
    } else {
      userInfo = {};
    }
  }
  server.log.error({ userInfo }, 'Google OAuth userInfo response');
  if (!userInfo.email) {
    server.log.error({ token }, 'Google OAuth token (no email in userInfo)');
    return reply.status(500).send({ error: 'Google OAuth failed: email not found in user info', userInfo });
  }
  // Create or update user in DB
  const user = await userService.findOrCreateGoogleUser({
    id: userInfo.sub || userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    avatarUrl: userInfo.picture,
  });
  server.log.info({ userInfo, user }, 'Google OAuth callback user info');
  const jwt = userService.generateJwt(user);
  reply.redirect(`/auth/callback?token=${jwt}`);
});

server.get('/', async () => {
  return { hello: 'world' };
});

async function start() {
  await runMigrations(dbConnector); // Run DB migrations after connection
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server started on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
