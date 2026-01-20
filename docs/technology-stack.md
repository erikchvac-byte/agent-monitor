# Technology Stack

## Overview

Agent Monitor is a TypeScript CLI tool built with React (ink) for terminal UI and chokidar for file watching.

| Category             | Technology | Version | Justification                                               |
| -------------------- | ---------- | ------- | ----------------------------------------------------------- |
| **Language**         | TypeScript | 5.9.3   | Type safety and enhanced developer experience for CLI tools |
| **Runtime**          | Node.js    | ES2020  | Cross-platform execution, async/await support               |
| **Module System**    | ES Modules | ESNext  | Modern module resolution, tree-shaking support              |
| **CLI Framework**    | ink        | 6.6.0   | React-based terminal UI with component-based architecture   |
| **UI Library**       | React      | 19.2.3  | Reactive state management and component reusability         |
| **File Watching**    | chokidar   | 5.0.0   | Cross-platform file system watching with event callbacks    |
| **Terminal Styling** | chalk      | 5.6.2   | Color-coded terminal output for visual clarity              |
| **Development**      | tsx        | 4.21.0  | TypeScript execution with hot reload for development        |
| **Testing**          | Jest       | 30.2.0  | JavaScript testing framework (105 tests)                    |
| **TypeScript Jest**  | ts-jest    | 29.4.6  | TypeScript transformer for Jest                             |

## Architecture Pattern

**Event-Driven File Watcher with Reactive UI**

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
2. **Circular Buffer**: LogTailer maintains fixed-size activity buffer (50 items) with automatic overflow handling
3. **Functional Components with Hooks**: React hooks (useState, useEffect, useInput, useApp) for reactive state management
4. **Class-Based Services**: LogTailer and NoteWriter as service classes for file I/O and business logic
5. **Pipeline Pattern**: JSONL parsing → Activity transformation → UI rendering

## Architecture Components

### Core Services

| Service        | File               | Responsibility                                           |
| -------------- | ------------------ | -------------------------------------------------------- |
| **LogTailer**  | `src/logTailer.ts` | File watching, JSONL parsing, activity buffer management |
| **NoteWriter** | `src/notes.ts`     | Note persistence with auto-tagging from active agents    |

### UI Components

| Component         | File                   | Responsibility                                              |
| ----------------- | ---------------------- | ----------------------------------------------------------- |
| **App**           | `src/App.tsx`          | Main application, state management, keyboard input handling |
| **Activity Feed** | `src/App.tsx` (inline) | Display last 15 of 50 activities with color coding          |
| **Note Input**    | `src/App.tsx` (inline) | Interactive note-taking overlay with auto-tagging           |

### Type System

| Module                   | File           | Responsibility                                                               |
| ------------------------ | -------------- | ---------------------------------------------------------------------------- |
| **Core Types**           | `src/types.ts` | Activity, LogEntry, AgentType interfaces                                     |
| **Agent Classification** | `src/types.ts` | Agent type detection (router, coordinator, specialist, qa) and color mapping |

## Data Flow

```
External Log File (JSONL format)
  Line 1: {"timestamp": "...", "agent": "...", "action": "...", ...}
  Line 2: {"timestamp": "...", "agent": "...", "action": "...", ...}
  ...
        ↓ (chokidar detects change)
  LogTailer.readNewLines(filePath)
        ↓ (parse JSONL)
  Activity object {timestamp, agent, action, status, duration_ms, error}
        ↓ (via callback)
  React.setState([...activities, newActivity].slice(-50))
        ↓ (React re-render)
  ink component updates terminal display
```

## Build & Execution

| Phase           | Command         | Description                       |
| --------------- | --------------- | --------------------------------- |
| **Development** | `npm run dev`   | tsx watch with hot reload         |
| **Build**       | `npm run build` | TypeScript compilation to `dist/` |
| **Run**         | `npm start`     | Execute compiled `dist/index.js`  |
| **Test**        | `npm test`      | Jest test runner (105 tests)      |

## Entry Points

- **CLI Entry**: `src/index.ts` → `dist/index.js` (bin: `agent-monitor`)
- **React Entry**: `src/App.tsx` (main UI component)
- **Log Location**: `../Agents/logs/conversation_logs/*.log` (external dependency)

## External Dependencies

| Dependency            | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| **Agents Logs**       | Source of agent activity data (external directory)  |
| **Node.js fs module** | File system operations (read, write, append)        |
| **Node.js readline**  | Streaming file reads for line-by-line JSONL parsing |
| **process.stdin**     | Keyboard input capture (useInput hook from ink)     |

## Configuration Files

| File            | Purpose                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| `tsconfig.json` | TypeScript compilation options (strict mode, ES2020 target, JSX support) |
| `package.json`  | Project metadata, dependencies, npm scripts                              |
| `.gitignore`    | Exclude node_modules, dist, and build artifacts                          |
| `CLAUDE.md`     | Development guidance for Claude Code agent assistance                    |

## Development Features

| Feature                       | Implementation                                                  |
| ----------------------------- | --------------------------------------------------------------- |
| **Hot Reload**                | tsx watch during `npm run dev`                                  |
| **Type Safety**               | TypeScript strict mode enabled                                  |
| **Source Maps**               | Generated for debugging (`declarationMap`, `sourceMap` enabled) |
| **Strict Mode**               | TypeScript strict mode enforced                                 |
| **Interactive TTY Detection** | Check `process.stdin.isTTY` for keyboard input support          |

## Next Steps for Tech Stack Evolution

The current tech stack is well-suited for the CLI monitoring use case. Potential enhancements:

1. **Testing**: Implement Jest tests for LogTailer, NoteWriter, and React components
2. **Configuration**: Add config file support for customizable log paths and buffer sizes
3. **Persistence**: Add activity history persistence across sessions
4. **Filtering**: Implement agent type filtering and search functionality
5. **Statistics**: Add activity statistics and aggregation features
