---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
inputDocuments:
  - prd.md
  - prd-validation-report.md
  - docs/index.md
  - docs/project-overview.md
  - docs/development-guide.md
  - docs/technology-stack.md
  - docs/project-structure.md
  - docs/source-tree-analysis.md
  - docs/cli-project-analysis.md
  - docs/existing-documentation-inventory.md
workflowType: 'architecture'
project_name: Lincoln
user_name: Erik
date: 2026-01-19
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The 35 FRs define an event-driven CLI monitoring system with three core capability groups:

1. **Real-Time Activity Monitoring (FR1-FR6):** System must watch external JSONL log files, detect file system events, parse JSONL entries, extract activity data (agent, action, timestamp, duration, error), and display in real-time. Architecture must support event-driven file watching with sub-second responsiveness.

2. **Interactive Terminal UI (FR7-FR26):** System provides color-coded agent type classification (router/coordinator=blue, specialist=green, qa=yellow, unknown=gray), success/failure status indicators, scrollable history, and keyboard controls (N/Q/?/Esc). Architecture requires reactive UI state management synchronized with file system events, with TTY detection and graceful degradation to read-only mode.

3. **Knowledge Capture (FR13-FR17):** System captures user observations with auto-tagging based on active agents from last 10 seconds, persists notes to `progress-notes.txt` with timestamps. Architecture needs note persistence layer with agent activity correlation logic.

4. **Error Handling & Performance (FR27-FR35):** System must handle invalid JSON gracefully, display clear errors, maintain exact 50-item circular buffer with FIFO overflow, limit display to 15 items for performance, read last 20 lines on startup and last 5 lines on change. Architecture requires robust error handling, memory management, and performance optimization strategies.

**Non-Functional Requirements:**

The 14 NFRs establish strict performance and reliability boundaries:

- **Performance Constraints:** UI updates within 100ms (NFR-P1), file detection within 500ms (NFR-P2), memory under 50MB (NFR-P3), startup within 5 seconds (NFR-P4), graceful degradation under load (NFR-P5)
- **Integration Resilience:** Handle missing log directories with clear errors (NFR-I1), continue when individual files are unreadable (NFR-I2), skip invalid JSON entries (NFR-I3), detect new log files dynamically (NFR-I4), cross-platform file system event handling (NFR-I5)
- **Reliability:** Consistent cross-platform behavior (NFR-R1), no crashes on errors (NFR-R2), clear actionable error messages (NFR-R3), continue after recoverable errors (NFR-R4), read-only mode for non-TTY (NFR-R5)

**Scale & Complexity:**

- Primary domain: CLI/Developer Tools
- Complexity level: Low to Medium
- Estimated architectural components: 3-5 core services (file watching, parsing, UI state, note persistence, error handling)

### Technical Constraints & Dependencies

**External Dependencies:**
- Log files from external MCP agent system at `../Agents/logs/conversation_logs/` (read-only, no control over format or structure)
- JSONL format requirement (one JSON object per line)
- Node.js runtime environment (ES2020)

**Platform Constraints:**
- Cross-platform compatibility (Windows, macOS, Linux)
- Terminal display limitations (typically 80x24 characters)
- TTY requirement for interactive mode (keyboard input)
- Graceful degradation to read-only mode in non-interactive environments

**Technical Constraints:**
- Fixed circular buffer size (50 activities) - configurable for future but fixed for MVP
- Display limit (last 15 of 50 activities) for performance
- No persistence of activities across sessions (in-memory only)
- No filtering or search in MVP (planned for growth features)
- Hardcoded configuration values (log path, buffer size, colors) - not configurable

**Existing Implementation:**
- MVP is production-ready and actively used
- 5 source files, 463 lines of code
- Flat source structure with coarse-grained separation of concerns
- Test infrastructure present (Jest, ts-jest) but no tests implemented
- No CI/CD automation
- TypeScript strict mode enabled

### Cross-Cutting Concerns Identified

1. **Error Resilience:** System must never crash - handle missing directories, invalid JSON, file permission errors, and missing TTY support gracefully with clear user messaging

2. **Performance Optimization:** Maintain tight performance SLAs (100ms UI updates, 500ms file detection, <50MB memory) while handling potentially high-frequency file changes and long-running monitoring sessions

3. **Cross-Platform Compatibility:** File watching, path handling, terminal UI rendering, and keyboard input must work consistently across Windows, macOS, and Linux

4. **State Management:** Synchronize file system events with reactive UI state, manage circular buffer overflow, handle note mode transitions, and maintain TTY state

