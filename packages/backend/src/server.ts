// Load environment variables from .env file if present
import dotenv from 'dotenv';
dotenv.config();

import fastifyOauth2 from '@fastify/oauth2';
import { DatabaseConnector, runMigrations } from '@prompt-kitchen/shared';
import Fastify from 'fastify';
import { loadPKConfig } from './config';
import { registerAuthController } from './controllers/AuthController';
import { registerProjectRoutes } from './controllers/ProjectController';
import { registerPromptRoutes } from './controllers/PromptController';
import { registerTestSuiteRoutes } from './controllers/TestSuiteController';
import { ProjectRepository } from './repositories/ProjectRepository';
import { UserRepository } from './repositories/UserRepository';
import { ProjectService } from './services/ProjectService';
import { PromptService } from './services/PromptService';
import { UserService } from './services/UserService';
import { KeepAliveService } from './services/KeepAliveService';
import { ModelRepository } from './repositories/ModelRepository';
import { LLMService } from './services/LLMService';
import { ModelService } from './services/ModelService';
import { registerModelRoutes } from './controllers/ModelController';

// Patch FastifyInstance type to include googleOAuth2
import type { OAuth2Namespace } from '@fastify/oauth2';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
}


const PK_CONFIG = loadPKConfig();
const server = Fastify({
  logger: true,
});

const dbFile = process.env.DB_FILE;
const postgresHost = process.env.POSTGRES_HOST;
const postgresPort = process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : undefined;
const postgresUser = process.env.POSTGRES_USER;
const postgresPassword = process.env.POSTGRES_PASSWORD;
const postgresDatabase = process.env.POSTGRES_DATABASE;

// Dependency injection setup
const dbConnector = new DatabaseConnector({
  dbFile,
  postgresHost,
  postgresPort,
  postgresUser,
  postgresPassword,
  postgresDatabase,
});
const userRepository = new UserRepository(dbConnector);
const projectRepository = new ProjectRepository(dbConnector);
const userService = new UserService({
  userRepository,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
});
const projectService = new ProjectService(projectRepository);
const promptService = PromptService.factory(dbConnector);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

registerAuthController(server, { userService });
registerTestSuiteRoutes(server, dbConnector);
registerProjectRoutes(server, projectService, userService);
registerPromptRoutes(server, promptService);

// Model selection dependencies
const modelRepository = new ModelRepository(dbConnector);
const llmService = new LLMService({
  apiKey: process.env.OPENAI_API_KEY || '',
  apiBaseUrl: process.env.OPENAI_API_BASE_URL,
  model: process.env.OPENAI_DEFAULT_MODEL,
});
const modelService = new ModelService(modelRepository, llmService);
registerModelRoutes(server, modelService, modelRepository);

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
  server.log.info({ request }, 'incoming request to auth/google/callback');
  const oauth2Token = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
  const idToken = oauth2Token.token.id_token;
  if (!idToken) {
    server.log.error({ oauth2Token }, 'Google OAuth failed: no id_token received');
    return reply.status(500).send({ error: 'Google OAuth failed: no id_token received' });
  }
  // Decode user info from id_token
  let userInfo;
  try {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    userInfo = JSON.parse(jsonPayload);
    server.log.info({ userInfo }, 'Decoded user info from id_token');
  } catch (err) {
    server.log.error({ err, idToken }, 'Failed to decode id_token');
    return reply.status(500).send({ error: 'Google OAuth failed: could not decode id_token' });
  }
  if (!userInfo.email) {
    server.log.error({ userInfo }, 'Google OAuth failed: email not found in id_token');
    return reply.status(500).send({ error: 'Google OAuth failed: email not found in id_token', userInfo });
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
  // Redirect to frontend callback with token
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  server.log.info({ frontendUrl, jwt }, 'Redirecting to frontend OAuth callback');
  reply.redirect(`${frontendUrl}/oauth/callback?token=${jwt}`);
});

server.get('/', async () => {
  return { hello: 'world' };
});

export async function start() {
  try {
    await runMigrations(dbConnector); // Run DB migrations after connection
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server started on port ${port}`);

    try {
      await modelService.refreshModels();
      server.log.info('Model list refreshed on startup');
    } catch (err) {
      server.log.error({ err }, 'Failed to refresh models on startup');
    }

    const refreshIntervalHours = parseInt(process.env.MODEL_REFRESH_INTERVAL_HOURS || '168', 10);
    const refreshIntervalMs = refreshIntervalHours * 60 * 60 * 1000;
    setInterval(async () => {
      try {
        await modelService.refreshModels();
        server.log.info('Model list refreshed by periodic task');
      } catch (err) {
        server.log.error({ err }, 'Failed to refresh models in periodic task');
      }
    }, refreshIntervalMs);
    server.log.info(`Model refresh interval set to ${refreshIntervalHours} hours`);

    // Start database keep-alive service if enabled
    if (PK_CONFIG.KEEP_ALIVE_ENABLED) {
      const keepAliveService = new KeepAliveService(dbConnector, server.log);
      keepAliveService.start();
      server.log.info('Database keep-alive service enabled');
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
