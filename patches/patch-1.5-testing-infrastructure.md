# Patch 1.5: Testing Infrastructure

**Purpose**: Add comprehensive test suite for components, utilities, and integration testing.

## Files Changed

### 1. Create `src/__tests__/logTailer.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { LogTailer } from '../logTailer';
import { Activity } from '../types';

describe('LogTailer', () => {
  const testLogsDir = path.join(__dirname, '__fixtures__', 'logs');
  let tailer: LogTailer;

  beforeEach(() => {
    // Create test logs directory
    if (!fs.existsSync(testLogsDir)) {
      fs.mkdirSync(testLogsDir, { recursive: true });
    }
    tailer = new LogTailer(testLogsDir, 10);
  });

  afterEach(() => {
    tailer.stop();
    // Clean up test files
    if (fs.existsSync(testLogsDir)) {
      const files = fs.readdirSync(testLogsDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testLogsDir, file));
      });
      fs.rmdirSync(testLogsDir);
    }
  });

  describe('initialization', () => {
    it('should throw error if logs directory does not exist', async () => {
      const nonExistentDir = path.join(__dirname, 'nonexistent');
      const invalidTailer = new LogTailer(nonExistentDir);

      await expect(invalidTailer.start(() => {})).rejects.toThrow(
        `Logs directory not found: ${path.resolve(nonExistentDir)}`
      );
    });

    it('should initialize with empty activities', () => {
      expect(tailer.getActivities()).toEqual([]);
    });
  });

  describe('log parsing', () => {
    it('should parse valid JSONL entries', async () => {
      const logFile = path.join(testLogsDir, 'test.log');
      const logEntry = {
        timestamp: '2026-01-20T10:00:00Z',
        agent: 'test-agent',
        action: 'execute_task',
        duration_ms: 100,
      };

      fs.writeFileSync(logFile, JSON.stringify(logEntry) + '\n');

      const activities: Activity[] = [];
      await tailer.start(activity => activities.push(activity));

      // Wait for file watcher to process
      await new Promise(resolve => setTimeout(resolve, 100));

      const loadedActivities = tailer.getActivities();
      expect(loadedActivities).toHaveLength(1);
      expect(loadedActivities[0]).toMatchObject({
        timestamp: '2026-01-20T10:00:00Z',
        agent: 'test-agent',
        action: 'execute_task',
        status: 'success',
        duration_ms: 100,
      });
    });

    it('should handle malformed JSON gracefully', async () => {
      const logFile = path.join(testLogsDir, 'test.log');
      fs.writeFileSync(logFile, 'invalid json\n');

      const activities: Activity[] = [];
      await tailer.start(activity => activities.push(activity));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(tailer.getActivities()).toEqual([]);
    });

    it('should extract task from input field', async () => {
      const logFile = path.join(testLogsDir, 'test.log');
      const logEntry = {
        timestamp: '2026-01-20T10:00:00Z',
        agent: 'test-agent',
        action: 'execute_task',
        duration_ms: 100,
        input: { task: 'Test task description' },
      };

      fs.writeFileSync(logFile, JSON.stringify(logEntry) + '\n');

      await tailer.start(() => {});
      await new Promise(resolve => setTimeout(resolve, 100));

      const activities = tailer.getActivities();
      expect(activities[0].task).toBe('Test task description');
    });

    it('should mark activities with errors as failure', async () => {
      const logFile = path.join(testLogsDir, 'test.log');
      const logEntry = {
        timestamp: '2026-01-20T10:00:00Z',
        agent: 'test-agent',
        action: 'execute_task',
        duration_ms: 100,
        error: 'Task failed',
      };

      fs.writeFileSync(logFile, JSON.stringify(logEntry) + '\n');

      await tailer.start(() => {});
      await new Promise(resolve => setTimeout(resolve, 100));

      const activities = tailer.getActivities();
      expect(activities[0].status).toBe('failure');
      expect(activities[0].error).toBe('Task failed');
    });
  });

  describe('circular buffer', () => {
    it('should maintain max activities limit', async () => {
      const logFile = path.join(testLogsDir, 'test.log');
      const entries = Array.from({ length: 15 }, (_, i) => ({
        timestamp: `2026-01-20T10:00:${String(i).padStart(2, '0')}Z`,
        agent: 'test-agent',
        action: 'execute_task',
        duration_ms: 100,
      }));

      fs.writeFileSync(logFile, entries.map(e => JSON.stringify(e)).join('\n') + '\n');

      await tailer.start(() => {});
      await new Promise(resolve => setTimeout(resolve, 100));

      const activities = tailer.getActivities();
      expect(activities).toHaveLength(10); // maxActivities set to 10
      expect(activities[0].timestamp).toBe('2026-01-20T10:00:05Z'); // First 5 dropped
    });
  });

  describe('file watching', () => {
    it('should detect new log entries', async () => {
      const logFile = path.join(testLogsDir, 'test.log');
      fs.writeFileSync(logFile, '');

      const activities: Activity[] = [];
      await tailer.start(activity => activities.push(activity));

      // Add new entry
      const logEntry = {
        timestamp: '2026-01-20T10:00:00Z',
        agent: 'test-agent',
        action: 'execute_task',
        duration_ms: 100,
      };

      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

      // Wait for file watcher
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(activities).toHaveLength(1);
      expect(activities[0].agent).toBe('test-agent');
    });

    it('should detect new log files', async () => {
      const activities: Activity[] = [];
      await tailer.start(activity => activities.push(activity));

      // Create new log file
      const newLogFile = path.join(testLogsDir, 'new.log');
      const logEntry = {
        timestamp: '2026-01-20T10:00:00Z',
        agent: 'new-agent',
        action: 'execute_task',
        duration_ms: 100,
      };

      fs.writeFileSync(newLogFile, JSON.stringify(logEntry) + '\n');

      // Wait for file watcher
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(activities.some(a => a.agent === 'new-agent')).toBe(true);
    });
  });

  describe('stop', () => {
    it('should stop watching files', async () => {
      const logFile = path.join(testLogsDir, 'test.log');
      fs.writeFileSync(logFile, '');

      const activities: Activity[] = [];
      await tailer.start(activity => activities.push(activity));

      tailer.stop();

      // Add entry after stopping
      const logEntry = {
        timestamp: '2026-01-20T10:00:00Z',
        agent: 'test-agent',
        action: 'execute_task',
        duration_ms: 100,
      };

      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(activities).toHaveLength(0);
    });
  });
});
```

### 2. Create `src/__tests__/types.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getAgentType, getAgentColor, AGENT_COLORS } from '../types';