5. **File I/O Reliability:** Robust JSONL parsing with error recovery, handle file system edge cases (file locks, permissions, concurrent writes), and manage incremental file reading (last 20/5 lines)

6. **Memory Management:** Strict memory constraints (<50MB) require efficient circular buffer implementation, minimal state retention, and careful resource cleanup


## Starter Template Evaluation

### Primary Technology Domain

**CLI/Developer Tools** - Event-driven terminal UI monitoring system with file watching and reactive state management

### Existing Architecture Analysis

**Note:** This is a brownfield project with production-ready MVP. Rather than selecting a new starter template, we're documenting existing architecture and evaluating its suitability for current and future requirements.

### Current Architecture: Custom TypeScript CLI

**Rationale for Existing Approach:**
The project was built as a problem-solving MVP by a developer for developers, using proven, boring technologies that solve a specific pain point of manual log parsing. The architecture follows event-driven patterns appropriate for real-time file monitoring, with clean separation of concerns across three core services.

**Existing Architecture Decisions:**

**Language & Runtime:**
- TypeScript 5.9.3 with strict mode enabled
- Node.js ES2020 target for modern language features
- ESNext modules for modern module resolution
- Source maps and declaration files generated for debugging

**Terminal UI Framework:**
- ink 6.6.0 (React 19.2.3) for component-based terminal UI
- Functional components with hooks (useState, useEffect, useInput)
- Reactive state management synchronized with file system events
- Cross-platform rendering with automatic TTY detection

**File Watching:**
- chokidar 5.0.0 for cross-platform file system watching
- Event-driven callbacks for file creation, modification, deletion
- Native OS file system events for efficient operation

**Architecture Pattern:**
- Event-Driven File Watcher with Reactive UI
- Observer pattern (chokidar → LogTailer → React state → ink rendering)
- Circular buffer pattern (50 activities with automatic FIFO overflow)
- Class-based services (LogTailer, NoteWriter) for file I/O and business logic
- Pipeline pattern (JSONL parsing → Activity transformation → UI rendering)

**Code Organization:**
- Flat source structure (5 files in `src/` directory)
- Coarse-grained separation of concerns (one concern per file)
- Shared types module (`types.ts`) used across all components
- Clear dependency hierarchy: index.ts → App.tsx → {logTailer, notes, types}

**Development Experience:**
- tsx 4.21.0 for hot-reload development (`npm run dev`)
- TypeScript compilation to `dist/` for production builds
- Jest 30.2.0 + ts-jest 29.4.6 (test infrastructure present but unused)
- chalk 5.6.2 for terminal color styling

**Testing Infrastructure:**
- Jest configured with ts-jest transformer
- No tests currently implemented
- Infrastructure ready for unit and integration tests

### Architecture Evaluation Against Requirements

**Strengths (Current vs. Required):**

| Requirement | Current Implementation | Assessment |
|-------------|----------------------|-------------|
| Real-time monitoring | ✓ chokidar event-driven file watching | Excellent - meets NFR-P2 (500ms detection) |
| Reactive UI | ✓ ink + React hooks | Excellent - supports sub-second UI updates |
| Type safety | ✓ TypeScript strict mode | Excellent - comprehensive type system |
| Cross-platform | ✓ chokidar + ink | Excellent - proven cross-platform libraries |
| Error handling | ⚠️ Graceful degradation present | Good - but needs test coverage |
| Performance | ⚠️ Circular buffer (50 items) | Good - but lacks performance monitoring |
| Testing | ✗ Infrastructure present, unused | Gap - critical for reliability |
| CI/CD | ✗ Not implemented | Gap - needed for production confidence |

**Gap Analysis for Growth Features:**

| Growth Feature | Architectural Implication | Current Readiness |
|----------------|------------------------|-------------------|
| Filtering by agent type | Add filter state + UI controls | Requires: filter logic in App.tsx, keyboard controls for filter toggling |
| Search functionality | Add search index + query UI | Requires: search index structure, search input mode, filtered rendering |
| Session statistics | Add aggregation + report generation | Requires: metrics collection, statistics calculation, report formatter |
| Configuration file support | Add config parser + overrides | Requires: YAML/JSON config loader, parameter overrides, validation |
| Activity history database | Add persistence layer + query interface | Major change: requires database schema, migration path, query API |

### Architectural Recommendations

**Immediate (High Priority):**
1. **Add Test Coverage** - Critical for reliability and refactoring confidence
   - Unit tests for LogTailer (JSONL parsing, buffer logic)
   - Unit tests for NoteWriter (timestamp formatting, auto-tagging)
   - Integration tests for App (keyboard input, state transitions)
   
