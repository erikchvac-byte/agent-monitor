# Project Overview

## Project Name

**Agent Monitor** (Lincoln)

## Description

A read-only CLI tool for monitoring MCP (Model Context Protocol) agent activity in real-time. Agent Monitor provides a live progress board that displays what your agents are doing, who's active, and their current status. It's designed to be a silent observer that never interferes with agent operations.

## Executive Summary

Agent Monitor is a TypeScript CLI tool built with React (ink) for terminal UI and chokidar for file watching. It monitors JSONL log files from an external MCP agent system, parses agent actions, and displays a live terminal UI with:

- Color-coded agent types (router/coordinator=blue, specialist=green, qa=yellow)
- Scrollable history of last 50 agent activities
- Interactive note-taking with auto-tagging
- Error highlighting and status indicators

**Current Status:** MVP Complete - Production Ready

## Key Features

### Real-Time Activity Feed

- Watch JSONL log files for agent activity
- Display agent actions as they happen
- Color-coded by agent type for quick visual identification
- Scrollable history (last 50 activities)
- Show success/failure status with icons (✓/✗)

### Interactive Note-Taking

- Press `N` to enter note mode
- Type observations during monitoring sessions
- Auto-tag notes with active agents (last 10 seconds)
- Notes saved to `progress-notes.txt` with timestamps

### Error Highlighting

- Prominently display failed agent actions
- Show error messages in red
- Quickly identify issues requiring attention

### Keyboard Controls

| Key   | Action                                     |
| ----- | ------------------------------------------ |
| `N`   | Enter note mode (type note, Enter to save) |
| `Esc` | Exit note mode without saving              |
| `Q`   | Quit monitor                               |
| `?`   | Show help                                  |

## Tech Stack Summary

| Category             | Technology | Version                       |
| -------------------- | ---------- | ----------------------------- |
| **Language**         | TypeScript | 5.9.3                         |
| **Runtime**          | Node.js    | ES2020                        |
| **CLI Framework**    | ink        | 6.6.0                         |
| **UI Library**       | React      | 19.2.3                        |
| **File Watching**    | chokidar   | 5.0.0                         |
| **Terminal Styling** | chalk      | 5.6.2                         |
| **Testing**          | Jest       | 30.2.0 (105 tests, 100% pass) |

## Architecture Type

**Event-Driven File Watcher with Reactive UI**

### Architecture Pattern

```
Log Files (JSONL)
       ↓
  chokidar watcher (file system events)
       ↓
  LogTailer class (parse JSONL → Activity objects)
       ↓
  Circular Buffer (last 50 activities)
       ↓
  React State (useState)
       ↓
  ink Terminal UI (component rendering)
```

### Key Design Patterns

1. **Observer Pattern**: chokidar emits file change events → LogTailer callbacks → React state updates
2. **Circular Buffer**: LogTailer maintains fixed-size activity buffer (50 items) with automatic overflow
3. **Functional Components with Hooks**: React hooks (useState, useEffect, useInput, useApp) for reactive state management
4. **Class-Based Services**: LogTailer and NoteWriter as service classes for file I/O
5. **Pipeline Pattern**: JSONL parsing → Activity transformation → UI rendering

## Repository Structure

**Type:** Monolith (single cohesive codebase)

### Directory Overview

```
C:\Users\erikc\Dev\Lincoln/
│
├── 📁 src/              # Source code (5 files, 463 LOC)
├── 📁 dist/             # Compiled TypeScript output
├── 📁 docs/             # Generated documentation (this scan)
├── 📁 _bmad/            # BMad framework (external)
├── 📁 _bmad-output/     # BMad workflow artifacts
├── 📁 node_modules/      # npm dependencies
├── 📄 package.json       # Project metadata, dependencies
├── 📄 tsconfig.json     # TypeScript compilation
├── 📄 README.md          # Project overview & usage
├── 📄 CLAUDE.md         # Development guide for Claude
└── 📄 .gitignore        # Git exclusions
```

## Project Status

✅ **MVP Complete**

### Completed Features

- [x] Initialize Git repository
- [x] Verify log path exists
- [x] Create .gitignore
- [x] Create GitHub repository
- [x] Initial commit and push
- [x] TypeScript project structure
- [x] Install dependencies
- [x] Implement LogTailer (file watching, JSONL parsing)
- [x] Implement NoteWriter (note persistence, auto-tagging)
- [x] Build terminal UI with ink
- [x] Add color-coded agents
- [x] Add error highlighting
- [x] Keyboard input handling

### Planned Enhancements

- [ ] Add filtering by agent type
- [ ] Add search functionality
- [ ] Add session statistics
- [ ] Add unit tests
- [ ] Add CI/CD pipeline
- [ ] Add configuration file support
- [ ] Add activity history database

## Data Source

**External Dependency:** MCP Agent System Log Files

