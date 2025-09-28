import { DatabaseConnector } from '@prompt-kitchen/shared';
import { KeepAliveService } from './KeepAliveService';

jest.mock('@prompt-kitchen/shared');

interface MockLogger {
  info: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
}

describe('KeepAliveService', () => {
  let mockDbConnector: jest.Mocked<DatabaseConnector>;
  let mockLogger: MockLogger;
  let keepAliveService: KeepAliveService;

  beforeEach(() => {
    mockDbConnector = {
      knex: {
        raw: jest.fn().mockResolvedValue([{ count: 1 }]),
      },
      destroy: jest.fn(),
    } as unknown as jest.Mocked<DatabaseConnector>;

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as MockLogger;

    keepAliveService = new KeepAliveService(mockDbConnector, mockLogger);
    jest.clearAllMocks();
  });

  afterEach(() => {
    keepAliveService.stop();
    jest.clearAllTimers();
  });

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('start', () => {
    it('should start the keep-alive service and log startup message', () => {
      keepAliveService.start();

      expect(mockLogger.info).toHaveBeenCalledWith('Starting database keep-alive service with 24-hour interval');
      expect(mockDbConnector.knex.raw).toHaveBeenCalledWith('SELECT COUNT(*) FROM users');
    });

    it('should not start multiple times', () => {
      keepAliveService.start();
      keepAliveService.start();

      expect(mockLogger.warn).toHaveBeenCalledWith('KeepAliveService is already running');
    });

    it('should execute query every 24 hours', () => {
      keepAliveService.start();
      
      // Clear the initial call
      jest.clearAllMocks();

      // Fast forward 24 hours
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);

      expect(mockDbConnector.knex.raw).toHaveBeenCalledWith('SELECT COUNT(*) FROM users');
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      (mockDbConnector.knex.raw as jest.Mock).mockRejectedValueOnce(error);

      keepAliveService.start();

      // Use real timers for this specific test to allow promise resolution
      jest.useRealTimers();
      await new Promise(resolve => setTimeout(resolve, 10));
      jest.useFakeTimers();

      expect(mockLogger.error).toHaveBeenCalledWith({ error }, 'Failed to execute database keep-alive query');
    });
  });

  describe('stop', () => {
    it('should stop the keep-alive service', () => {
      keepAliveService.start();
      keepAliveService.stop();

      expect(mockLogger.info).toHaveBeenCalledWith('Database keep-alive service stopped');

      // Clear the initial call
      jest.clearAllMocks();

      // Fast forward 24 hours - should not execute query
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);

      expect(mockDbConnector.knex.raw).not.toHaveBeenCalled();
    });

    it('should handle stopping when not running', () => {
      keepAliveService.stop();

      expect(mockLogger.info).not.toHaveBeenCalledWith('Database keep-alive service stopped');
    });
  });
});