2. **Add CI/CD** - Essential for production quality
   - GitHub Actions for automated testing
   - Automated build verification
   - Optional: automated release with semantic versioning

**Short-Term (Growth Features Phase 2):**
3. **Enhance Configuration** - Remove hardcoded values
   - Config file support (YAML or JSON)
   - Environment variable overrides
   - Runtime validation

4. **Add Filtering** - Natural extension of current architecture
   - Add filter state to React component
   - Keyboard controls for agent type toggling
   - Filter logic in activity rendering

**Long-Term (Vision Features Phase 3):**
5. **Evaluate Database Layer** - For activity history persistence
   - Start with simple JSON file persistence
   - Upgrade to SQLite if query complexity warrants
   - Consider PostgreSQL for multi-user scenarios

6. **Consider CLI Framework** - If complexity grows significantly
   - Evaluate oclif for better command structure
   - Consider if React + ink is still optimal or if simpler approach is better
   - Refactor only if current architecture becomes limiting

### Current Architecture Verdict

**Score: 8/10** - Excellent foundation for MVP and near-term growth

The existing architecture is well-suited for current problem domain and Growth Features. The technology choices are proven, boring, and appropriate:
- TypeScript + ink + chokidar is an excellent stack for CLI terminal UIs
- Event-driven architecture is ideal for real-time file monitoring
- Clean separation of concerns enables feature addition
- Flat structure is appropriate for 463 LOC, but may need reorganization as complexity grows

**No starter template adoption needed** - current architecture serves requirements well and should be evolved incrementally rather than replaced.


## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

1. **Testing Strategy** - Unit + Integration Tests with 80% coverage target
   - Why blocks implementation: Essential for reliability and refactoring confidence
   - Key coverage areas: LogTailer (JSONL, buffer, file watching), NoteWriter (timestamp, tagging), App (keyboard, state transitions), Error handling (invalid JSON, missing dirs, non-TTY)
   - Affects: All components, test infrastructure, CI/CD workflow

2. **Configuration Management** - Config File (YAML) + Environment Override
   - Why blocks implementation: Needed before Growth Features (filtering, search, statistics, config customization)
   - Config schema: logDirectory (required), bufferSize (50, 10-100), notesFile ("progress-notes.txt"), agentColors (router/blue, specialist/green, qa/yellow, unknown/gray), displayCount (15, 5-50)
   - Affects: Config module, all services (LogTailer, NoteWriter, App), startup sequence

3. **Code Organization** - Feature-Based Directories, reorganized proactively
   - Why blocks implementation: Foundation for adding Growth Features without accumulating technical debt
   - New structure: src/{config, monitoring, ui, notes}/ + types.ts
   - Affects: All source files, import paths, test organization

**Important Decisions (Shape Architecture):**

4. **CI/CD Platform** - GitHub Actions with testing + build workflows
   - Workflow components: Automated Testing (npm test), TypeScript Compilation (npm run build), Optional Automated Releases (semantic-release later), Skipped Code Quality (ESLint/Prettier not needed with strict mode)
   - Trigger events: Push to main, Pull Requests
   - Affects: .github/workflows directory, CI/CD pipeline, release process

5. **Performance Monitoring** - Performance Tests in Test Suite
   - Coverage: UI Responsiveness (<100ms), File Detection (<500ms), Memory Usage (<50MB), Startup Time (<5s)
   - Implementation: Performance tests in LogTailer.test.ts, App.test.tsx, marked with `describe('Performance', ...)`
   - Affects: Test files, CI/CD workflow (performance test timeout handling)

6. **Error Handling** - Custom Error Classes in shared utils module
   - Structure: AppError base class + ConfigError, FileSystemError, ParseError, TTYError
   - Metadata: message, isRecoverable, userAction
   - Location: src/utils/errors.ts (shared across all features)
   - Affects: All services (LogTailer, NoteWriter, ConfigLoader, App), error handling patterns, user-facing messages

**Deferred Decisions (Post-MVP):**

7. **Activity Persistence Strategy** - For Phase 3 feature (activity history database)
   - Options: JSON file persistence (simple), SQLite (query complexity), PostgreSQL (multi-user)
   - Rationale: Not needed for MVP or Growth Features (Phase 2), can defer decision until requirements are clearer

8. **CLI Framework Evaluation** - Whether to adopt oclif or continue custom approach
   - Options: oclif (structured commands), custom (current approach)
   - Rationale: Only evaluate if complexity grows significantly; current architecture serves requirements well

### Implementation Sequence

