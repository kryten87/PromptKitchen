import path from 'path';
import { DatabaseConnector } from '../src/db/db';

async function migrateUp(dbFile: string) {
  const db = new DatabaseConnector({ filename: dbFile });
  try {
    await db.knex.migrate.latest({
      directory: path.resolve(__dirname, '../migrations'),
      extension: 'ts',
    });
    console.log('Migration up completed.');
  } finally {
    await db.destroy();
  }
}

async function migrateDown(dbFile: string) {
  const db = new DatabaseConnector({ filename: dbFile });
  try {
    await db.knex.migrate.rollback({
      directory: path.resolve(__dirname, '../migrations'),
      extension: 'ts',
    });
    console.log('Migration down (rollback) completed.');
  } finally {
    await db.destroy();
  }
}

async function main() {
  const [,, direction, dbFile] = process.argv;
  if (!direction || !dbFile) {
    console.error('Usage: npm run migrate:[up|down] -- <dbFile>');
    process.exit(1);
  }
  if (direction === 'up') {
    await migrateUp(dbFile);
  } else if (direction === 'down') {
    await migrateDown(dbFile);
  } else {
    console.error('Unknown direction:', direction);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
