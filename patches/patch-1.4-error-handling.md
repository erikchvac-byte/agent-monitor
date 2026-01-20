# Patch 1.4: Enhanced Error Handling & Logging

**Purpose**: Add comprehensive error handling, structured logging, and graceful degradation for production reliability.

## Files Changed

### 1. Create `src/logger.ts`

```typescript
/**
 * Structured logging utility for Agent Monitor
 * Outputs to stderr to avoid polluting terminal UI
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static instance: Logger;
  private minLevel: LogLevel;

  private constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      const levelStr = process.env.LOG_LEVEL?.toLowerCase();
      const level =
        {
          debug: LogLevel.DEBUG,
          info: LogLevel.INFO,
          warn: LogLevel.WARN,
          error: LogLevel.ERROR,
        }[levelStr || 'info'] || LogLevel.INFO;

      Logger.instance = new Logger(level);
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (level < this.minLevel) return;

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';

    console.error(`[${timestamp}] [${levelName}] ${message}${metaStr}`);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, meta);
  }
}

export const logger = Logger.getInstance();
```

### 2. Update `src/logTailer.ts`

Add error handling and logging:

```typescript
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

      this.watcher.on('error', (error: Error) => {
        logger.error('File watcher error', { error: error.message });
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
    try {
      const files = fs.readdirSync(this.logsDir).filter(f => f.endsWith('.log'));
      logger.debug('Found log files', { count: files.length });

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
        try {
          await this.readLastLines(file.path, 20);
          // Track current file position for future updates
          this.filePositions.set(file.path, file.size);
        } catch (error) {
          logger.warn('Failed to read log file', {
            path: file.path,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          // Continue with other files
        }
      }

      // Sort activities by timestamp and keep only last maxActivities
      this.activities.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      if (this.activities.length > this.maxActivities) {
        this.activities = this.activities.slice(-this.maxActivities);
      }
    } catch (error) {
      logger.error('Failed to read existing logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
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
    try {
      const lastPosition = this.filePositions.get(filePath) || 0;
      const stats = fs.statSync(filePath);
      const currentPosition = stats.size;

      // If file was truncated, read entire file
      if (currentPosition < lastPosition) {
        logger.warn('Log file truncated, re-reading', { filePath });
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
    } catch (error) {
      logger.error('Error reading new lines', {
        filePath,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Parse a JSONL line into an Activity
   */
  private parseLine(line: string): Activity | null {
    try {
      const entry: LogEntry = JSON.parse(line);

      // Validate required fields
      if (!entry.timestamp || !entry.agent || !entry.action) {
        logger.warn('Invalid log entry: missing required fields', { line: line.substring(0, 100) });
        return null;
      }

      // Convert LogEntry to Activity
      const activity: Activity = {
        timestamp: entry.timestamp,
        agent: entry.agent,
        action: entry.action,
        status: entry.error ? 'failure' : 'success',
        duration_ms: entry.duration_ms || 0,
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
```

### 3. Update `src/App.tsx`

Add error boundary and logging:

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Box, useInput, useApp, Text } from 'ink';
import { LogTailer } from './logTailer.js';
import { NoteWriter } from './notes.js';
import { Activity } from './types.js';
import { Header } from './components/Header.js';
import { ActivityFeed } from './components/ActivityFeed.js';
import { NoteInput } from './components/NoteInput.js';
import { Footer } from './components/Footer.js';
import { logger } from './logger.js';