1. Reorganize code to feature-based structure (prerequisite for all other decisions)
2. Add shared error handling module (src/utils/errors.ts)
3. Implement config loading and validation (src/config/)
4. Update all services to use config and custom errors
5. Add unit + integration tests with 80% coverage target
6. Add performance tests for all 4 NFRs
7. Set up GitHub Actions workflow for testing + build
8. Add optional automated release pipeline (semantic-release)

### Cross-Component Dependencies

- Feature-based structure must be reorganized before adding config module (import path dependencies)
- Error handling module must be created before updating services (all services will import errors)
- Config loading must be implemented before tests can validate config error handling
- Performance tests depend on services being refactored to use config (mock config in tests)
- GitHub Actions workflow depends on test suite being complete (80% coverage, performance tests)


## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 categories where AI agents could make different choices that would cause conflicts:
- Naming conventions (camelCase vs snake_case)
- Structure organization (shared utils vs co-located)
- Data/time formats (ISO 8601 vs local formats)
- Error handling (local recovery vs centralized)
- State management (mutation vs immutable)

### Naming Conventions

**Code Variables/Functions/Classes:**
- Use camelCase for all variables, parameters, properties, functions
- Use PascalCase for types, interfaces, and type aliases
- Error classes: Single word, descriptive (ConfigError, FileSystemError, ParseError, TTYError)
- Functions: Verb + noun (loadConfig, parseLogEntry, formatTimestamp)
- Test files: Co-located with `.test.ts` suffix (LogTailer.test.ts, App.test.tsx)

**Config File Keys:**
- Use snake_case for all YAML config keys
- Config loader handles translation to camelCase in code
- Example: `log_directory` in YAML → `logDirectory` in code

### Structure Patterns

**Project Organization:**
- Feature-based directories: src/{config, monitoring, ui, notes}/
- Shared utilities in src/utils/ directory
- All types in src/types.ts (single file, no types/ directory needed)
- Co-located tests: .test.ts next to implementation file

**File Structure:**
```
src/
├── utils/              # Shared utilities
│   ├── errors.ts       # Custom error classes
│   ├── timestamp.ts    # Timestamp formatting
│   └── classifier.ts  # Agent type classification
├── config/            # Config loading and validation
│   ├── loader.ts      # Config file loader
│   ├── schema.ts      # Config schema and validation
│   └── index.ts      # Public API
├── monitoring/        # LogTailer and file watching
│   ├── logTailer.ts   # File watching and JSONL parsing
│   ├── logTailer.test.ts
│   └── index.ts
├── ui/               # UI components
│   ├── App.tsx        # Main UI component
│   ├── App.test.tsx
│   └── index.ts
├── notes/            # NoteWriter and auto-tagging
│   ├── notes.ts       # Note writing and auto-tagging
│   ├── notes.test.ts
│   └── index.ts
└── types.ts           # All types in single file
```

### Format Patterns

**Timestamp Handling:**
- Internal storage: ISO 8601 (matches MCP agent logs)
- Display format: Relative time (<1hr: "2s ago"), Absolute (≥1hr: HH:mm:ss)
- Implementation: Single `formatTimestamp()` function in src/utils/timestamp.ts

**JSON Error Formatting:**
- Pretty-print JSON with indentation for terminal display
- Easier debugging, more readable for users
- Terminal output is primary interface (no automated parsing needed)

### Error Handling Patterns

**Approach: Hybrid (local recovery + centralized fatal handling)**

```typescript
// Local handling (recoverable errors)
try {
  parseLogEntry(line);
} catch (e) {
  if (e instanceof ParseError && e.isRecoverable) {
    logError(e);  // Log to stderr with timestamp, type, message, userAction
    return;       // Skip this line and continue
  }
  throw e;       // Propagate unrecoverable errors
}

// Centralized handler (fatal errors)
process.on('uncaughtException', (error) => {
  if (error instanceof AppError) {
    displayError(error);
    process.exit(error.isRecoverable ? 0 : 1);
  }
});
```

**Error Logging:**
- Log ALL errors to stderr (including recoverable errors)
- Format: `[timestamp] [errorType] message - userAction`
- Separate from normal activity display (terminal UI shows activities, stderr shows errors)

### State Management Patterns

**Mutation: Immutable updates with spread operators**

```typescript
// Separate state for each concern
const [activities, setActivities] = useState<Activity[]>([]);
const [mode, setMode] = useState<'normal' | 'note'>('normal');
const [noteInput, setNoteInput] = useState('');

// Immutable updates (never mutate directly)
setActivities([...newActivities]);
setActivities([...activities].filter(...));

// Helper functions for common updates
const addActivity = (activity: Activity) => {
  setActivities(prev => [...prev, activity]);
};

const removeActivity = (id: string) => {
  setActivities(prev => prev.filter(a => a.id !== id));
};
```

