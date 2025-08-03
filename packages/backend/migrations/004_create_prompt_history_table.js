export async function up(knex) {
  return knex.schema.createTable('prompt_history', function(table) {
    table.string('id').primary();
    table.string('prompt_id').notNullable().references('id').inTable('prompts').onDelete('CASCADE');
    table.text('prompt').notNullable();
    table.integer('version').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

export async function down(knex) {
  return knex.schema.dropTableIfExists('prompt_history');
};
