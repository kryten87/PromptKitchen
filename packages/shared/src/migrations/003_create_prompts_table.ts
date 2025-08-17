import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('prompts', function(table: Knex.TableBuilder) {
    table.string('id').primary();
    table.string('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('prompt').notNullable();
    table.integer('version').notNullable().defaultTo(1);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('prompts');
}