**Organization: Multiple state objects** (not one large state object)
- Clear separation of concerns
- Better performance (selective re-renders)
- Simple, focused updates
- Prevents large, complex state objects

### Enforcement Guidelines

**All AI Agents MUST:**

1. **Follow naming conventions**
   - camelCase for code variables, functions, classes
   - snake_case for YAML config keys
   - PascalCase for types and interfaces
   - Single-word descriptive error classes (ConfigError, FileSystemError, ParseError, TTYError)
   - Verb + noun function names (loadConfig, parseLogEntry, formatTimestamp)
   - Co-located tests with `.test.ts` suffix

2. **Organize code by feature**
   - Use feature-based directories (config/, monitoring/, ui/, notes/)
   - Place shared utilities in src/utils/
   - Co-locate tests with implementation files
   - All types in src/types.ts (single file)

3. **Use consistent formats**
   - ISO 8601 for internal timestamp storage
   - Relative time (<1hr) + absolute time (≥1hr) for display
   - Pretty-print JSON in error messages
   - Single `formatTimestamp()` function for all timestamp display

4. **Handle errors with hybrid approach**
   - Handle recoverable errors locally (try-catch, log to stderr, continue)
   - Propagate unrecoverable errors to centralized handler
   - Log ALL errors to stderr (including recoverable errors)
   - Format: `[timestamp] [errorType] message - userAction`

5. **Use immutable state updates**
   - Always create new objects/arrays with spread operators
   - Never mutate state directly
   - Use multiple state objects (not one large object)
   - Helper functions for common updates (addActivity, removeActivity)

**Pattern Enforcement:**

- Review all code against patterns during pull request reviews
- ESLint rules to enforce naming conventions (optional, if added later)
- TypeScript strict mode catches many mutation errors
- Test coverage validates error handling patterns
- CI/CD workflow checks for pattern violations (if automated rules are added)

### Pattern Examples

**Good Examples:**

```typescript
// Naming: camelCase, verb + noun
export function loadConfig(path: string): Config {
  // ...
}

// Config: snake_case keys
// agent-monitor.config.yaml
log_directory: "../Agents/logs/conversation_logs"
buffer_size: 50

// Error: descriptive, recoverable metadata
throw new ParseError(
  "Invalid JSON in log file: Missing required field 'agent'",
  true,  // recoverable - skip this line
  "Verify agent logs are generated correctly"
);

// State: immutable update, multiple state objects
const [activities, setActivities] = useState<Activity[]>([]);
const [mode, setMode] = useState<'normal' | 'note'>('normal');

setActivities(prev => [...prev, newActivity]);  // Immutable

// Error handling: local recovery
try {
  parseLogEntry(line);
} catch (e) {
  if (e instanceof ParseError && e.isRecoverable) {
    logError(e);
    return;  // Skip and continue
  }
  throw e;
}
```

**Anti-Patterns:**

```typescript
// BAD: snake_case function name
function load_config(path: string) { }  // ❌ Should be loadConfig

// BAD: camelCase config keys
// agent-monitor.config.yaml
logDirectory: "../Agents/logs/conversation_logs"  // ❌ Should be log_directory

// BAD: Generic error name
throw new Error("Invalid JSON");  // ❌ Should throw ParseError with metadata

// BAD: State mutation
const [activities, setActivities] = useState<Activity[]>([]);
activities.push(newActivity);  // ❌ Won't trigger re-render
setActivities(activities);  // ❌ Same reference

// BAD: Not logging recoverable errors
try {
  parseLogEntry(line);
} catch (e) {
  if (e.isRecoverable) {
    return;  // ❌ Should logError(e) before returning
  }
}
```


## Project Structure & Boundaries

### Complete Project Directory Structure

