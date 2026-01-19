# Architecture

## Executive Summary

**Project:** Agent Monitor (Lincoln)
**Type:** CLI Tool
**Language:** TypeScript
**Architecture Pattern:** Event-Driven File Watcher with Reactive UI

Agent Monitor is a read-only CLI tool that monitors MCP (Model Context Protocol) agent activity in real-time. It watches JSONL log files, parses agent actions, and displays a live terminal UI with color-coded agent types, scrollable history, and interactive note-taking capabilities.

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime** | Node.js (ES2020) | Cross-platform CLI execution |
| **Language** | TypeScript 5.9.3 | Type safety and enhanced DX |
| **UI Framework** | ink 6.6.0 (React 19.2.3) | Terminal UI with reactive state |
| **File Watching** | chokidar 5.0.0 | Cross-platform file system events |
| **Terminal Styling** | chalk 5.6.2 | Color-coded terminal output |

## Architecture Pattern

### Event-Driven File Watcher with Reactive UI

```
┌─────────────────────────────────────────────────────────────────┐
│                     External Log Files                         │
│              ../Agents/logs/*.log (JSONL)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ File system events
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    chokidar Watcher                          │
│         (cross-platform file watching with callbacks)            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ onChange(filePath)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      LogTailer Service                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  readNewLines(filePath)                             │    │
│  │    ↓                                                 │    │
│  │  parseLine(line) → Activity object                   │    │
│  │    ↓                                                 │    │
│  │  activities.push(activity)                            │    │
│  │    ↓ (circular buffer, max 50)                        │    │
│  │  activities.shift() (if overflow)                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                     │                                         │
│                     │ callback(activity)                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                   React State Management                         │
│           const [activities, setActivities] = useState()        │
│      setActivities([...prev, activity].slice(-50))              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ React re-render
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                     ink Terminal UI                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Box (Header)                                      │    │
│  │    ↓                                                │    │
│  │  Box (Activity Feed) - Display last 15 of 50         │    │
│  │    ↓                                                │    │
│  │  Box (Note Input) - Conditional overlay               │    │
│  │    ↓                                                │    │
│  │  Box (Footer) - Keyboard shortcuts                    │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

1. **Observer Pattern**: chokidar emits file change events → LogTailer callbacks → React state updates
2. **Circular Buffer**: LogTailer maintains fixed-size activity buffer (50 items) with automatic overflow
3. **Functional Components with Hooks**: React hooks (useState, useEffect, useInput, useApp) for reactive state
4. **Class-Based Services**: LogTailer and NoteWriter as service classes for file I/O
5. **Pipeline Pattern**: JSONL parsing → Activity transformation → UI rendering

## Component Architecture

### Core Services

#### LogTailer (`src/logTailer.ts`)

**Responsibility:** File watching, JSONL parsing, activity buffer management

**Key Methods:**
- `start(onActivity)` - Initialize watcher and read existing logs
- `stop()` - Close file watcher
- `readExistingLogs()` - Load last 20 lines from each log file on startup
- `readNewLines(filePath)` - Read last 5 lines when file changes
- `parseLine(line)` - Parse JSONL line into Activity object

**Data Flow:**
```
File Change Event
  ↓
readNewLines(filePath)
  ↓
Stream file with readline
  ↓
Extract last 5 lines
  ↓
parseLine(line) → JSON.parse(line)
  ↓
Create Activity object
  ↓
activities.push(activity)
  ↓
callback(activity) → React state update
```

**Configuration:**
- `logsDir`: `../Agents/logs/conversation_logs` (default)
- `maxActivities`: 50 (circular buffer size)

#### NoteWriter (`src/notes.ts`)

**Responsibility:** Note persistence with auto-tagging from active agents

**Key Methods:**
- `writeNote(note, activeAgents)` - Append note to `progress-notes.txt`
- `getActiveAgents(activities, withinSeconds)` - Extract active agents from recent activities

**Note Format:**
```
[YYYY-MM-DD HH:MM:SS] [Agent: Agent1, Agent2] Note text
```

**Auto-Tagging Logic:**
- Analyze last 10 seconds of activities
- Extract unique agent names
- Tag note with `[Agent: agent1, agent2]` or `[Agent: none]`

**Configuration:**
- `notesFile`: `progress-notes.txt` (default)

### UI Components

#### App (`src/App.tsx`)

**Responsibility:** Main application, state management, keyboard input handling

**State:**
```typescript
const [activities, setActivities] = useState<Activity[]>([]);
const [noteMode, setNoteMode] = useState(false);
const [noteText, setNoteText] = useState('');
const [statusMessage, setStatusMessage] = useState('Starting monitor...');
```

**Keyboard Input Handlers:**

| Key | Mode | Action |
|-----|-------|--------|
| `N` | Normal | Enter note mode |
| `Q` | Normal | Quit application |
| `?` | Normal | Show help message |
| `Enter` | Note Mode | Save note and exit note mode |
| `Esc` | Note Mode | Cancel note and exit note mode |
| `Backspace/Delete` | Note Mode | Delete last character |
| `Character` | Note Mode | Append character to note text |

**Activity Feed Display:**
- Shows last 15 of 50 buffered activities
- Color-coded by agent type (router/coordinator=blue, specialist=green, qa=yellow)
- Timestamps formatted as `HH:MM:SS`
- Action names mapped to human-readable labels
- Success/failure status indicated by ✓/✗ icons
- Duration displayed in milliseconds

#### Types Module (`src/types.ts`)

**Responsibility:** Shared types, agent classification, color mapping

**Key Types:**
```typescript
export interface Activity {
  timestamp: string;
  agent: string;
  action: string;
  status: 'success' | 'failure';
  duration_ms: number;
  task?: string;
  error?: string;
}