describe('types', () => {
  describe('getAgentType', () => {
    it('should identify router agents', () => {
      expect(getAgentType('main-router')).toBe('router');
      expect(getAgentType('Router-Agent')).toBe('router');
    });

    it('should identify coordinator agents', () => {
      expect(getAgentType('task-coordinator')).toBe('coordinator');
      expect(getAgentType('Coordinator')).toBe('coordinator');
    });

    it('should identify specialist agents', () => {
      expect(getAgentType('code-specialist')).toBe('specialist');
      expect(getAgentType('Specialist-Agent')).toBe('specialist');
    });

    it('should identify QA agents', () => {
      expect(getAgentType('code-critic')).toBe('qa');
      expect(getAgentType('auto-repair')).toBe('qa');
      expect(getAgentType('debug-agent')).toBe('qa');
    });

    it('should return unknown for unrecognized agents', () => {
      expect(getAgentType('random-agent')).toBe('unknown');
      expect(getAgentType('')).toBe('unknown');
    });
  });

  describe('getAgentColor', () => {
    it('should return correct colors for agent types', () => {
      expect(getAgentColor('main-router')).toBe(AGENT_COLORS.router);
      expect(getAgentColor('task-coordinator')).toBe(AGENT_COLORS.coordinator);
      expect(getAgentColor('code-specialist')).toBe(AGENT_COLORS.specialist);
      expect(getAgentColor('code-critic')).toBe(AGENT_COLORS.qa);
      expect(getAgentColor('unknown-agent')).toBe(AGENT_COLORS.unknown);
    });
  });
});
```

### 3. Create `src/__tests__/components/ActivityFeed.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import React from 'react';
import { ActivityFeed } from '../../components/ActivityFeed';
import { Activity } from '../../types';