```
lincoln/                              # Project root
├── README.md                          # Project overview and usage guide
├── CLAUDE.md                          # Development guide for Claude Code
├── TESTING.md                          # Testing strategies and procedures
├── package.json                        # Dependencies, scripts, metadata
├── package-lock.json                   # Dependency lockfile
├── tsconfig.json                      # TypeScript compilation config (strict mode)
├── .gitignore                         # Exclusions: node_modules, dist, logs
├── .env.example                       # Environment variable template
├── agent-monitor.config.yaml            # Default configuration (user-overridable)
├── .github/                           # GitHub CI/CD workflows
│   └── workflows/
│       └── ci.yml                    # Automated testing + build workflow
├── src/                               # Source code directory
│   ├── index.ts                       # CLI entry point (TTY check, React render)
│   ├── types.ts                       # All shared types (Activity, LogEntry, AgentType)
│   │
│   ├── utils/                         # Shared utilities
│   │   ├── errors.ts                # Custom error classes (AppError, ConfigError, etc.)
│   │   ├── timestamp.ts             # Timestamp formatting (ISO 8601 → display)
│   │   ├── classifier.ts            # Agent type classification (color lookup)
│   │   └── index.ts                # Public API for utils
│   │
│   ├── config/                        # Configuration loading and validation
│   │   ├── loader.ts                # Config file loader (YAML + env override)
│   │   ├── schema.ts                # Config schema and validation rules
│   │   ├── loader.test.ts            # Tests for config loading
│   │   └── index.ts                # Public API for config
│   │
│   ├── monitoring/                    # Log file monitoring and parsing
│   │   ├── logTailer.ts             # File watching, JSONL parsing, circular buffer
│   │   ├── logTailer.test.ts         # Unit tests + performance tests
│   │   └── index.ts                # Public API for monitoring
│   │
│   ├── ui/                           # Terminal UI components
│   │   ├── App.tsx                  # Main UI component (state, keyboard, rendering)
│   │   ├── App.test.tsx             # Integration tests + performance tests
│   │   └── index.ts                # Public API for UI
│   │
│   └── notes/                        # Note persistence and auto-tagging
│       ├── notes.ts                 # NoteWriter class (persistence, auto-tagging)
│       ├── notes.test.ts             # Unit tests
│       └── index.ts                # Public API for notes
│
└── dist/                              # Compiled TypeScript output (generated)
    ├── index.js                      # CLI binary entry point
    ├── index.d.ts                    # TypeScript declarations
    └── ...                          # All other compiled .js, .d.ts, .map files
```

### Architectural Boundaries

**API Boundaries:**
- **No API layer** - CLI tool monitors external files, does not expose API
- **External integration point** - `../Agents/logs/conversation_logs/*.log` (read-only JSONL files)
- **Config boundary** - YAML file + environment variables → TypeScript Config object

**Component Boundaries:**
- **Feature boundaries** - Each feature (config, monitoring, ui, notes) is self-contained
  - Public API via `index.ts` in each feature directory
  - Internal implementation details hidden
  - Tests co-located with implementation
- **State management boundary** - UI state lives in `src/ui/App.tsx` (React hooks), no shared state across features
- **Service communication** - Features communicate via function calls, not events:
  - `src/index.ts` → `src/config/loader.ts` (load config)
  - `src/index.ts` → `src/monitoring/logTailer.ts` (start watching)
  - `src/monitoring/logTailer.ts` → callback → `src/ui/App.tsx` (activity updates)
  - `src/ui/App.tsx` → `src/notes/notes.ts` (save notes)

**Service Boundaries:**
- **LogTailer** - Isolated file watching service, exposes `start()`, `stop()`, `getBuffer()` methods
- **NoteWriter** - Isolated note persistence service, exposes `saveNote()` method
- **ConfigLoader** - Isolated config service, exposes `loadConfig()` method
- **No inter-service dependencies** - Services don't depend on each other, only on shared types and utils

**Data Boundaries:**
- **No database** - In-memory circular buffer (50 activities, no persistence)
- **External data** - MCP agent logs (read-only, no control over format)
- **User data** - Notes written to `progress-notes.txt` (append-only)
- **Config data** - YAML file + environment variables (read at startup, immutable at runtime)

### Requirements to Structure Mapping

**Feature/Epic Mapping:**

**Real-Time Activity Monitoring (FR1-FR6):**
- Implementation: `src/monitoring/logTailer.ts`
- Tests: `src/monitoring/logTailer.test.ts`
- Dependencies: `src/types.ts`, `src/utils/errors.ts`, `src/utils/classifier.ts`
- NFR tests: File detection (<500ms), Memory usage (<50MB)

**Interactive Terminal UI (FR7-FR26):**
- Implementation: `src/ui/App.tsx`
- Tests: `src/ui/App.test.tsx`
- Dependencies: `src/types.ts`, `src/monitoring/`, `src/notes/`, `src/utils/timestamp.ts`, `src/utils/classifier.ts`
- NFR tests: UI responsiveness (<100ms)

**Knowledge Capture (FR13-FR17):**
- Implementation: `src/notes/notes.ts`
- Tests: `src/notes/notes.test.ts`
- Dependencies: `src/types.ts`, `src/utils/timestamp.ts`
- Functionality: Auto-tagging (last 10 seconds of active agents)

