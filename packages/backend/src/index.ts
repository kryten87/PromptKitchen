// Load environment variables from .env file if present
import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import { runMigrations } from './db/migrate';

const server = Fastify({
  logger: true,
});

server.get('/', async () => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await runMigrations(); // Run DB migrations before starting server
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
