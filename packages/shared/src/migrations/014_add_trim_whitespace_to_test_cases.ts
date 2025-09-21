import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('test_cases', (table) => {
    table.boolean('should_trim_whitespace').notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('test_cases', (table) => {
    table.dropColumn('should_trim_whitespace');
  });
}