export const App: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [noteMode, setNoteMode] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Starting monitor...');
  const [error, setError] = useState<string | null>(null);
  const { exit } = useApp();

  const logTailerRef = useRef<LogTailer | null>(null);
  const noteWriterRef = useRef<NoteWriter | null>(null);

  const MAX_ACTIVITIES = 50;

  useEffect(() => {
    // Initialize singletons
    if (!logTailerRef.current) {
      logTailerRef.current = new LogTailer();
    }
    if (!noteWriterRef.current) {
      noteWriterRef.current = new NoteWriter();
    }

    const logTailer = logTailerRef.current;

    const startTailer = async () => {
      try {
        logger.info('Starting Agent Monitor');

        await logTailer.start(activity => {
          setActivities(prev => [...prev, activity].slice(-MAX_ACTIVITIES));
        });

        // Load initial activities
        const initial = logTailer.getActivities();
        setActivities(initial);
        setStatusMessage('Monitoring active');
        logger.info('Monitor started successfully', { initialActivities: initial.length });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setStatusMessage(`Error: ${errorMsg}`);
        setError(errorMsg);
        logger.error('Failed to start monitor', { error: errorMsg });
      }
    };

    startTailer();

    return () => {
      logger.info('Shutting down monitor');
      logTailer.stop();
    };
  }, []);

  useInput(async (input, key) => {
    if (noteMode) {
      // In note mode
      if (key.return) {
        try {
          // Save note
          const noteWriter = noteWriterRef.current;
          if (noteWriter) {
            const activeAgents = noteWriter.getActiveAgents(activities);
            await noteWriter.writeNote(noteText, activeAgents);
            const preview = noteText.substring(0, 40);
            setStatusMessage(`Note saved: "${preview}${noteText.length > 40 ? '...' : ''}"`);
            logger.info('Note saved', { noteLength: noteText.length, agents: activeAgents });
          }
          setNoteText('');
          setNoteMode(false);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          setStatusMessage(`Failed to save note: ${errorMsg}`);
          logger.error('Failed to save note', { error: errorMsg });
        }
      } else if (key.escape) {
        // Cancel note
        setNoteText('');
        setNoteMode(false);
        setStatusMessage('Note cancelled');
        logger.debug('Note cancelled');
      } else if (key.backspace || key.delete) {
        // Delete character
        setNoteText(prev => prev.slice(0, -1));
      } else if (!key.ctrl && !key.meta && input) {
        // Add character
        setNoteText(prev => prev + input);
      }
    } else {
      // Normal mode
      if (input === 'n' || input === 'N') {
        setNoteMode(true);
        setNoteText('');
        setStatusMessage('Type your note (Enter to save, Esc to cancel)');
        logger.debug('Note mode activated');
      } else if (input === 'q' || input === 'Q') {
        logger.info('User requested exit');
        exit();
      } else if (input === '?') {
        setStatusMessage('[N] Note | [Q] Quit | [?] Help');
      }
    }
  });

  // Error state rendering
  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box borderStyle="round" borderColor="red" padding={1} marginBottom={1}>
          <Text bold color="red">ERROR: {error}</Text>
        </Box>
        <Box padding={1}>
          <Text>
            Please check:
            {'\n'}• Log directory exists: ../Agents/logs/conversation_logs
            {'\n'}• You have read permissions
            {'\n'}• Agents are running and generating logs
            {'\n\n'}Press Q to quit
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header statusMessage={statusMessage} />
      <ActivityFeed activities={activities} maxDisplay={15} />
      {noteMode && <NoteInput noteText={noteText} />}
      {!noteMode && <Footer activityCount={activities.length} maxActivities={MAX_ACTIVITIES} />}
    </Box>
  );
};
```

## Application Instructions

1. Create logger.ts with structured logging
2. Update logTailer.ts with comprehensive error handling
3. Update App.tsx with error boundary
4. Test error scenarios:
   - Missing logs directory
   - Malformed JSONL
   - File permission errors
   - File watcher errors

## Verification

```bash
# Test with missing directory
LOG_LEVEL=debug npm start

# Test with malformed logs
echo "invalid json" >> ../Agents/logs/conversation_logs/test.log

# View debug logs
LOG_LEVEL=debug npm start 2>debug.log
```

## Benefits

- **Graceful Degradation**: App continues running despite parse errors
- **Structured Logging**: All errors logged to stderr with context
- **Error Boundary**: User sees helpful error messages
- **Debug Support**: LOG_LEVEL environment variable for troubleshooting
- **Production Ready**: Handles edge cases and validates data
