exports.up = async function(knex) {
  // Only rename if the column exists and is not already snake_case
  const hasColumn = await knex.schema.hasColumn('users', 'avatarUrl');
  if (hasColumn) {
    await knex.schema.table('users', function(table) {
      table.renameColumn('avatarUrl', 'avatar_url');
    });
  }
};

exports.down = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('users', 'avatar_url');
  if (hasColumn) {
    await knex.schema.table('users', function(table) {
      table.renameColumn('avatar_url', 'avatarUrl');
    });
  }
};
