export async function up(knex) {
  return knex.schema.createTable('users', function(table) {
    table.string('id').primary();
    table.string('email').notNullable().unique();
    table.string('name').notNullable();
    table.string('avatar_url');
    table.string('oauth_provider');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('users');
}
