import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('test_results', (table) => {
    table.text('details').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('test_results', (table) => {
    table.dropColumn('details');
  });
}