export type AgentType = 'router' | 'coordinator' | 'specialist' | 'qa' | 'unknown';
```

**Agent Classification Logic:**
```typescript
export const getAgentType = (agentName: string): AgentType => {
  const lower = agentName.toLowerCase();
  if (lower.includes('router')) return 'router';
  if (lower.includes('coordinator')) return 'coordinator';
  if (lower.includes('specialist')) return 'specialist';
  if (lower.includes('critic') || lower.includes('repair') || lower.includes('debug')) return 'qa';
  return 'unknown';
};
```

## Data Architecture

### Data Flow

```
External System (Agents)
  ↓
JSONL Log Files (append-only)
  ↓
chokidar Watcher (file system events)
  ↓
LogTailer Service (JSONL → Activity transformation)
  ↓
Circular Buffer (last 50 Activity objects)
  ↓
React State (useState)
  ↓
ink Terminal UI (component rendering)
```

### Data Structures

#### Activity Object
```typescript
interface Activity {
  timestamp: string;        // ISO 8601 format
  agent: string;            // Agent name
  action: string;           // Action type (e.g., "execute_task")
  status: 'success' | 'failure';
  duration_ms: number;      // Execution duration
  task?: string;            // Optional task description (truncated to 60 chars)
  error?: string;           // Optional error message
}
```

#### LogEntry (JSONL Format)
```typescript
interface LogEntry {
  timestamp: string;
  agent: string;
  action: string;
  input?: any;             // Agent input (task, parameters)
  output?: any;            // Agent output (result, tool calls)
  duration_ms: number;
  error?: string;
}
```

#### Circular Buffer
- **Size:** 50 Activity objects
- **Behavior:** Auto-removes oldest when overflow
- **Display:** Shows last 15 in UI, maintains 50 in memory

### File I/O Patterns

#### Reading Logs
- **Strategy:** Stream-based reading (line-by-line)
- **Tools:** Node.js `readline` module
- **Performance:** Reads last 20 lines on startup, last 5 lines on change
- **Error Handling:** Invalid JSON lines silently skipped

#### Writing Notes
- **Strategy:** Append-only (file locking not needed)
- **Tools:** Node.js `fs.promises.appendFile`
- **Format:** `[Timestamp] [Agent: tags] Note text\n`
- **Atomicity:** Each note write is atomic

## API Design

### Internal Service APIs

#### LogTailer API
```typescript
class LogTailer {
  constructor(logsDir?: string, maxActivities?: number);
  async start(onActivity: (activity: Activity) => void): Promise<void>;
  stop(): void;
  getActivities(): Activity[];
}
```

#### NoteWriter API
```typescript
class NoteWriter {
  constructor(notesFile?: string);
  async writeNote(note: string, activeAgents: string[]): Promise<void>;
  getActiveAgents(activities: Activity[], withinSeconds?: number): string[];
}
```

#### Types API
```typescript
type AgentType = 'router' | 'coordinator' | 'specialist' | 'qa' | 'unknown';

const getAgentType: (agentName: string) => AgentType;
const getAgentColor: (agentName: string) => string;

