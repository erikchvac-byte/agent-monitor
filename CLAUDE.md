# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Monitor is a real-time CLI monitoring tool for MCP (Model Context Protocol) agent activity. It's a read-only observer that watches agent log files and displays a live terminal UI using React (via ink). The tool provides:

- Real-time activity feed of agent actions
- Color-coded agent types (router/coordinator=blue, specialist=green, qa=yellow)
- Interactive note-taking with auto-tagging
- Scrollable history (last 50 activities)

## Development Commands

```bash
# Development (hot reload)
npm run dev

# Build TypeScript
npm run build

# Run compiled version
npm start

# Run tests
npm test
```

## Architecture Overview

The application follows a reactive architecture with three main components:

### 1. LogTailer (`src/logTailer.ts`)

- **Purpose**: File watcher and JSONL parser for agent logs
- **Log Location**: `../Agents/logs/conversation_logs/*.log`
- **Key Features**:
  - Uses `chokidar` for cross-platform file watching
  - Maintains circular buffer of last 50 activities
  - Parses JSONL format (one JSON object per line)
  - Reads existing logs on startup, then watches for changes
- **Log Format**: Each line is a `LogEntry` with `timestamp`, `agent`, `action`, `duration_ms`, optional `error`

### 2. Terminal UI (`src/App.tsx`)

- **Framework**: React + ink (React-based terminal UI)
- **State Management**: React hooks (`useState`, `useEffect`, `useInput`)
- **Key Features**:
  - Activity feed displays last 15 of 50 buffered activities
  - Interactive keyboard controls (N=note, Q=quit, ?=help)
  - Two modes: normal (watching) and note mode (text input)
  - Color-coded status icons (✓ success, ✗ failure)

### 3. NoteWriter (`src/notes.ts`)

- **Purpose**: Captures user observations during monitoring sessions
- **Output**: `progress-notes.txt` in project root
- **Auto-tagging**: Associates notes with agents active within last 10 seconds
- **Format**: `[YYYY-MM-DD HH:MM:SS] [Agent: agent1, agent2] Note text`

### Type System (`src/types.ts`)

- `Activity`: UI-layer representation of agent actions
- `LogEntry`: Raw log file format
- `AgentType`: Classification system for color coding
- Agent type detection via name pattern matching

## Key Design Patterns

### Event-Driven Architecture

- `LogTailer` emits activities via callback when files change
- `App` component subscribes to activity stream via `onActivity` callback
- Circular buffer prevents memory growth

### Separation of Concerns

- **LogTailer**: File I/O and parsing only
- **NoteWriter**: File writes only
- **App**: UI state and rendering only
- **types.ts**: Shared data structures

### Error Handling

- `LogTailer` throws on missing logs directory (fail-fast)
- Invalid JSONL lines are silently skipped (graceful degradation)
- TTY check warns if running in non-interactive environment

## Critical Implementation Details

### Log Parsing

- Files are sorted by modification time (newest first)
- On startup: reads last 20 lines from each file
- On change: processes all new lines since last read position
- Activities sorted by timestamp after initial load
- File position tracking prevents duplicate processing

### Color Coding

Agent type determined by name pattern:

- `router|coordinator` → blue
- `specialist` → green
- `critic|repair|debug` → yellow (QA agents)
- default → gray

### Keyboard Input

- `useInput` hook from ink captures keystrokes
- Two-mode system: normal vs note mode
- Note mode: character accumulation until Enter/Esc
- Non-TTY environments display warning but continue (view-only)

## Testing Strategy

**Current Test Coverage (as of 2026-01-20):**

- **Total Test Suites**: 6 (all passing)
- **Total Tests**: 105 (100% pass rate)
- **Overall Coverage**: 54.86% statements, 36.5% branches, 57.14% functions, 53.13% lines

### Test Breakdown by Module:

1. **Logger Tests** (`src/__tests__/logger.test.ts`)
   - 19 tests covering logging functionality
   - Coverage: 100% statements, 92.3% branches, 100% functions, 100% lines
   - Tests timestamp formatting, log levels, singleton pattern, metadata handling

2. **LogTailer Tests** (`src/__tests__/logTailer.test.ts`)
   - 28 tests covering file watching and JSONL parsing
   - Coverage: 65.97% statements, 43.18% branches, 75% functions, 65.62% lines
   - Tests file system operations, buffer management, error handling, file truncation

3. **Notes Tests** (`src/__tests__/notes.test.ts`)
   - 8 tests covering note-taking functionality
   - Coverage: 100% statements, 100% branches, 100% functions, 100% lines
   - Tests note writing, agent tagging, file I/O

4. **Types Tests** (`src/__tests__/types.test.ts`)
   - 9 tests covering type definitions and utilities
   - Coverage: 100% across all metrics
   - Tests agent type detection, activity validation

5. **App Component Tests** (`src/__tests__/App.test.tsx`)
   - 29 tests covering App component logic and behavior
   - Coverage: 13.09% statements (mocking limitations), 0% branches, 0% functions, 12.5% lines
   - Tests state management, keyboard input, note mode, activity formatting, status messages

6. **Performance Tests** (`src/__tests__/performance.test.ts`)
   - 12 tests covering real-world NFR benchmarks
   - Tests UI responsiveness (<1ms per log), throughput (>1000 ops/sec), memory usage (<50MB)

### Testing Approach:

- **Unit Tests**: Isolated testing of individual functions and classes
- **Mocked Dependencies**: Logger, LogTailer, NoteWriter, and ink components are mocked
- **NFR Tests**: Performance benchmarks for logging (1ms threshold, 150ms for 100 messages)
- **Limitations**: App component uses mocks for React rendering; actual UI interaction not tested

### When Adding New Tests:

- Mock file system for LogTailer tests
- Mock ink components for React component tests (chalk is ESM-only)
- Test JSONL parsing with malformed input
- Test circular buffer overflow behavior
- Test keyboard input state transitions
- Test error handling and edge cases

## Troubleshooting

**No activity showing:**

1. Verify `../Agents/logs/conversation_logs/` exists
2. Check log files contain valid JSONL
3. Ensure agents are actually running and logging

**Interactive mode not working:**
Run in a proper terminal (not piped/redirected). The tool checks for TTY support via `process.stdin.isTTY`.

## Extension Points

When adding features:

- **Filtering**: Add filter state to App.tsx, apply in activity render loop
- **Search**: Add search state + filter activities by text match
- **Statistics**: Aggregate activities by agent/action in separate component
- **Export**: Add command to write activities to JSON/CSV
