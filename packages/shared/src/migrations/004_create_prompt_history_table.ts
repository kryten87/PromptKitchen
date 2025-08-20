import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('prompt_history', function(table: Knex.TableBuilder) {
    table.string('id').primary();
    table.string('prompt_id').notNullable().references('id').inTable('prompts').onDelete('CASCADE');
    table.text('prompt').notNullable();
    table.integer('version').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('prompt_history');
}
