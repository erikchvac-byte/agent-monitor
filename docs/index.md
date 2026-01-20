# Project Documentation Index

## Project Overview

**Type:** Monolith
**Primary Language:** TypeScript
**Architecture:** Event-Driven File Watcher with Reactive UI

## Quick Reference

**Tech Stack:** TypeScript 5.9.3, ink 6.6.0 (React 19.2.3), chokidar 5.0.0
**Entry Point:** `dist/index.js` (CLI binary: `agent-monitor`)
**Architecture Pattern:** Event-driven file watcher with reactive UI

## Generated Documentation

### Core Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Technology Stack](./technology-stack.md)

### Project Analysis

- [Project Structure](./project-structure.md)
- [CLI Project Analysis](./cli-project-analysis.md)
- [Existing Documentation Inventory](./existing-documentation-inventory.md)

### Development & Operations

- [Development Guide](./development-guide.md)

## Existing Documentation

- [README.md](../README.md) - Project overview, features, architecture, tech stack, installation, usage
- [CLAUDE.md](../CLAUDE.md) - Development guide for Claude Code agent assistance
- [TESTING.md](../TESTING.md) - Testing strategies and procedures

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

# Start monitoring (development mode)
npm run dev
```

### Common Development Tasks

| Task                  | Command         | Location                        |
| --------------------- | --------------- | ------------------------------- |
| **Start Development** | `npm run dev`   | Hot reload with tsx watch       |
| **Build**             | `npm run build` | TypeScript compilation to dist/ |
| **Run**               | `npm start`     | Execute compiled CLI binary     |
| **Test**              | `npm test`      | Run Jest tests (105 tests)      |

### Keyboard Controls

| Key   | Action                                     |
| ----- | ------------------------------------------ |
| `N`   | Enter note mode (type note, Enter to save) |
| `Esc` | Exit note mode without saving              |
| `Q`   | Quit monitor                               |
| `?`   | Show help                                  |

## Project Structure

```
C:\Users\erikc\Dev\Lincoln/
├── src/                    # Source code (5 files, 463 LOC)
│   ├── index.ts           # CLI entry point
│   ├── App.tsx            # Main React UI component
│   ├── logTailer.ts       # File watching service
│   ├── notes.ts           # Note persistence service
│   └── types.ts           # Shared types & agent classification
├── dist/                   # Compiled TypeScript output
├── docs/                   # This documentation
├── _bmad/                  # BMad framework (external)
├── _bmad-output/           # BMad workflow artifacts
├── package.json             # Project metadata & dependencies
├── tsconfig.json           # TypeScript compilation config
├── README.md               # Project overview
├── CLAUDE.md              # Development guide
└── TESTING.md              # Testing procedures
```

## Technology Stack Summary

| Category             | Technology               | Purpose                           |
| -------------------- | ------------------------ | --------------------------------- |
| **Language**         | TypeScript 5.9.3         | Type-safe CLI development         |
| **Runtime**          | Node.js (ES2020)         | Cross-platform execution          |
| **UI Framework**     | ink 6.6.0 (React 19.2.3) | Terminal UI with reactive state   |
| **File Watching**    | chokidar 5.0.0           | Cross-platform file system events |
| **Terminal Styling** | chalk 5.6.2              | Color-coded terminal output       |

## Architecture Pattern

**Event-Driven File Watcher with Reactive UI**

```
External Log Files (JSONL)
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

## Agent Type Classification

Agent Monitor automatically classifies agents by name pattern:

| Agent Type             | Pattern Match                                | Color     |
| ---------------------- | -------------------------------------------- | --------- |
| **Router/Coordinator** | Name includes "router" or "coordinator"      | 🔵 Blue   |
| **Specialist**         | Name includes "specialist"                   | 🟢 Green  |
| **QA Agents**          | Name includes "critic", "repair", or "debug" | 🟡 Yellow |
| **Unknown**            | No match                                     | ⚫ Gray   |

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

## Development Workflow

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

## Project Status

✅ **MVP Complete** - Production Ready

### Completed Features

- [x] Initialize Git repository
- [x] TypeScript project structure
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

## Documentation Navigation

### For Understanding the Project

1. Start with [Project Overview](./project-overview.md)
2. Read [Architecture](./architecture.md) for system design
3. Review [Technology Stack](./technology-stack.md) for tech details

### For Modifying Code

1. Explore [Source Tree Analysis](./source-tree-analysis.md)
2. Read [Development Guide](./development-guide.md) for common tasks
3. Refer to [CLI Project Analysis](./cli-project-analysis.md) for implementation insights

### For Setting Up Development

1. Follow [Development Guide](./development-guide.md) prerequisites section
2. Install dependencies: `npm install`
3. Start development: `npm run dev`

## Project Health

| Category              | Score    | Notes                                        |
| --------------------- | -------- | -------------------------------------------- |
| **Code Organization** | 9/10     | Clean structure, well-separated concerns     |
| **Type Safety**       | 10/10    | Strict TypeScript mode, comprehensive types  |
| **Testing**           | 10/10    | 105 tests (100% pass rate, 54.86% coverage)  |
| **CI/CD**             | 0/10     | No automation                                |
| **Documentation**     | 8/10     | Good README and inline docs, but no API docs |
| **Maintainability**   | 9/10     | Small codebase, clear architecture           |
| **Overall**           | **6/10** | Good foundation, needs testing and CI/CD     |

## External Resources

- **[Ink Documentation](https://github.com/vadimdemedes/ink)** - React terminal UI framework
- **[Chokidar Documentation](https://github.com/paulmillr/chokidar)** - File watching library
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript language reference
- **[Jest Documentation](https://jestjs.io/)** - Testing framework

## Next Steps

1. **Review This Index** - Familiarize yourself with the documentation structure
2. **Explore Architecture** - Read [architecture.md](./architecture.md) for system design
3. **Start Development** - Follow [development-guide.md](./development-guide.md) for local setup
4. **Add Unit Tests** - Write Jest tests for LogTailer and NoteWriter

---

**Documentation Generated:** 2026-01-19
**Generated By:** BMad Document Project Workflow (Deep Scan)
**Scan Level:** Deep (reading critical files per project type)
**Total Documentation Files:** 8 generated documents + 3 existing documents
