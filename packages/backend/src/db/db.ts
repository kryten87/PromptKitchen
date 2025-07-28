import knex, { Knex } from 'knex';

export interface DatabaseConnectorConfig {
  filename: string;
}

export class DatabaseConnector {
  public readonly knex: Knex;

  constructor(config: DatabaseConnectorConfig) {
    this.knex = knex({
      client: 'sqlite3',
      connection: { filename: config.filename },
      useNullAsDefault: true,
    });
  }

  async destroy() {
    await this.knex.destroy();
  }
}

// For production usage, export a singleton instance using env config
const dbFile = process.env.DB_FILE || './dev.sqlite3';
export const prodDbConnector = new DatabaseConnector({ filename: dbFile });
