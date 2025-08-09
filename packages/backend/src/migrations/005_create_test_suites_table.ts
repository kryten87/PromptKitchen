import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('test_suites', function(table: Knex.TableBuilder) {
    table.string('id').primary();
    table.string('prompt_id').notNullable().references('id').inTable('prompts').onDelete('CASCADE');
    table.string('name').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('test_suites');
}
