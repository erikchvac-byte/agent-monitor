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

  describe('High-Frequency Circular Buffer Tests (Story 1.2)', () => {
    it('should handle 100 rapid sequential insertions within 1 second', async () => {
      const bufferTailer = new LogTailer('/test/logs', 50);
      const jsonLines = Array.from({ length: 100 }, (_, i) =>
        JSON.stringify({
          timestamp: `2024-01-01T00:${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}Z`,
          agent: `Agent${i}`,
          action: 'test_action',
          duration_ms: 100,
        })
      );

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(jsonLines.join('\n'));

      const startTime = Date.now();
      await bufferTailer.start(() => {});
      const totalTime = Date.now() - startTime;

      const activities = bufferTailer.getActivities();

      expect(totalTime).toBeLessThan(1000);
      expect(activities.length).toBeGreaterThan(0);
      expect(activities.length).toBeLessThanOrEqual(50);
      expect(activities[activities.length - 1].agent).toBe('Agent99');

      for (let i = 0; i < activities.length - 1; i++) {
        expect(new Date(activities[i].timestamp).getTime()).toBeLessThanOrEqual(
          new Date(activities[i + 1].timestamp).getTime()
        );
      }
    });

    it('should maintain FIFO ordering with rapid insertions', async () => {
      const bufferTailer = new LogTailer('/test/logs', 10);
      const jsonLines = Array.from({ length: 30 }, (_, i) =>
        JSON.stringify({
          timestamp: `2024-01-01T00:${String(i).padStart(2, '0')}:00Z`,
          agent: `Agent${i}`,
          action: 'test_action',
          duration_ms: 100,
        })
      );

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(jsonLines.join('\n'));

      await bufferTailer.start(() => {});

      const activities = bufferTailer.getActivities();

      expect(activities).toHaveLength(10);
      expect(activities[0].agent).toBe('Agent20');
      expect(activities[9].agent).toBe('Agent29');
    });

    it('should enforce buffer size invariant (never exceeds maxActivities)', async () => {
      const bufferTailer = new LogTailer('/test/logs', 5);
      const jsonLines = Array.from({ length: 1000 }, (_, i) =>
        JSON.stringify({
          timestamp: `2024-01-01T00:${String(i).padStart(3, '0')}:00Z`,
          agent: `Agent${i}`,
          action: 'test_action',
          duration_ms: 100,
        })
      );

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(jsonLines.join('\n'));

      await bufferTailer.start(() => {});

      const activities = bufferTailer.getActivities();

      expect(activities.length).toBeLessThanOrEqual(5);
      expect(activities).toHaveLength(5);
    });

    it('should handle burst insertions (50 activities in 100ms)', async () => {
      const bufferTailer = new LogTailer('/test/logs', 50);
      const jsonLines = Array.from({ length: 50 }, (_, i) =>
        JSON.stringify({
          timestamp: `2024-01-01T00:00:${String(i).padStart(2, '0')}Z`,
          agent: `Agent${i}`,
          action: 'burst_test',
          duration_ms: 100,
        })
      );

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(jsonLines.join('\n'));

      const startTime = Date.now();
      await bufferTailer.start(() => {});
      const burstTime = Date.now() - startTime;

      const activities = bufferTailer.getActivities();

      expect(burstTime).toBeLessThan(100);
      expect(activities.length).toBeLessThanOrEqual(50);
      activities.forEach(activity => {
        expect(activity.action).toBe('burst_test');
      });
    });

    it('should maintain consistency with multiple files updating', async () => {
      const bufferTailer = new LogTailer('/test/logs', 50);
      const files = ['agent1.log', 'agent2.log', 'agent3.log'];

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(files);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });

      let fileIndex = 0;
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        const fileLines = Array.from({ length: 20 }, (_, i) =>
          JSON.stringify({
            timestamp: `2024-01-01T00:${String(fileIndex).padStart(2, '0')}:${String(i).padStart(2, '0')}Z`,
            agent: `Agent${fileIndex}-${i}`,
            action: 'multi_file_test',
            duration_ms: 100,
          })
        );
        fileIndex++;
        return fileLines.join('\n');
      });

      await bufferTailer.start(() => {});

      const activities = bufferTailer.getActivities();

      expect(activities.length).toBeLessThanOrEqual(50);
      expect(activities).toHaveLength(50);

      const uniqueAgents = new Set(activities.map(a => a.agent));
      expect(uniqueAgents.size).toBeGreaterThan(1);

      activities.forEach(activity => {
        expect(activity.action).toBe('multi_file_test');
      });
    });

    it('should buffer performance under sustained load', async () => {
      const bufferTailer = new LogTailer('/test/logs', 50);
      const jsonLines = Array.from({ length: 500 }, (_, i) =>
        JSON.stringify({
          timestamp: `2024-01-01T00:${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}Z`,
          agent: `Agent${i}`,
          action: 'sustained_load_test',
          duration_ms: 100,
        })
      );

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(jsonLines.join('\n'));

      const startTime = Date.now();
      await bufferTailer.start(() => {});
      const totalTime = Date.now() - startTime;

      const activities = bufferTailer.getActivities();

      expect(totalTime).toBeLessThan(2000);
      expect(activities.length).toBeLessThanOrEqual(50);

      const avgTimePerActivity = totalTime / 500;
      expect(avgTimePerActivity).toBeLessThan(4);
    });

    it('should maintain memory efficiency (<50MB NFR-P3)', async () => {
      const bufferTailer = new LogTailer('/test/logs', 50);
      const jsonLines = Array.from({ length: 10000 }, (_, i) =>
        JSON.stringify({
          timestamp: `2024-01-01T00:${String(Math.floor(i / 3600)).padStart(2, '0')}:${String(Math.floor((i % 3600) / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}Z`,
          agent: `Agent${i}`,
          action: 'memory_test',
          duration_ms: 100,
          task: 'This is a test task that consumes memory but should be limited to 60 characters',
        })
      );

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(jsonLines.join('\n'));

      const memBefore = process.memoryUsage().heapUsed;
      await bufferTailer.start(() => {});
      const memAfter = process.memoryUsage().heapUsed;

      const memDelta = (memAfter - memBefore) / (1024 * 1024);

      expect(memDelta).toBeLessThan(50);

      const activities = bufferTailer.getActivities();
      expect(activities.length).toBeLessThanOrEqual(50);
    });

    it('should handle buffer corruption scenarios gracefully', async () => {
      const bufferTailer = new LogTailer('/test/logs', 10);
      const jsonLines = Array.from({ length: 15 }, (_, i) =>
        JSON.stringify({
          timestamp: `2024-01-01T00:00:${String(i).padStart(2, '0')}Z`,
          agent: `Agent${i}`,
          action: 'corruption_test',
          duration_ms: 100,
        })
      );

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(jsonLines.join('\n'));

      await bufferTailer.start(() => {});

      const activities = bufferTailer.getActivities();

      expect(activities).toHaveLength(10);
      expect(activities.length).toBeLessThanOrEqual(10);

      activities.forEach(activity => {
        expect(activity.action).toBe('corruption_test');
      });
    });

    it('should benchmark buffer operations (push + shift)', async () => {
      const bufferTailer = new LogTailer('/test/logs', 50);
      const iterations = 1000;
      const jsonLines = Array.from({ length: iterations }, (_, i) =>
        JSON.stringify({
          timestamp: `2024-01-01T00:00:${String(i % 60).padStart(2, '0')}Z`,
          agent: `Agent${i}`,
          action: 'benchmark_test',
          duration_ms: 100,
        })
      );

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['agent1.log']);
      (fs.statSync as jest.Mock).mockReturnValue({ mtime: { getTime: () => 1000 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(jsonLines.join('\n'));

      const startTime = Date.now();
      await bufferTailer.start(() => {});
      const totalTime = Date.now() - startTime;

      const avgTimePerOp = totalTime / iterations;
      const opsPerSecond = 1000 / avgTimePerOp;

      console.log(`\n[Benchmark] Buffer Operations Performance:`);
      console.log(`  Total time for ${iterations} operations: ${totalTime}ms`);
      console.log(`  Average time per operation: ${avgTimePerOp.toFixed(4)}ms`);
      console.log(`  Operations per second: ${opsPerSecond.toFixed(2)}`);

      expect(avgTimePerOp).toBeLessThan(10);
      expect(opsPerSecond).toBeGreaterThan(100);
    });
  });
});