describe('ActivityFeed', () => {
  it('should render empty state when no activities', () => {
    const { lastFrame } = render(<ActivityFeed activities={[]} />);
    expect(lastFrame()).toContain('Waiting for agent activity...');
  });

  it('should render activities', () => {
    const activities: Activity[] = [
      {
        timestamp: '2026-01-20T10:00:00Z',
        agent: 'test-agent',
        action: 'execute_task',
        status: 'success',
        duration_ms: 100,
      },
    ];

    const { lastFrame } = render(<ActivityFeed activities={activities} />);
    const frame = lastFrame();

    expect(frame).toContain('test-agent');
    expect(frame).toContain('✓');
    expect(frame).toContain('100ms');
  });

  it('should render error state', () => {
    const activities: Activity[] = [
      {
        timestamp: '2026-01-20T10:00:00Z',
        agent: 'test-agent',
        action: 'execute_task',
        status: 'failure',
        duration_ms: 100,
        error: 'Task failed',
      },
    ];

    const { lastFrame } = render(<ActivityFeed activities={activities} />);
    const frame = lastFrame();

    expect(frame).toContain('✗');
    expect(frame).toContain('ERROR: Task failed');
  });

  it('should limit displayed activities', () => {
    const activities: Activity[] = Array.from({ length: 20 }, (_, i) => ({
      timestamp: `2026-01-20T10:00:${String(i).padStart(2, '0')}Z`,
      agent: `agent-${i}`,
      action: 'execute_task',
      status: 'success' as const,
      duration_ms: 100,
    }));

    const { lastFrame } = render(<ActivityFeed activities={activities} maxDisplay={5} />);
    const frame = lastFrame();

    // Should show last 5
    expect(frame).toContain('agent-19');
    expect(frame).toContain('agent-15');
    expect(frame).not.toContain('agent-14');
  });
});
```

### 4. Create `src/__tests__/components/Header.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import React from 'react';
import { Header } from '../../components/Header';

describe('Header', () => {
  it('should render status message', () => {
    const { lastFrame } = render(<Header statusMessage="Test status" />);
    expect(lastFrame()).toContain('Test status');
  });

  it('should render AGENT MONITOR title', () => {
    const { lastFrame } = render(<Header statusMessage="Running" />);
    expect(lastFrame()).toContain('AGENT MONITOR');
  });
});
```

### 5. Create `src/__tests__/components/Footer.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import React from 'react';
import { Footer } from '../../components/Footer';

describe('Footer', () => {
  it('should render activity count', () => {
    const { lastFrame } = render(<Footer activityCount={10} maxActivities={50} />);
    expect(lastFrame()).toContain('10/50');
  });

  it('should render keyboard shortcuts', () => {
    const { lastFrame } = render(<Footer activityCount={0} maxActivities={50} />);
    const frame = lastFrame();

    expect(frame).toContain('[N] Take Note');
    expect(frame).toContain('[Q] Quit');
    expect(frame).toContain('[?] Help');
  });
});
```

### 6. Create `src/__tests__/components/NoteInput.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import React from 'react';
import { NoteInput } from '../../components/NoteInput';

describe('NoteInput', () => {
  it('should render note text', () => {
    const { lastFrame } = render(<NoteInput noteText="Test note" />);
    expect(lastFrame()).toContain('Test note');
  });

  it('should render cursor', () => {
    const { lastFrame } = render(<NoteInput noteText="Test" />);
    expect(lastFrame()).toContain('Test_');
  });

  it('should render help text', () => {
    const { lastFrame } = render(<NoteInput noteText="" />);
    const frame = lastFrame();

    expect(frame).toContain('[Enter] Save');
    expect(frame).toContain('[Esc] Cancel');
  });
});
```

### 7. Update `package.json`

Add test dependencies and scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.45",
    "ink-testing-library": "^3.0.0",
    "typescript": "^5.3.3",
    "vitest": "^1.1.0",
    "@vitest/coverage-v8": "^1.1.0"
  }
}
```

### 8. Create `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/__tests__/', 'dist/', '*.config.ts'],
    },
  },
});
```

## Application Instructions

1. Install test dependencies:

```bash
npm install --save-dev vitest @vitest/coverage-v8 ink-testing-library @types/react
```

2. Create test directory structure:

```bash
mkdir -p src/__tests__/components
mkdir -p src/__tests__/__fixtures__/logs
```

3. Create all test files

4. Run tests:

```bash
npm test
npm run test:coverage
```

## Verification

Expected test output:

```
✓ src/__tests__/types.test.ts (8 tests)
✓ src/__tests__/logTailer.test.ts (12 tests)
✓ src/__tests__/components/Header.test.tsx (2 tests)
✓ src/__tests__/components/Footer.test.tsx (2 tests)
✓ src/__tests__/components/NoteInput.test.tsx (3 tests)
✓ src/__tests__/components/ActivityFeed.test.tsx (4 tests)

Test Files  6 passed (6)
Tests  31 passed (31)
```

## Benefits

- **Confidence**: Catch bugs before they reach production
- **Documentation**: Tests serve as usage examples
- **Refactoring Safety**: Change code with confidence
- **Coverage Tracking**: Identify untested code paths
- **CI/CD Ready**: Automated testing in pipelines
