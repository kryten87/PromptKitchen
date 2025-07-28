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
