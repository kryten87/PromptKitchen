exports.up = function(knex) {
  return knex.schema.createTable('test_suites', function(table) {
    table.string('id').primary();
    table.string('prompt_id').notNullable().references('id').inTable('prompts').onDelete('CASCADE');
    table.string('name').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('test_suites');
};