**Error Handling & Performance (FR27-FR35):**
- Implementation: `src/utils/errors.ts` (error classes), all `*.test.ts` files (error handling tests)
- Performance tests: `describe('Performance', ...)` sections in `logTailer.test.ts`, `App.test.tsx`
- Dependencies: Shared across all services
- NFR tests: Startup time (<5s), graceful degradation

**Cross-Cutting Concerns:**

**Configuration System:**
- Implementation: `src/config/loader.ts`, `src/config/schema.ts`
- Tests: `src/config/loader.test.ts`
- Dependencies: `src/types.ts`, `src/utils/errors.ts`
- Used by: `src/index.ts` (load at startup), all tests (mock config)

**Error Handling:**
- Implementation: `src/utils/errors.ts`
- Dependencies: None (base error class)
- Used by: All services and tests
- Pattern: Local recovery for recoverable errors, centralized handler for fatal errors

**Timestamp Formatting:**
- Implementation: `src/utils/timestamp.ts`
- Dependencies: date-fns library
- Used by: `src/notes/notes.ts`, `src/ui/App.tsx`
- Format: ISO 8601 internal, relative/absolute display

### Integration Points

**Internal Communication:**

```
Startup Flow:
src/index.ts
  └→ src/config/loader.ts (load config)
      └→ src/monitoring/logTailer.ts (start watching)
          └→ callback to src/ui/App.tsx (activity updates)
              └→ src/notes/notes.ts (save notes on Enter)

User Input Flow:
Keyboard (stdin)
  └→ useInput hook in src/ui/App.tsx
      └→ update state (activities, mode, noteInput)
          └→ trigger actions (save note, quit, show help)
```

**External Integrations:**

- **MCP Agent Logs** - `../Agents/logs/conversation_logs/*.log` (JSONL format, chokidar watching)
- **Terminal** - stdin (keyboard input), stdout/stderr (display), process.stdin.isTTY check
- **File System** - Node.js fs module (read config, write notes), chokidar (file watching)
- **No network dependencies** - CLI tool is entirely local, no HTTP/API calls

**Data Flow:**

```
External Log Files (JSONL)
         ↓ (chokidar detects file change)
     src/monitoring/logTailer.ts
         ↓ (read last 5 lines, parse JSONL)
     Activity[] objects
         ↓ (via callback to React setState)
     src/ui/App.tsx (React state)
         ↓ (React re-render with ink)
     Terminal UI Display
         ↓ (user types 'N' to take note)
     src/ui/App.tsx (noteInput state)
         ↓ (user types Enter to save)
     src/notes/no
tes/notes.ts (auto-tagging)
         ↓ (append to progress-notes.txt)
     User notes file
```

### File Organization Patterns

**Configuration Files:**
- **Root level** - `agent-monitor.config.yaml` (default config), `.env.example` (template)
- **Build config** - `tsconfig.json` (TypeScript compilation)
- **CI/CD config** - `.github/workflows/ci.yml` (automated testing)
- **Environment override** - Supports environment variables (process.env) for CI/CD and environments

**Source Organization:**
- **Feature-based** - Each feature in its own directory (config/, monitoring/, ui/, notes/)
- **Shared utilities** - `src/utils/` for code used across multiple features
- **Types centralization** - `src/types.ts` for all shared types (no types/ directory)
- **Public APIs** - Each feature has `index.ts` for clean imports

**Test Organization:**
- **Co-located** - `*.test.ts` next to implementation file
- **Test categories** - Unit tests (describe function behavior), Integration tests (describe component behavior), Performance tests (describe('Performance', ...))
- **Mock config** - Tests use mocked config (no real file I/O in tests)
- **Test utilities** - Mock helpers in test files (no separate test utils directory)

**Asset Organization:**
- **No static assets** - CLI tool has no images, fonts, or static files
- **Build output** - `dist/` directory (git-ignored, generated on `npm run build`)
- **Log files** - `progress-notes.txt` (user-generated notes, git-ignored)

### Development Workflow Integration

**Development Server Structure:**
- Hot reload: `npm run dev` → tsx watch monitors `src/` directory, auto-recompiles on save
- Entry point: `src/index.ts` checks TTY, renders `App.tsx`
- Development mode: tsx handles TypeScript compilation on the fly, no `dist/` needed

**Build Process Structure:**
- Build command: `npm run build` → TypeScript compiler reads `tsconfig.json`, outputs to `dist/`
- Build output: Compiled JavaScript (.js), TypeScript declarations (.d.ts), source maps (.map)
- Production run: `npm start` → `node dist/index.js` (shebang: `#!/usr/bin/env node`)

