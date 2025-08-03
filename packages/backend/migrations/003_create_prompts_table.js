export async function up(knex) {
  return knex.schema.createTable('prompts', function(table) {
    table.string('id').primary();
    table.string('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('prompt').notNullable();
    table.integer('version').notNullable().defaultTo(1);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('prompts');
}
