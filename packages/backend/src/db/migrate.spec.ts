import fs from 'fs';
import { Knex } from 'knex';
import path from 'path';
import { DatabaseConnector } from './db';
import { runMigrations } from './migrate';

const TMP_DB = '/tmp/test-migrate.sqlite3';

function columnExists(knex: Knex, table: string, column: string): Promise<boolean> {
  return knex.raw(`PRAGMA table_info(${table})`).then((res: unknown) => {
    // Knex returns { [key: string]: unknown[] } for sqlite3
    let rows: unknown = res;
    if (res && typeof res === 'object') {
      if (Array.isArray((res as Record<string, unknown[]>)[0])) {
        rows = (res as Record<string, unknown[]>)[0];
      } else if (Array.isArray((res as Record<string, unknown[]>).rows)) {
        rows = (res as Record<string, unknown[]>).rows;
      }
    }
    if (Array.isArray(rows)) {
      return rows.some((row) => typeof row === 'object' && row !== null && 'name' in row && (row as { name: string }).name === column);
    }
    return false;
  });
}

describe('Migration 010 & 011: assertions/details columns', () => {
  let db: DatabaseConnector;

  beforeEach(async () => {
    if (fs.existsSync(TMP_DB)) {
      fs.unlinkSync(TMP_DB);
    }
    db = new DatabaseConnector({ filename: TMP_DB });
  });

  afterEach(async () => {
    await db.destroy();
    if (fs.existsSync(TMP_DB)) {
      fs.unlinkSync(TMP_DB);
    }
  });

  it('runs up/down idempotently and verifies columns', async () => {
    // Run up migrations
    await runMigrations(db);
    // 010: test_cases.assertions
    expect(await columnExists(db.knex, 'test_cases', 'assertions')).toBe(true);
    // 011: test_results.details
    expect(await columnExists(db.knex, 'test_results', 'details')).toBe(true);

    // Run up again (idempotent)
    await expect(runMigrations(db)).resolves.toBeUndefined();

    // Rollback all migrations
    await db.knex.migrate.rollback({ directory: path.resolve(__dirname, '../migrations'), extension: 'ts' });
    // Columns should not exist
    expect(await columnExists(db.knex, 'test_cases', 'assertions')).toBe(false);
    expect(await columnExists(db.knex, 'test_results', 'details')).toBe(false);

    // Rollback again (idempotent)
    await expect(db.knex.migrate.rollback({ directory: path.resolve(__dirname, '../migrations'), extension: 'ts' })).resolves.toBeDefined();
  });
});
