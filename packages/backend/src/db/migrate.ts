import path from 'path';
import type { DatabaseConnector } from './db';

export async function runMigrations(db: DatabaseConnector): Promise<void> {
  try {
    await db.knex.migrate.latest({
      directory: path.resolve(__dirname, '../../migrations'),
    });
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
}

export { };

