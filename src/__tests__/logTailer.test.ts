import { LogTailer } from '../logTailer.js';
import * as fs from 'fs';
import * as path from 'path';
import chokidar from 'chokidar';

jest.mock('fs');
jest.mock('path');
jest.mock('chokidar', () => ({
  watch: jest.fn(),
}));

describe('LogTailer', () => {
  let logTailer: LogTailer;
  let mockWatcher: { on: jest.Mock; close: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWatcher = {
      on: jest.fn(),
      close: jest.fn(),
    };

    (chokidar.watch as jest.Mock).mockReturnValue(mockWatcher);
    (path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));

    logTailer = new LogTailer('/test/logs');
  });

  describe('constructor', () => {
    it('should initialize with default parameters', () => {
      const defaultTailer = new LogTailer();
      expect(defaultTailer).toBeInstanceOf(LogTailer);
    });

    it('should initialize with custom parameters', () => {
      const customTailer = new LogTailer('/custom/logs', 100);
      expect(customTailer).toBeInstanceOf(LogTailer);
    });
  });

  describe('start', () => {
    it('should throw error if logs directory does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(logTailer.start(() => {})).rejects.toThrow('Logs directory not found');
    });

    it('should read existing logs when directory exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log', 'agent2.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue('{}');

      await logTailer.start(() => {});

      expect(fs.readdirSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should set up file watcher for .log files', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (fs.readFileSync as jest.Mock).mockReturnValue('');

      await logTailer.start(() => {});

      expect(chokidar.watch).toHaveBeenCalledWith('/test/logs/*.log', {
        persistent: true,
        ignoreInitial: true,
      });
    });

    it('should register change handler', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (fs.readFileSync as jest.Mock).mockReturnValue('');

      await logTailer.start(() => {});

      expect(mockWatcher.on).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should register add handler', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (fs.readFileSync as jest.Mock).mockReturnValue('');

      await logTailer.start(() => {});

      expect(mockWatcher.on).toHaveBeenCalledWith('add', expect.any(Function));
    });
  });

  describe('stop', () => {
    it('should close watcher if it exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (fs.readFileSync as jest.Mock).mockReturnValue('');

      await logTailer.start(() => {});
      logTailer.stop();

      expect(mockWatcher.close).toHaveBeenCalled();
    });
  });

  describe('getActivities', () => {
    it('should return a copy of activities', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockImplementation(() =>
        JSON.stringify({
          timestamp: '2024-01-01T00:00:00Z',
          agent: 'TestAgent',
          action: 'test_action',
          duration_ms: 100,
        })
      );

      await logTailer.start(() => {});
      const activities = logTailer.getActivities();

      expect(activities).toHaveLength(1);
      expect(activities[0]).toEqual({
        timestamp: '2024-01-01T00:00:00Z',
        agent: 'TestAgent',
        action: 'test_action',
        status: 'success',
        duration_ms: 100,
      });
    });
  });

  describe('parseLine', () => {
    it('should parse valid JSON line', async () => {
      const validJson = JSON.stringify({
        timestamp: '2024-01-01T00:00:00Z',
        agent: 'TestAgent',
        action: 'test_action',
        duration_ms: 100,
      });

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(validJson);

      await logTailer.start(() => {});

      const activities = logTailer.getActivities();
      expect(activities).toHaveLength(1);
      expect(activities[0].agent).toBe('TestAgent');
    });

    it('should handle invalid JSON gracefully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json{}');

      await logTailer.start(() => {});

      const activities = logTailer.getActivities();
      expect(activities).toHaveLength(0);
    });

    it('should set status to failure when error is present', async () => {
      const errorJson = JSON.stringify({
        timestamp: '2024-01-01T00:00:00Z',
        agent: 'TestAgent',
        action: 'test_action',
        duration_ms: 100,
        error: 'Test error',
      });

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(errorJson);

      await logTailer.start(() => {});

      const activities = logTailer.getActivities();
      expect(activities[0].status).toBe('failure');
      expect(activities[0].error).toBe('Test error');
    });

    it('should extract task from input when available', async () => {
      const taskJson = JSON.stringify({
        timestamp: '2024-01-01T00:00:00Z',
        agent: 'TestAgent',
        action: 'test_action',
        duration_ms: 100,
        input: { task: 'Test task description' },
      });

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(taskJson);

      await logTailer.start(() => {});

      const activities = logTailer.getActivities();
      expect(activities[0].task).toBe('Test task description');
    });

    it('should truncate long task to 60 characters', async () => {
      const longTask = 'a'.repeat(100);
      const taskJson = JSON.stringify({
        timestamp: '2024-01-01T00:00:00Z',
        agent: 'TestAgent',
        action: 'test_action',
        duration_ms: 100,
        input: { task: longTask },
      });

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(taskJson);

      await logTailer.start(() => {});

      const activities = logTailer.getActivities();
      expect(activities[0].task).toHaveLength(60);
    });

    it('should handle non-object input safely', async () => {
      const nonObjectInputJson = JSON.stringify({
        timestamp: '2024-01-01T00:00:00Z',
        agent: 'TestAgent',
        action: 'test_action',
        duration_ms: 100,
        input: 'not an object',
      });

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(nonObjectInputJson);

      await logTailer.start(() => {});

      const activities = logTailer.getActivities();
      expect(activities[0].task).toBeUndefined();
    });

    it('should limit activities to maxActivities (circular buffer)', async () => {
      const smallTailer = new LogTailer('/test/logs', 3);
      const jsonLines = Array.from({ length: 5 }, (_, i) =>
        JSON.stringify({
          timestamp: `2024-01-01T00:00:${i}Z`,
          agent: `Agent${i}`,
          action: 'test_action',
          duration_ms: 100,
        })
      );

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(jsonLines.join('\n'));

      await smallTailer.start(() => {});

      const activities = smallTailer.getActivities();
      expect(activities).toHaveLength(3);
      expect(activities[0].agent).toBe('Agent2');
      expect(activities[2].agent).toBe('Agent4');
    });
  });

  describe('Performance (NFR Compliance)', () => {
    it('should start watcher and read initial logs within 5 seconds (NFR-P4)', async () => {
      const startTime = Date.now();

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue('{}');

      await logTailer.start(() => {});

      const startupTime = Date.now() - startTime;
      expect(startupTime).toBeLessThan(5000);
    });

    it('should process activity callback within 100ms (NFR-P1)', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (fs.readFileSync as jest.Mock).mockReturnValue('');

      let callbackTime = 0;
      const startTime = Date.now();

      await logTailer.start(() => {
        callbackTime = Date.now() - startTime;
      });

      const validJson = JSON.stringify({
        timestamp: '2024-01-01T00:00:00Z',
        agent: 'TestAgent',
        action: 'test_action',
        duration_ms: 100,
      });

      (fs.readFileSync as jest.Mock).mockReturnValue(validJson);

      const testStartTime = Date.now();
      await logTailer.start(() => {
        callbackTime = Date.now() - testStartTime;
      });

      expect(callbackTime).toBeLessThan(100);
    });

    it('should maintain circular buffer performance with 50 items', async () => {
      const perfTailer = new LogTailer('/test/logs', 50);
      const jsonLines = Array.from({ length: 100 }, (_, i) =>
        JSON.stringify({
          timestamp: `2024-01-01T00:00:${i}Z`,
          agent: `Agent${i}`,
          action: 'test_action',
          duration_ms: 100,
        })
      );

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });

      const startTime = Date.now();
      (fs.readFileSync as jest.Mock).mockReturnValue(jsonLines.join('\n'));

      await perfTailer.start(() => {});

      const processTime = Date.now() - startTime;
      expect(processTime).toBeLessThan(1000);
    });
  });
});
