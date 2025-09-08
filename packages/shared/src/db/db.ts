import knex, { Knex } from 'knex';

export interface DatabaseConnectorConfig {
  dbFile?: string;
  postgresHost?: string;
  postgresPort?: number;
  postgresUser?: string;
  postgresPassword?: string;
  postgresDatabase?: string;
}

export class DatabaseConnector {
  public readonly knex: Knex;

  constructor(config: DatabaseConnectorConfig) {
    const {
      dbFile,
      postgresHost,
      postgresPort,
      postgresUser,
      postgresPassword,
      postgresDatabase,
    } = config;

    const usePostgres = postgresHost && postgresUser && postgresPassword && postgresDatabase;

    if (dbFile && usePostgres) {
      throw new Error('Both DB_FILE and POSTGRES connection details are set. Please choose one.');
    }

    if (dbFile) {
      this.knex = knex({
        client: 'sqlite3',
        connection: { filename: dbFile },
        useNullAsDefault: true,
      });
    } else if (usePostgres) {
      this.knex = knex({
        client: 'pg',
        connection: {
          host: postgresHost,
          port: postgresPort,
          user: postgresUser,
          password: postgresPassword,
          database: postgresDatabase,
        },
      });
    } else {
      throw new Error('Either DB_FILE or POSTGRES connection details must be set.');
    }
  }

  async destroy() {
    await this.knex.destroy();
  }
}
