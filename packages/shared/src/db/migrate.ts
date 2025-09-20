import * as path from 'path';
import type { DatabaseConnector } from '../db/db';

const migrationsConfig = {
  directory: path.resolve(__dirname, '../migrations'),
  extension: 'js',
};

export async function runMigrations(db: DatabaseConnector): Promise<void> {
  try {
    await db.knex.migrate.latest(migrationsConfig);
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
}

export async function rollbackMigrations(db: DatabaseConnector): Promise<void> {
  try {
    await db.knex.migrate.rollback(migrationsConfig);
  } catch (err) {
    console.error('Rollback failed:', err);
    throw err;
  }
}
