import knex from 'knex';

const dbFile = process.env.DB_FILE || './dev.sqlite3';

export const promptKitchenDb = knex({
  client: 'sqlite3',
  connection: {
    filename: dbFile,
  },
  useNullAsDefault: true,
});

export { promptKitchenDb as knex };
