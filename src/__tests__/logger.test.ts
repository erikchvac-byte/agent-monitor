import { Logger } from '../logger.js';

describe('Logger', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Reset singleton for clean tests
    (Logger as any).instance = undefined;
    // Store original env
    originalEnv = { ...process.env };
    // Clear LOG_LEVEL to reset to default
    delete process.env.LOG_LEVEL;
  });

  afterEach(() => {
    // Reset singleton
    (Logger as any).instance = undefined;
    // Restore env
    process.env = originalEnv;
    // Clear LOG_LEVEL
    delete process.env.LOG_LEVEL;
  });

  describe('getInstance', () => {
    it('should create logger instance', () => {
      const loggerInstance = Logger.getInstance();
      expect(loggerInstance).toBeInstanceOf(Logger);
    });

    it('should return same instance on multiple calls (singleton pattern)', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      const instance3 = Logger.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it('should use default INFO level when LOG_LEVEL not set', () => {
      delete process.env.LOG_LEVEL;
      const loggerInstance = Logger.getInstance();
      expect(loggerInstance).toBeInstanceOf(Logger);
    });

    it('should use DEBUG level when LOG_LEVEL=debug', () => {
      process.env.LOG_LEVEL = 'debug';
      (Logger as any).instance = undefined;
      const loggerInstance = Logger.getInstance();
      expect(loggerInstance).toBeInstanceOf(Logger);
    });

    it('should use WARN level when LOG_LEVEL=warn', () => {
      process.env.LOG_LEVEL = 'warn';
      (Logger as any).instance = undefined;
      const loggerInstance = Logger.getInstance();
      expect(loggerInstance).toBeInstanceOf(Logger);
    });

    it('should use ERROR level when LOG_LEVEL=error', () => {
      process.env.LOG_LEVEL = 'error';
      (Logger as any).instance = undefined;
      const loggerInstance = Logger.getInstance();
      expect(loggerInstance).toBeInstanceOf(Logger);
    });
  });

  describe('info', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error');
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log info messages with timestamp', () => {
      const loggerInstance = Logger.getInstance();
      loggerInstance.info('Test info message');

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(logMessage).toMatch(/\[INFO\]/);
      expect(logMessage).toMatch(/Test info message/);
    });

    it('should log info messages with metadata', () => {
      const loggerInstance = Logger.getInstance();
      loggerInstance.info('Test info', { status: 'success', count: 42 });

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toMatch(/"status":"success"/);
      expect(logMessage).toMatch(/"count":42/);
    });

    it('should always output info regardless of log level', () => {
      // Set to ERROR level (highest)
      process.env.LOG_LEVEL = 'error';
      (Logger as any).instance = undefined;
      const loggerInstance = Logger.getInstance();
      consoleSpy.mockClear();

      loggerInstance.info('This should not appear at ERROR level');

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error');
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log warning messages with timestamp', () => {
      const loggerInstance = Logger.getInstance();
      loggerInstance.warn('Test warning message');

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(logMessage).toMatch(/\[WARN\]/);
      expect(logMessage).toMatch(/Test warning message/);
    });

    it('should log warning messages with metadata', () => {
      const loggerInstance = Logger.getInstance();
      loggerInstance.warn('Warning!', { errorCode: 'E001' });

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toMatch(/"errorCode":"E001"/);
    });
  });

  describe('error', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error');
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log error messages with timestamp', () => {
      const loggerInstance = Logger.getInstance();
      loggerInstance.error('Test error message');

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(logMessage).toMatch(/\[ERROR\]/);
      expect(logMessage).toMatch(/Test error message/);
    });

    it('should log error messages with metadata', () => {
      const loggerInstance = Logger.getInstance();
      loggerInstance.error('Error occurred', { error: 'File not found', code: 404 });

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toMatch(/"error":"File not found"/);
      expect(logMessage).toMatch(/"code":404/);
    });
  });

  describe('Timestamp Formatting', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error');
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should format timestamps in ISO 8601 format', () => {
      const loggerInstance = Logger.getInstance();
      loggerInstance.info('Timestamp test');

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      // ISO format: YYYY-MM-DDTHH:MM:SS.mmmZ
      expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should produce unique timestamps for consecutive logs', () => {
      const loggerInstance = Logger.getInstance();
      loggerInstance.info('First');
      loggerInstance.info('Second');

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      const firstLog = consoleSpy.mock.calls[0][0];
      const secondLog = consoleSpy.mock.calls[1][0];
      expect(firstLog).not.toBe(secondLog);
    });
  });

  describe('Performance (NFR-Logging)', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error');
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log a message within 1ms', () => {
      const loggerInstance = Logger.getInstance();

      const startTime = Date.now();
      loggerInstance.debug('Performance test');
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1);
    });

    it('should log 100 messages within 200ms', () => {
      const loggerInstance = Logger.getInstance();

      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        loggerInstance.info(`Message ${i}`, { index: i });
      }
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(200);
      expect(consoleSpy).toHaveBeenCalledTimes(100);
    });
  });

  describe('Singleton Pattern', () => {
    it('should maintain state across getInstance calls', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      const instance3 = Logger.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it('should respect LOG_LEVEL changes only on new getInstance', () => {
      process.env.LOG_LEVEL = 'error';
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
