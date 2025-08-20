import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', function(table: Knex.TableBuilder) {
    table.string('id').primary();
    table.string('email').notNullable().unique();
    table.string('name').notNullable();
    table.string('avatar_url');
    table.string('oauth_provider');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
