export async function up(knex) {
  return knex.schema.createTable('test_results', function(table) {
    table.string('id').primary();
    table.string('test_suite_run_id').notNullable().references('id').inTable('test_suite_runs').onDelete('CASCADE');
    table.string('test_case_id').notNullable().references('id').inTable('test_cases').onDelete('CASCADE');
    table.text('actual_output').notNullable();
    table.string('status').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('test_results');
}
