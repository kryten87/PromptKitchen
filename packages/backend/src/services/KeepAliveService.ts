import { DatabaseConnector } from '@prompt-kitchen/shared';

interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(context: { error: unknown }, message: string): void;
}

export class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly dbConnector: DatabaseConnector;
  private readonly logger: Logger;

  constructor(dbConnector: DatabaseConnector, logger: Logger) {
    this.dbConnector = dbConnector;
    this.logger = logger;
  }

  start(): void {
    if (this.intervalId) {
      this.logger.warn('KeepAliveService is already running');
      return;
    }

    this.logger.info('Starting database keep-alive service with 24-hour interval');
    
    // Run immediately on startup
    this.performKeepAlive();

    // Set up 24-hour interval (24 * 60 * 60 * 1000 ms)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.performKeepAlive();
    }, twentyFourHours);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.info('Database keep-alive service stopped');
    }
  }

  private async performKeepAlive(): Promise<void> {
    try {
      // Perform a simple SELECT query to keep the database connection alive
      await this.dbConnector.knex.raw('SELECT COUNT(*) FROM users');
      this.logger.info('Database keep-alive query executed successfully');
    } catch (error) {
      this.logger.error({ error }, 'Failed to execute database keep-alive query');
    }
  }
}