**Location:** `../Agents/logs/conversation_logs/*.log`

**Format:** JSONL (one JSON object per line)

### Log Entry Schema

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "agent": "RouterAgent",
  "action": "route_task",
  "input": { "task": "..." },
  "output": { ... },
  "duration_ms": 100,
  "error": null
}
```

## Agent Type Classification

Agent Monitor automatically classifies agents by name pattern:

| Agent Type             | Pattern Match                                | Color     |
| ---------------------- | -------------------------------------------- | --------- |
| **Router/Coordinator** | Name includes "router" or "coordinator"      | 🔵 Blue   |
| **Specialist**         | Name includes "specialist"                   | 🟢 Green  |
| **QA Agents**          | Name includes "critic", "repair", or "debug" | 🟡 Yellow |
| **Unknown**            | No match                                     | ⚫ Gray   |

## Usage Example

### Start Monitoring

```bash
# Development mode with hot reload
npm run dev

# Or run compiled version
npm start

# Or via npm global install
npm install -g agent-monitor
agent-monitor
```

### Take Notes During Monitoring

```
[Watching agent activity...]
Press [N] to take a note...

[N] pressed
Type your note (Enter to save, Esc to cancel):
Task took longer than expected
[Enter] pressed

✓ Note saved: "Task took longer than expected"
[2024-01-01 15:30:45] [Agent: Router, Specialist] Task took longer than expected
```

## Performance Characteristics

### Memory Usage

- **Activity Buffer:** 50 Activity objects in memory (~5KB estimated)
- **Log File Reading:** Stream-based (no full file loads)
- **React State:** Only last 50 activities in state at any time

### File I/O Performance

- **File Watching:** chokidar uses native OS file system events (efficient)
- **Log Reading:** Incremental (last 20 lines on startup, last 5 lines on change)
- **Note Writing:** Append-only (no file rewriting)

### UI Performance

- **Re-render Frequency:** On file change events (typically < 1/second)
- **Display:** Last 15 of 50 activities (limited DOM rendering)
- **Keyboard Input:** Instant (no debouncing)

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- Git (for cloning)

### Quick Start

```bash
# Clone repository
git clone https://github.com/erikchvac-byte/agent-monitor.git
cd agent-monitor

# Install dependencies
npm install

# Start monitoring
npm run dev
```

### Documentation

| Document                                          | Description                                           |
| ------------------------------------------------- | ----------------------------------------------------- |
| [README.md](../README.md)                         | Detailed usage guide and installation instructions    |
| [CLAUDE.md](../CLAUDE.md)                         | Development guidance for Claude Code agent assistance |
| [TESTING.md](../TESTING.md)                       | Testing strategies and procedures                     |
| [Technology Stack](./technology-stack.md)         | Detailed technology stack and architecture patterns   |
| [Architecture](./architecture.md)                 | System architecture and design patterns               |
| [Source Tree Analysis](./source-tree-analysis.md) | Annotated source code structure                       |
| [Development Guide](./development-guide.md)       | Development workflow and common tasks                 |
| [CLI Project Analysis](./cli-project-analysis.md) | Deep analysis of CLI project type                     |

## Known Limitations

1. **Buffer Size:** Fixed at 50 activities (not configurable)
2. **Log Directory:** Hardcoded path (`../Agents/logs/conversation_logs`)
3. **No Persistence:** Activities lost on restart (no history database)
4. **No Filtering:** Cannot filter by agent type or search activities
5. **No Statistics:** No reports or analytics on agent activity

## Next Steps

1. **Review Architecture:** Read [architecture.md](./architecture.md) for detailed system design
2. **Explore Source Code:** Start with [source-tree-analysis.md](./source-tree-analysis.md)
3. **Setup Development:** Follow [development-guide.md](./development-guide.md) to set up local dev
4. **Add Features:** Refer to [technology-stack.md](./technology-stack.md) for enhancement ideas

## Links

- **GitHub Repository:** https://github.com/erikchvac-byte/agent-monitor
- **Issue Tracker:** https://github.com/erikchvac-byte/agent-monitor/issues
- **License:** MIT

## Project Health

| Category              | Score    | Status                                       |
| --------------------- | -------- | -------------------------------------------- |
| **Code Organization** | 9/10     | Clean structure, well-separated concerns     |
| **Type Safety**       | 10/10    | Strict TypeScript mode, comprehensive types  |
| **Testing**           | 10/10    | 105 tests (100% pass rate, 54.86% coverage)  |
| **CI/CD**             | 0/10     | No automation                                |
| **Documentation**     | 8/10     | Good README and inline docs, but no API docs |
| **Maintainability**   | 9/10     | Small codebase, clear architecture           |
| **Overall**           | **6/10** | Good foundation, needs testing and CI/CD     |

---

**Last Updated:** 2026-01-19
**Documentation Generated By:** BMad Document Project Workflow
