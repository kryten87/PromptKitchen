import path from 'path';
import { promptKitchenDb } from './db';

export async function runMigrations(): Promise<void> {
  try {
    await promptKitchenDb.migrate.latest({
      directory: path.resolve(__dirname, '../../migrations'),
    });
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

export { };

