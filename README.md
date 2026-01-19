# Agent Monitor

A read-only CLI tool for monitoring MCP (Model Context Protocol) agent activity in real-time.

## Overview

Agent Monitor provides a live progress board that displays what your agents are doing, who's active, and their current status. It's designed to be a silent observer that never interferes with agent operations.

### Key Features

- **Real-time Activity Feed**: Watch agents work with live updates
- **Scrollable History**: Review the last 50 agent actions
- **Color-Coded Status**: Visual distinction between agent types
  - 🔵 Router/Coordinator (Blue)
  - 🟢 Specialists (Green)
  - 🟡 QA Agents (Yellow)
- **Note-Taking**: Capture observations during sessions with auto-tagging
- **Error Highlighting**: Failures are prominently displayed

## What You'll See

The monitor displays three key pieces of information for each agent:

1. **Identity**: Which agent is currently active
2. **Activity**: Plain-English description of what they're doing
3. **Status**: Busy, idle, or complete

## Architecture

```
../Agents/logs/conversation_logs/*.log
              ↓
    LogTailer (watch + parse JSONL)
              ↓
    ActivityBuffer (last 50 events)
              ↓
    Terminal UI (scrollable feed + notes)
```

## Data Source

Monitors JSONL log files from the MCP agent system:
- **Location**: `../Agents/logs/conversation_logs/`
- **Format**: One JSON event per line
- **Files**: Per-agent, per-day logs (e.g., `router_2026-01-18.log`)

## Tech Stack

- **TypeScript**: Type-safe development
- **ink**: React-based terminal UI with scrolling support
- **chokidar**: Cross-platform file watching
- **chalk**: Terminal color styling

## Installation

```bash
# Clone the repository
git clone https://github.com/erikchvac-byte/agent-monitor.git
cd agent-monitor

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Running the Monitor

```bash
# Start monitoring (development mode with hot reload)
npm run dev

# Or run the compiled version
npm start
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| `N` | Enter note mode (type note, Enter to save) |
| `Esc` | Exit note mode without saving |
| `Q` | Quit monitor |
| `?` | Show help |

### Notes

Notes are automatically saved to `progress-notes.txt` with:
- Timestamp
- Active agents at the time of writing
- Your note content

Example note entry:
```
[2026-01-18 15:30:45] [Agent: Router, OllamaSpecialist] Task took longer than expected
```

## Configuration

The monitor automatically watches the logs directory at:
```
../Agents/logs/conversation_logs/
```

To change this location, modify the `LogTailer` constructor in `src/App.tsx`.

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run tests (when available)
npm test
```

## Project Status

✅ **MVP Complete**

- [x] Initialize Git repository
- [x] Verify log path exists
- [x] Create .gitignore
- [x] Create GitHub repository
- [x] Initial commit and push
- [x] TypeScript project structure
- [x] Install dependencies
- [x] Implement LogTailer
- [x] Implement NoteWriter
- [x] Build terminal UI with ink
- [x] Add color-coded agents
- [x] Add error highlighting

### Next Steps

- [ ] Add filtering by agent type
- [ ] Add search functionality
- [ ] Add session statistics
- [ ] Add unit tests
- [ ] Add CI/CD pipeline

## Troubleshooting

### Logs directory not found

Ensure the Agents repository is located at `../Agents/` relative to this project, or modify the path in the configuration.

### No activity showing

1. Verify the MCP server is running (`npm run mcp:serve` in the Agents directory)
2. Check that agents are actually executing tasks
3. Verify log files exist in `../Agents/logs/conversation_logs/`

## License

MIT
