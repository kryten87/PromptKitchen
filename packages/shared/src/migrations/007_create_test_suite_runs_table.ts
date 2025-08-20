import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('test_suite_runs', function(table: Knex.TableBuilder) {
    table.string('id').primary();
    table.string('test_suite_id').notNullable().references('id').inTable('test_suites').onDelete('CASCADE');
    table.string('prompt_history_id').notNullable().references('id').inTable('prompt_history').onDelete('CASCADE');
    table.timestamp('run_at').notNullable().defaultTo(knex.fn.now());
    table.string('status').notNullable();
    table.float('pass_percentage');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('test_suite_runs');
}
