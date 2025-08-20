import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Only rename if the column exists and is not already snake_case
  const hasColumn = await knex.schema.hasColumn('users', 'avatarUrl');
  if (hasColumn) {
    await knex.schema.table('users', function(table: Knex.TableBuilder) {
      table.renameColumn('avatarUrl', 'avatar_url');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('users', 'avatar_url');
  if (hasColumn) {
    await knex.schema.table('users', function(table: Knex.TableBuilder) {
      table.renameColumn('avatar_url', 'avatarUrl');
    });
  }
}