**Deployment Structure:**
- Package distribution: `npm pack` → Creates `.tgz` tarball with `dist/` and config files
- npm publish: Uploads tarball to npm registry
- User install: `npm install agent-monitor` → Downloads tarball, installs globally
- Execution: User runs `agent-monitor` → Binary executes `dist/index.js`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- ✅ All technology choices work together without conflicts - TypeScript 5.9.3, ink 6.6.0 (React 19.2.3), chokidar 5.0.0 are compatible
- ✅ Versions are compatible with each other - ink 6.6.0 supports React 19.2.3, chokidar 5.0.0 works with Node.js ES2020
- ✅ Patterns align with technology choices - Feature-based directories and immutable state updates are perfect for React/ink
- ✅ No contradictory decisions - All decisions build on each other (structure → errors → config → tests)

**Pattern Consistency:**
- ✅ Naming conventions consistent across all areas - camelCase for code, snake_case for config, co-located tests
- ✅ Structure patterns align with technology stack - Feature-based directories and immutable state match React/ink ecosystem
- ✅ Communication patterns coherent - Feature-based communication via function calls, state management via React hooks

**Structure Alignment:**
- ✅ Project structure supports all architectural decisions - Feature directories, shared utils, co-located tests
- ✅ Boundaries properly defined and respected - Public APIs via index.ts, clear service boundaries
- ✅ Integration points properly structured - Clear startup flow and data flow

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**

All FR categories have full architectural support:
- Real-Time Activity Monitoring (FR1-FR6) → `src/monitoring/logTailer.ts`
- Interactive Terminal UI (FR7-FR26) → `src/ui/App.tsx`
- Knowledge Capture (FR13-FR17) → `src/notes/notes.ts`
- Error Handling & Performance (FR27-FR35) → `src/utils/errors.ts` + performance tests

**Functional Requirements Coverage:**
- ✅ All 35 FRs are architecturally supported
- ✅ Cross-cutting concerns properly addressed (error handling, performance, state management)
- ✅ No missing architectural capabilities

**Non-Functional Requirements Coverage:**

All 14 NFRs have architectural support:
- ✅ Performance Constraints (NFR-P1 to P5) - Performance tests in test suite, circular buffer for memory management
- ✅ Integration Resilience (NFR-I1 to I5) - Custom error classes, hybrid error handling, chokidar file watching
- ✅ Reliability (NFR-R1 to R5) - Cross-platform libraries (chokidar, ink), TTY detection, error logging

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ All critical decisions documented with versions - Testing, configuration, CI/CD, performance monitoring, error handling
- ✅ Technology stack fully specified - TypeScript 5.9.3, ink 6.6.0, chokidar 5.0.0, React 19.2.3, Node.js ES2020
- ✅ Integration patterns defined - Startup flow, user input flow, data flow
- ✅ Performance considerations addressed - 4 NFRs with performance tests

**Structure Completeness:**
- ✅ Complete directory structure defined - Root, src/, utils/, config/, monitoring/, ui/, notes/, dist/
- ✅ Component boundaries established - Feature boundaries, service boundaries, data boundaries
- ✅ Integration points mapped - All internal and external integration points documented

**Pattern Completeness:**
- ✅ All potential conflict points addressed - 5 categories: naming, structure, format, error handling, state management
- ✅ Naming conventions comprehensive - camelCase for code, snake_case for config, PascalCase for types
- ✅ Communication patterns fully specified - Feature communication, error handling, state management
- ✅ Process patterns complete - Error handling, state management, test organization

### Gap Analysis Results

**Nice-to-Have Gaps:**

1. **Missing dependency specification:**
   - `date-fns` library mentioned in timestamp formatting but not documented as dependency
   - **Impact:** Agents might not know to install it
   - **Resolution:** Add to package.json or document explicit install command

2. **Missing YAML parser specification:**
   - YAML config loading mentioned but js-yaml library not explicitly documented
   - **Impact:** Agents might use different YAML parser or miss dependency
   - **Resolution:** Document js-yaml as required dependency

3. **Performance test mocking not fully specified:**
   - Performance tests defined but mocking strategy not detailed
   - **Impact:** Agents might implement mocking inconsistently
   - **Resolution:** Document performance test mocking approach (Jest timers, mock fs)

**No Critical or Important Gaps Found** - Architecture is ready for implementation

### Validation Issues Addressed

All gaps identified are nice-to-have refinements, not blocking. These can be addressed during implementation as experience reveals needs.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed
- [x] Implementation sequence documented
- [x] Cross-component dependencies identified

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented
- [x] Format patterns established
- [x] Enforcement guidelines created
- [x] Examples provided (good and anti-patterns)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete
- [x] Development workflow integrated
- [x] Build and deployment st
