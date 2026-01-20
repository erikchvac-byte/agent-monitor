import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import chokidar, { type FSWatcher } from 'chokidar';
import { Activity, LogEntry } from './types.js';
import { logger } from './logger.js';

export class LogTailer {
  private logsDir: string;
  private activities: Activity[] = [];
  public readonly maxActivities: number;
  private watcher: FSWatcher | null = null;
  private onActivityCallback: ((activity: Activity) => void) | null = null;
  private filePositions: Map<string, number> = new Map();
  private parseErrorCount: number = 0;
  private readonly MAX_PARSE_ERRORS = 10;

  constructor(logsDir: string = '../Agents/logs/conversation_logs', maxActivities: number = 50) {
    this.logsDir = path.resolve(logsDir);
    this.maxActivities = maxActivities;
    logger.debug('LogTailer initialized', { logsDir: this.logsDir, maxActivities });
  }

  /**
   * Start watching log files and reading existing entries
   */
  async start(onActivity: (activity: Activity) => void): Promise<void> {
    this.onActivityCallback = onActivity;

    // Check if logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      logger.error('Logs directory not found', { path: this.logsDir });
      throw new Error(`Logs directory not found: ${this.logsDir}`);
    }

    try {
      // Read existing log files
      await this.readExistingLogs();
      logger.info('Loaded existing logs', { count: this.activities.length });

      // Watch for new log files and changes
      this.watcher = chokidar.watch(`${this.logsDir}/*.log`, {
        persistent: true,
        ignoreInitial: true,
      });

      this.watcher.on('change', async (filePath: string) => {
        try {
          await this.readNewLines(filePath);
        } catch (error) {
          logger.error('Error reading file changes', {
            filePath,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      this.watcher.on('add', async (filePath: string) => {
        try {
          logger.info('New log file detected', { filePath });
          await this.readNewLines(filePath);
        } catch (error) {
          logger.error('Error reading new file', {
            filePath,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      this.watcher.on('error', (error: unknown) => {
        logger.error('File watcher error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });

      logger.info('Log tailer started successfully');
    } catch (error) {
      logger.error('Failed to start log tailer', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Stop watching log files
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      logger.info('Log tailer stopped');
    }
  }

  /**
   * Get all activities
   */
  getActivities(): Activity[] {
    return [...this.activities];
  }

  /**
   * Read existing log files on startup
   */
  private async readExistingLogs(): Promise<void> {
    const files = fs.readdirSync(this.logsDir).filter(f => f.endsWith('.log'));

    // Sort by modification time (newest first)
    const sortedFiles = files
      .map(f => ({
        name: f,
        path: path.join(this.logsDir, f),
        mtime: fs.statSync(path.join(this.logsDir, f)).mtime.getTime(),
        size: fs.statSync(path.join(this.logsDir, f)).size,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Read last N lines from each file
    for (const file of sortedFiles) {
      await this.readLastLines(file.path, 20);
      // Track current file position for future updates
      this.filePositions.set(file.path, file.size);
    }

    // Sort activities by timestamp and keep only last maxActivities
    this.activities.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(-this.maxActivities);
    }
  }

  /**
   * Read last N lines from a file
   */
  private async readLastLines(filePath: string, count: number): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content
      .trim()
      .split('\n')
      .filter(l => l.trim());
    const lastLines = lines.slice(-count);

    for (const line of lastLines) {
      this.parseLine(line);
    }
  }

  /**
   * Read new lines from a file (called when file changes)
   */
  private async readNewLines(filePath: string): Promise<void> {
    const lastPosition = this.filePositions.get(filePath) || 0;
    const stats = fs.statSync(filePath);
    const currentPosition = stats.size;

    // If file was truncated, read entire file
    if (currentPosition < lastPosition) {
      this.filePositions.delete(filePath);
      await this.readLastLines(filePath, 20);
      this.filePositions.set(filePath, currentPosition);
      return;
    }

    // If no new data, skip
    if (currentPosition === lastPosition) {
      return;
    }

    // Read only new data
    const fileStream = fs.createReadStream(filePath, {
      encoding: 'utf-8',
      start: lastPosition,
    });

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const lines: string[] = [];
    for await (const line of rl) {
      if (line.trim()) {
        lines.push(line);
      }
    }

    // Update file position
    this.filePositions.set(filePath, currentPosition);

    // Process all new lines
    for (const line of lines) {
      const activity = this.parseLine(line);
      if (activity && this.onActivityCallback) {
        this.onActivityCallback(activity);
      }
    }
  }

  /**
   * Parse a JSONL line into an Activity
   */
  private parseLine(line: string): Activity | null {
    try {
      const entry: LogEntry = JSON.parse(line);

      // Convert LogEntry to Activity
      const activity: Activity = {
        timestamp: entry.timestamp,
        agent: entry.agent,
        action: entry.action,
        status: entry.error ? 'failure' : 'success',
        duration_ms: entry.duration_ms,
        error: entry.error,
      };

      // Extract task from input if available
      if (
        entry.input &&
        typeof entry.input === 'object' &&
        'task' in entry.input &&
        typeof entry.input.task === 'string'
      ) {
        activity.task = entry.input.task.substring(0, 60);
      }

      // Add to activities buffer
      this.activities.push(activity);
      if (this.activities.length > this.maxActivities) {
        this.activities.shift();
      }
      // Reset error counter on successful parse
      this.parseErrorCount = 0;

      return activity;
    } catch (error) {
      this.parseErrorCount++;

      if (this.parseErrorCount <= this.MAX_PARSE_ERRORS) {
        logger.warn('Failed to parse log line', {
          line: line.substring(0, 100),
          error: error instanceof Error ? error.message : 'Unknown error',
          errorCount: this.parseErrorCount,
        });
      }

      if (this.parseErrorCount === this.MAX_PARSE_ERRORS) {
        logger.error('Max parse errors reached, suppressing further warnings', {
          maxErrors: this.MAX_PARSE_ERRORS,
        });
      }

      return null;
    }
  }
}
