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
- On change: processes last 5 new lines
- Activities sorted by timestamp after initial load

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

No tests currently implemented. When adding:
- Mock file system for LogTailer tests
- Use ink's testing utilities for UI component tests
- Test JSONL parsing with malformed input
- Test circular buffer overflow behavior

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
