import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import chokidar, { type FSWatcher } from 'chokidar';
import { Activity, LogEntry } from './types.js';

export class LogTailer {
  private logsDir: string;
  private activities: Activity[] = [];
  public readonly maxActivities: number;
  private watcher: FSWatcher | null = null;
  private onActivityCallback: ((activity: Activity) => void) | null = null;
  private filePositions: Map<string, number> = new Map();

  constructor(logsDir: string = '../Agents/logs/conversation_logs', maxActivities: number = 50) {
    this.logsDir = path.resolve(logsDir);
    this.maxActivities = maxActivities;
  }

  /**
   * Start watching log files and reading existing entries
   */
  async start(onActivity: (activity: Activity) => void): Promise<void> {
    this.onActivityCallback = onActivity;

    // Check if logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      throw new Error(`Logs directory not found: ${this.logsDir}`);
    }

    // Read existing log files
    await this.readExistingLogs();

    // Watch for new log files and changes
    this.watcher = chokidar.watch(`${this.logsDir}/*.log`, {
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher.on('change', async (filePath: string) => {
      await this.readNewLines(filePath);
    });

    this.watcher.on('add', async (filePath: string) => {
      await this.readNewLines(filePath);
    });
  }

  /**
   * Stop watching log files
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
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

      return activity;
    } catch {
      // Log parse errors to stderr for debugging
      console.error(
        `[${new Date().toISOString()}] [ParseError] Invalid JSON in log line - Verify agent logs are well-formed`
      );
      return null;
    }
  }
}
