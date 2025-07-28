exports.up = function(knex) {
  return knex.schema.createTable('test_cases', function(table) {
    table.string('id').primary();
    table.string('test_suite_id').notNullable().references('id').inTable('test_suites').onDelete('CASCADE');
    table.json('inputs').notNullable();
    table.text('expected_output').notNullable();
    table.string('run_mode').notNullable();
    table.string('output_type').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('test_cases');
};