const AGENT_COLORS: Record<AgentType, string>;
```

### External Dependencies

**Agents Logs:**
- **Location:** `../Agents/logs/conversation_logs/*.log`
- **Format:** JSONL (one JSON object per line)
- **Schema:** Defined by `LogEntry` interface
- **Access:** Read-only (observer pattern)

**Note File:**
- **Location:** `./progress-notes.txt`
- **Format:** Plain text with structured timestamps
- **Access:** Append-only (no reads in current implementation)

## Component Overview

### Module Dependencies

```
src/index.ts (CLI entry)
  └── src/App.tsx (React UI)
      ├── src/logTailer.ts (File watching service)
      ├── src/notes.ts (Note persistence)
      └── src/types.ts (Shared types)
```

### Coupling Analysis

| Module | Coupling Type | Description |
|--------|---------------|-------------|
| **LogTailer → types** | Loose | Uses Activity interface only |
| **NoteWriter → types** | Loose | Uses Activity interface only |
| **App → LogTailer** | Loose | Service interface, no implementation details |
| **App → NoteWriter** | Loose | Service interface, no implementation details |
| **App → types** | Loose | Imports getAgentColor function |
| **All → types** | Tight | Centralized type definitions (shared dependency) |

**Overall Architecture:** Well-decoupled with service interfaces and shared types

## Source Tree

```
src/
├── index.ts          # CLI bootstrap (18 LOC)
├── App.tsx           # Main UI component (168 LOC)
├── logTailer.ts      # File watching service (170 LOC)
├── notes.ts          # Note persistence (61 LOC)
└── types.ts          # Shared types (54 LOC)
```

**Total:** 5 files, 463 lines of TypeScript

## Development Workflow

### Build Process
```
TypeScript Source (src/*.ts)
  ↓ (tsc)
TypeScript Compilation
  ↓
JavaScript Output (dist/*.js)
  ↓
npm start
Execution (node dist/index.js)
```

### Development Workflow
```
Code Edit (src/*.ts)
  ↓ (file change)
tsx watch
  ↓ (auto-recompile)
Development Server
  ↓ (live reload)
Terminal UI Updates
```

## Deployment Architecture

### Distribution Format
- **Binary:** `dist/index.js` (Node.js CLI executable)
- **Shebang:** `#!/usr/bin/env node` (Unix executable)
- **Package:** npm tarball (`agent-monitor-0.1.0.tgz`)

### Installation
```bash
npm install -g agent-monitor
agent-monitor
```

### Execution
- **Runtime:** Node.js v18+
- **Platform:** Cross-platform (Windows, macOS, Linux)
- **Dependencies:** Managed by npm

## Testing Strategy

### Infrastructure (Not Yet Implemented)
- **Test Runner:** Jest 30.2.0
- **TypeScript Transformer:** ts-jest 29.4.6
- **Command:** `npm test`

### Recommended Test Coverage
| Module | Test Type | Priority |
|--------|-----------|----------|
| **LogTailer** | Unit Tests | High (JSONL parsing, buffer logic) |
| **NoteWriter** | Unit Tests | High (timestamp formatting, tagging) |
| **App** | Integration Tests | Medium (keyboard input, state transitions) |
| **types** | Unit Tests | Low (agent classification, color mapping) |

## Security Considerations

### File System Access
- **Read-Only:** LogTailer only reads log files (no writes)
- **Append-Only:** NoteWriter only appends to notes file (no overwrites)
- **No Executable Files:** No script execution or code injection

### Input Validation
- **JSON Parsing:** Invalid JSON lines silently skipped (graceful degradation)
- **Agent Names:** Sanitized via `toLowerCase()` before pattern matching
- **Note Input:** Character-level filtering (no special handling needed)

### External Dependencies
- **Chokidar:** Well-maintained, widely-used file watcher
- **Ink:** Popular React terminal UI library
- **Node.js fs/stdin:** Built-in Node.js modules (trusted)

## Performance Characteristics

### Memory Usage
- **Activity Buffer:** ~50 Activity objects in memory (~5KB estimated)
- **Log File Reading:** Stream-based (no full file loads)
- **React State:** Only last 50 activities in state at any time

### File I/O Performance
- **File Watching:** chokidar uses native OS file system events (efficient)
- **Log Reading:** Incremental (last 20 on startup, last 5 on change)
- **Note Writing:** Append-only (no file rewriting or seeking)

### UI Performance
- **Re-render Frequency:** On file change events (typically < 1/second)
- **Display:** Last 15 of 50 activities (limited DOM rendering)
- **Keyboard Input:** Instant (no debouncing)

## Scalability Limitations

### Known Limitations
1. **Buffer Size:** Fixed at 50 activities (not configurable)
2. **Log Directory:** Hardcoded path (`../Agents/logs/conversation_logs`)
3. **Single Process:** No multi-process support
4. **No Persistence:** Activities lost on restart (no history database)

### Potential Enhancements
1. **Configurable Buffer Size:** Allow user to set buffer size
2. **Database Persistence:** Store activity history in SQLite/PostgreSQL
3. **Multi-Instance Support:** Monitor multiple log directories
4. **Filtering & Search:** Filter by agent type, action, or search text
5. **Statistics:** Generate reports and analytics on agent activity

## Architecture Decisions

### Why React (ink) for CLI?
- **Component-Based:** Reusable UI components with props
- **State Management:** React hooks provide reactive state
- **Hot Reload:** Fast development iteration with `tsx watch`
- **Ecosystem:** Leverages React ecosystem and patterns

### Why chokidar for File Watching?
- **Cross-Platform:** Works on Windows, macOS, Linux
- **Efficient:** Uses native OS file system events
- **Reliable:** Handles edge cases (file permissions, network drives)

### Why Circular Buffer?
- **Memory Efficiency:** Fixed-size buffer prevents memory growth
- **Simplicity:** Auto-overflow handling (FIFO queue)
- **Performance:** O(1) push/shift operations

### Why JSONL Format?
- **Append-Only:** Efficient for log files (no rewriting)
- **Line-Based:** Easy to stream and parse line-by-line
- **Structured:** JSON provides structured data with schema

## Next Steps for Architecture

1. **Add Configuration File:** Support `agent-monitor.config.yml` for customization
2. **Implement Unit Tests:** Write Jest tests for LogTailer and NoteWriter
3. **Add Filtering UI:** Implement agent type filtering and search
4. **Add Statistics:** Generate activity reports (agent performance, error rates)
5. **Add CI/CD:** Set up GitHub Actions for automated testing and releases
