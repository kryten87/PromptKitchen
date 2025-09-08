import knex, { Knex } from 'knex';

export interface DatabaseConnectorConfig {
  dbFile?: string;
  postgresConnectionString?: string;
}

export class DatabaseConnector {
  public readonly knex: Knex;

  constructor(config: DatabaseConnectorConfig) {
    const { dbFile, postgresConnectionString } = config;

    if (dbFile && postgresConnectionString) {
      throw new Error('Both DB_FILE and POSTGRES_CONNECTION_STRING are set. Please choose one.');
    }

    if (dbFile) {
      this.knex = knex({
        client: 'sqlite3',
        connection: { filename: dbFile },
        useNullAsDefault: true,
      });
    } else if (postgresConnectionString) {
      this.knex = knex({
        client: 'pg',
        connection: postgresConnectionString,
      });
    } else {
      throw new Error('Either DB_FILE or POSTGRES_CONNECTION_STRING must be set.');
    }
  }

  async destroy() {
    await this.knex.destroy();
  }
}
