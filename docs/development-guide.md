# Development Guide

## Prerequisites

### Required Software

| Software | Minimum Version | Installation |
|----------|----------------|---------------|
| **Node.js** | v18.0+ | [nodejs.org](https://nodejs.org/) |
| **npm** | v9.0+ | Included with Node.js |
| **Git** | v2.0+ | [git-scm.com](https://git-scm.com/) |

### Verification

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## Installation

### Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/erikchvac-byte/agent-monitor.git
cd agent-monitor

# Verify project structure
ls -la
```

### Install Dependencies

```bash
# Install all npm packages
npm install

# Verify installation (node_modules should exist)
ls node_modules | head
```

### Build Project

```bash
# Compile TypeScript to JavaScript
npm run build

# Verify output (dist/ directory should exist)
ls dist
```

## Development Workflow

### Local Development (Hot Reload)

```bash
# Start development server with hot reload
npm run dev

# Monitor displays changes in real-time
# Press [Q] to quit
```

**How It Works:**
- `tsx watch` monitors `src/` directory for changes
- Automatically recompiles TypeScript on file save
- No need to manually rebuild during development

### Build from Source

```bash
# Compile TypeScript (produces dist/)
npm run build

# Output files:
# - dist/index.js (CLI binary)
# - dist/App.js (React component)
# - dist/*.d.ts (TypeScript declarations)
# - dist/*.map (Source maps)
```

### Run Compiled Version

```bash
# Run pre-compiled binary
npm start

# Equivalent to:
node dist/index.js
```

### Run Tests

```bash
# Run Jest test suite
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

**Note:** Test infrastructure is configured but no tests exist yet.

## Project Scripts

### Available Commands

| Command | Description | Usage |
|---------|-------------|--------|
| `npm start` | Run compiled CLI | `npm start` |
| `npm run dev` | Development with hot reload | `npm run dev` |
| `npm run build` | Compile TypeScript | `npm run build` |
| `npm test` | Run Jest tests | `npm test` |

### Script Details

```json
{
  "start": "node dist/index.js",           // Run pre-compiled binary
  "dev": "tsx watch src/index.ts",        // Hot reload development
  "build": "tsc",                         // TypeScript compilation
  "test": "jest"                         // Run test suite
}
```

## Environment Setup

### Environment Variables

**Current Status:** No environment variables required

**Optional Configuration:**
- `.env` - Custom log directory path (future feature)
- `.env.local` - Local development overrides (future feature)

**Example `.env` file (future):**
```env
LOGS_DIR=../Agents/logs/conversation_logs
BUFFER_SIZE=50
NOTES_FILE=progress-notes.txt
```

### TypeScript Configuration

**File:** `tsconfig.json`

**Key Options:**
- `target: ES2020` - Modern JavaScript features
- `module: ESNext` - ES module support
- `strict: true` - Type safety enforcement
- `jsx: react` - JSX compilation for ink
- `outDir: ./dist` - Output directory
- `declaration: true` - Generate `.d.ts` files

### Git Configuration

**File:** `.gitignore`

**Excluded Patterns:**
- `node_modules/` - npm dependencies
- `dist/` - Compiled JavaScript
- `*.log` - Log files (including `progress-notes.txt`)
- `.env*` - Environment variables
- `.vscode/`, `.idea/` - IDE settings

## Common Development Tasks

### Add a New Dependency

```bash
# Install a new dependency
npm install <package-name>

# Install a dev dependency
npm install --save-dev <package-name>

# Example: Add a new utility library
npm install lodash
```

### Modify Agent Color Mapping

```bash
# Edit types.ts
vim src/types.ts

# Modify AGENT_COLORS constant
export const AGENT_COLORS: Record<AgentType, string> = {
  router: 'blue',
  coordinator: 'blue',
  specialist: 'green',
  qa: 'yellow',
  unknown: 'gray',
};
```

### Change Log Directory Path

```bash
# Edit App.tsx
vim src/App.tsx

# Modify LogTailer instantiation
const logTailer = new LogTailer('./custom/logs', 50);
```

### Add a New Keyboard Shortcut

```bash
# Edit App.tsx
vim src/App.tsx

# Add case to useInput handler
useInput(async (input, key) => {
  if (input === 'x' || input === 'X') {
    // Custom action
    console.log('Custom action triggered');
  }
});
```

### Update Activity Display Format

```bash
# Edit App.tsx
vim src/App.tsx

# Modify formatAction function
const formatAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    'execute_task': 'Executing',
    'custom_action': 'Custom Label',  // Add new mapping
  };
  return actionMap[action] || action;
};
```

## Debugging

### Enable Source Maps

Source maps are enabled by default (`sourceMap: true` in `tsconfig.json`)

```bash
# When an error occurs, the stack trace will show:
# - Source file (src/*.ts)
# - Original line numbers
# - Not compiled JavaScript
```

### Debug with VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/dist/index.js",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### Console Logging

Add debug statements in `src/App.tsx`:

```typescript
// Log activities as they arrive
console.log('New activity:', activity);

// Log state changes
console.log('Activities count:', activities.length);
```

## Testing Strategy

### Test Infrastructure (Not Yet Implemented)

**Tools Configured:**
- Jest 30.2.0 - Test runner
- ts-jest 29.4.6 - TypeScript transformer

### Recommended Test Structure

```
src/
├── LogTailer.ts
├── LogTailer.test.ts          # Unit tests for LogTailer
├── NoteWriter.ts
├── NoteWriter.test.ts         # Unit tests for NoteWriter
├── types.ts
└── types.test.ts             # Unit tests for type utilities
```

### Example Test (Future)

```typescript
// src/logTailer.test.ts
import { LogTailer } from './logTailer';

describe('LogTailer', () => {
  it('should parse JSONL log entries', () => {
    const logTailer = new LogTailer();
    const entry = JSON.stringify({
      timestamp: '2024-01-01T00:00:00.000Z',
      agent: 'TestAgent',
      action: 'test_action',
      duration_ms: 100
    });
    // Test parsing logic...
  });
});
```

## Build Output

### Directory Structure After Build

```
dist/
├── index.js           # CLI binary (executable)
├── index.d.ts         # TypeScript declarations
├── App.js            # Compiled React component
├── App.d.ts          # TypeScript declarations
├── logTailer.js      # Compiled LogTailer service
├── logTailer.d.ts    # TypeScript declarations
├── notes.js          # Compiled NoteWriter service
├── notes.d.ts        # TypeScript declarations
├── types.js          # Compiled type definitions
├── types.d.ts        # TypeScript declarations
└── *.map             # Source maps (for debugging)
```

### Binary Execution

```bash
# Make binary executable (Unix/Linux/macOS)
chmod +x dist/index.js

# Run directly
./dist/index.js

# Or via npm
npm start
```

### Distribution

```bash
# Create npm tarball
npm pack

# Output: agent-monitor-0.1.0.tgz

# Publish to npm registry
npm publish
```

## Performance Considerations

### Memory Usage

- **Activity Buffer:** 50 Activity objects (circular buffer)
- **Log File Reading:** Streams files (not loaded entirely into memory)
- **React State:** Only last 50 activities in state at any time

### File I/O Performance

- **File Watching:** chokidar uses native OS file system events (efficient)
- **Log Reading:** Reads last 20 lines on startup, last 5 lines on change
- **Note Writing:** Append-only (no file rewriting)

### Optimization Opportunities

1. **Debounce File Changes:** If logs change rapidly, debounce file reads
2. **Lazy Loading:** Load log files only when agent becomes active
3. **Compression:** Compress historical logs (if storing long-term)

## Troubleshooting

### Build Errors

**Error:** `Cannot find module 'react'`
```bash
# Solution: Install dependencies
npm install
```

**Error:** `TypeScript compilation failed`
```bash
# Solution: Check TypeScript version
npm install --save-dev typescript@latest
npm run build
```

### Runtime Errors

**Error:** `Logs directory not found`
```bash
# Solution: Ensure Agents directory exists
ls ../Agents/logs/conversation_logs/

# Or modify path in App.tsx
const logTailer = new LogTailer('./logs', 50);
```

**Error:** `Interactive mode not available`
```bash
# Solution: Run in proper terminal (not piped)
npm run dev  # Run in terminal, not via redirect
```

### TTY Issues

**Problem:** Keyboard input doesn't work
```bash
# Check if stdin is TTY
node -e "console.log(process.stdin.isTTY)"

# Should output: true

# If false, run in proper terminal (not via ssh pipe, file redirect, etc.)
```

## Next Steps for Developers

1. **Set Up Hot Reload:** `npm run dev` for development
2. **Read Source Code:** Start with `src/types.ts` → `src/logTailer.ts` → `src/App.tsx`
3. **Modify Colors:** Edit `AGENT_COLORS` in `src/types.ts`
4. **Add Tests:** Write Jest tests for `LogTailer` and `NoteWriter`
5. **Configure CI/CD:** Set up GitHub Actions for automated testing

## Additional Resources

- **[Ink Documentation](https://github.com/vadimdemedes/ink)** - React terminal UI framework
- **[Chokidar Documentation](https://github.com/paulmillr/chokidar)** - File watching library
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript language reference
- **[Jest Documentation](https://jestjs.io/)** - Testing framework
