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

## Project Status

🚧 **In Development** - Initial setup phase

### Current Phase: Git Repository Setup

- [x] Initialize Git repository
- [x] Verify log path exists
- [ ] Create .gitignore
- [ ] Create GitHub repository
- [ ] Initial commit and push
- [ ] TypeScript project structure
- [ ] Install dependencies

## License

TBD
