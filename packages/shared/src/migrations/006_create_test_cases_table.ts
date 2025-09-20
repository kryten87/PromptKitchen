import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('test_cases', function(table: Knex.TableBuilder) {
    table.string('id').primary();
    table.string('test_suite_id').notNullable().references('id').inTable('test_suites').onDelete('CASCADE');
    table.json('inputs').notNullable();
    table.text('expected_output').notNullable();
    table.string('run_mode').notNullable();
    table.string('output_type').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('test_cases');
}
