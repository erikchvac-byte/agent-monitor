---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - prd.md
  - architecture.md
workflowType: epics
project_name: Lincoln
user_name: Erik
date: 2026-01-19
---

# Lincoln - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Lincoln, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

#### 1. Real-Time Activity Monitoring (FR1-FR6)
- FR1: Developer can observe agent actions as they occur in real-time
- FR2: Developer can view last 50 agent activities in a circular buffer
- FR3: Developer can view last 15 agent activities in activity feed display
- FR4: System can detect when log files are created, modified, or deleted
- FR5: System can parse JSONL format log entries into agent activity data
- FR6: System can extract agent name, action, timestamp, duration, and error information from log entries

#### 2. Visual Pattern Recognition (FR7-FR12)
- FR7: Developer can identify agent types by color-coded display (router/coordinator=blue, specialist=green, qa=yellow, unknown=gray)
- FR8: Developer can view success/failure status indicators (✓/✗) for each agent action
- FR9: Developer can view error messages prominently displayed for failed agent actions
- FR10: Developer can scroll backward through activity history to view earlier agent actions
- FR11: Developer can view formatted timestamps for each agent action
- FR12: Developer can view duration information for each agent action

#### 3. Knowledge Capture (FR13-FR17)
- FR13: Developer can enter note-taking mode to capture observations during monitoring
- FR14: System can auto-tag notes with active agents from last 10 seconds
- FR15: Developer can save notes with timestamps
- FR16: System can append notes to `progress-notes.txt` file
- FR17: System can display previously captured notes from `progress-notes.txt`

#### 4. Interactive Controls (FR18-FR26)
- FR18: Developer can press 'N' to enter note-taking mode
- FR19: Developer can press 'Q' to quit application
- FR20: Developer can press '?' to view help information
- FR21: Developer can press 'Esc' to cancel note-taking mode without saving
- FR22: Developer can type characters in note-taking mode
- FR23: Developer can press Enter to save a note and exit note-taking mode
- FR24: System can detect if terminal supports interactive keyboard input (TTY)
- FR25: System can display warning when running in non-interactive environment
- FR26: System can operate in read-only mode when interactive input is unavailable

#### 5. Error Handling (FR27-FR30)
- FR27: System can continue operation when log entries contain invalid JSON
- FR28: System can display errors when log files are not found
- FR29: System can display status messages for operation state (starting, monitoring, error)
- FR30: Developer can view system errors and warnings in terminal

#### 6. System Performance (FR31-FR35)
- FR31: System can maintain activity buffer of exactly 50 items
- FR32: System can automatically remove oldest activities when buffer exceeds capacity
- FR33: System can read last 20 lines from each log file on startup
- FR34: System can read last 5 lines from changed log files during operation
- FR35: System can limit displayed activities to last 15 items for performance

### NonFunctional Requirements

#### Performance (NFR-P1 to NFR-P5)
- NFR-P1: System shall display UI updates within 100ms from file change events
- NFR-P2: System shall detect log file changes within 500ms of file system events
- NFR-P3: System shall maintain memory usage under 50MB during operation
- NFR-P4: System shall complete startup (loading existing logs and initializing monitoring) within 5 seconds
- NFR-P5: System shall handle performance degradation gracefully: if UI becomes unresponsive, display warning and continue monitoring with reduced update frequency

#### Integration Resilience (NFR-I1 to NFR-I5)
- NFR-I1: System shall display clear error message when log directory `../Agents/logs/conversation_logs/` does not exist
- NFR-I2: System shall continue operation when individual log files are unreadable (permission denied, file corruption, or file locked)
- NFR-I3: System shall skip and continue when log entries contain invalid or malformed JSON
- NFR-I4: System shall detect and read new log files as they are created in the monitored directory
- NFR-I5: System shall handle file system events (creation, modification, deletion) consistently across Windows, macOS, and Linux

#### Reliability (NFR-R1 to NFR-R5)
- NFR-R1: System shall operate consistently across Windows, macOS, and Linux platforms with equivalent functionality
- NFR-R2: System shall not crash when encountering invalid log entries, missing directories, or file system errors
- NFR-R3: System shall display clear, actionable error messages for unrecoverable failures
- NFR-R4: System shall continue monitoring operation after recoverable errors (invalid JSON, file read failures) without requiring restart
- NFR-R5: System shall operate in read-only mode when interactive keyboard input is unavailable (non-TTY environment)

### Additional Requirements

#### Technology Stack Requirements
- TypeScript 5.9.3 with strict mode enabled
- ink 6.6.0 (React 19.2.3) for terminal UI
- chokidar 5.0.0 for cross-platform file watching
- Event-driven architecture pattern
- Observer pattern for activity updates
- Circular buffer pattern (50 items)
- Feature-based code organization: src/{config, monitoring, ui, notes}/
- Co-located tests with `.test.ts` suffix
- Custom error classes: AppError, ConfigError, FileSystemError, ParseError, TTYError
- Immutable state updates with spread operators
- Hybrid error handling (local recovery + centralized fatal handling)

#### File Structure Requirements
- src/utils/ for shared utilities (errors.ts, timestamp.ts, classifier.ts)
- src/config/ for configuration loading (loader.ts, schema.ts)
- src/monitoring/ for LogTailer (logTailer.ts)
- src/ui/ for UI components (App.tsx)
- src/notes/ for NoteWriter (notes.ts)
- All types in src/types.ts (single file)
- Public APIs via index.ts in each feature directory

#### Testing Requirements
- 80% code coverage target
- Performance tests for UI responsiveness (<100ms), file detection (<500ms), memory usage (<50MB), startup time (<5s)
- Unit tests for LogTailer (JSONL parsing, buffer logic), NoteWriter (timestamp formatting, auto-tagging)
- Integration tests for App (keyboard input, state transitions)
- Mock config in tests (no real file I/O)

#### Configuration Requirements
- Config file support with YAML format
- Environment variable overrides
- Config schema validation
- Runtime validation
- Config keys in snake_case (log_directory, buffer_size, notes_file, agent_colors, display_count)
- Default values: log_directory="../Agents/logs/conversation_logs/", buffer_size=50, notes_file="progress-notes.txt", display_count=15
- Color mappings: router=blue, specialist=green, qa=yellow, unknown=gray

### FR Coverage Map

| Epic | FR Coverage | User Roles |
|------|-------------|------------|
| Epic 1: Real-Time Activity Monitoring | FR1-FR6 | Developer, Team Lead |
| Epic 2: Visual Pattern Recognition | FR7-FR12 | Developer, New Team Member, Team Lead |
| Epic 3: Knowledge Capture | FR13-FR17 | Developer, Team Lead |
| Epic 4: Interactive Controls | FR18-FR26 | Developer, New Team Member, Team Lead |
| Epic 5: Error Handling | FR27-FR30 | Developer, Team Lead |
| Epic 6: System Performance | FR31-FR35 | Developer, New Team Member, Team Lead |

## Epic List

1. **Epic 1: Real-Time Activity Monitoring** - Enable real-time observation of MCP agent actions from JSONL log files
2. **Epic 2: Visual Pattern Recognition** - Provide color-coded visual indicators for agent types, status, and error patterns
3. **Epic 3: Knowledge Capture** - Enable interactive note-taking with auto-tagging for capturing observations
4. **Epic 4: Interactive Controls** - Provide keyboard-based navigation and interaction for all user roles
5. **Epic 5: Error Handling** - Implement graceful error handling and clear messaging for system failures
6. **Epic 6: System Performance** - Ensure responsive performance with efficient memory management and buffering

---

## Epic 1: Real-Time Activity Monitoring

**Epic Goal:** Enable developers and team leads to observe MCP agent actions in real-time as they occur, transforming manual log parsing into instant visual feedback.

### Story 1.1: Observe Agent Actions in Real-Time

As a **Developer** debugging an agent workflow,
I want to observe agent actions as they occur in real-time,
So that I can identify issues immediately without waiting for log files to complete or manually parsing raw JSON.

**Acceptance Criteria:**

**Given** the Agent Monitor is running and log directory `../Agents/logs/conversation_logs/` exists
**When** a new log entry is written to a monitored log file
**Then** the activity is displayed in the terminal UI within 100ms of the file write event
**And** the activity appears at the top of the activity feed with correct timestamp, agent name, and action

### Story 1.2: View Activity Buffer of 50 Items

As a **Team Lead** monitoring system behavior patterns,
I want to view the last 50 agent activities in a circular buffer,
So that I can trace recent workflow sequences and identify recurring patterns.

**Acceptance Criteria:**

**Given** Agent Monitor is running and monitoring log files
**When** more than 50 activities have been recorded
**Then** the buffer maintains exactly the 50 most recent activities
**And** older activities beyond 50 are automatically removed (FIFO)
**And** the buffer remains consistent even during high-frequency log updates

### Story 1.3: Display Last 15 Activities in Feed

As a **Developer** debugging an agent workflow,
I want to view the last 15 agent activities in the activity feed display,
So that I can focus on recent events without overwhelming the terminal display.

**Acceptance Criteria:**

**Given** Agent Monitor is running and the buffer contains 50 activities
**When** the terminal UI renders
**Then** only the most recent 15 activities are displayed in the activity feed
**And** older activities are accessible via scrolling
**And** the display updates in real-time as new activities arrive

### Story 1.4: Detect Log File Changes

As a **Developer** monitoring agent activity,
I want the system to detect when log files are created, modified, or deleted,
So that I always see the most current agent activity without manual refresh.

**Acceptance Criteria:**

**Given** Agent Monitor is running and watching the log directory
**When** a new log file is created in the monitored directory
**Then** the system immediately detects the new file and begins monitoring it
**And** new entries from that file appear in the activity feed
**When** a log file is modified with new entries
**Then** the system detects the file change and reads the new entries
**When** a log file is deleted
**Then** the system gracefully handles the deletion and continues monitoring other files

### Story 1.5: Parse JSONL Log Entries

As a **Developer** debugging an agent workflow,
I want the system to parse JSONL format log entries into agent activity data,
So that I can view structured, readable activity information instead of raw JSON strings.

**Acceptance Criteria:**

**Given** Agent Monitor is reading a log file with JSONL format (one JSON object per line)
**When** a line is read from the log file
**Then** the system parses the line as JSON
**And** extracts fields into a structured Activity object (agent, action, timestamp, duration, error)
**And** handles parsing errors gracefully without crashing

### Story 1.6: Extract Activity Information

As a **Team Lead** monitoring system behavior,
I want the system to extract agent name, action, timestamp, duration, and error information from log entries,
So that I can view comprehensive activity details for pattern analysis.

**Acceptance Criteria:**

**Given** a log entry is successfully parsed as JSON
**When** the system extracts activity information
**Then** the agent name field is populated from the log entry's "agent" property
**And** the action field is populated from the log entry's "action" property
**And** the timestamp field is populated from the log entry's "timestamp" property in ISO 8601 format
**And** the duration_ms field is populated from the log entry's "duration_ms" property if present
**And** the error field is populated from the log entry's "error" property if present

---

## Epic 2: Visual Pattern Recognition

**Epic Goal:** Enable developers, new team members, and team leads to visually identify agent types, success/failure states, and workflow patterns through color-coded displays and status indicators.

### Story 2.1: Color-Coded Agent Type Display

As a **New Team Member** onboarding to agent workflows,
I want to identify agent types by color-coded display (router/coordinator=blue, specialist=green, qa=yellow, unknown=gray),
So that I can quickly learn agent roles and workflow patterns through visual observation.

**Acceptance Criteria:**

**Given** Agent Monitor is displaying agent activities
**When** an activity is displayed for a router or coordinator agent
**Then** the agent name is displayed in blue color
**When** an activity is displayed for a specialist agent
**Then** the agent name is displayed in green color
**When** an activity is displayed for a QA agent (critic, repair, debug)
**Then** the agent name is displayed in yellow color
**When** an activity is displayed for an unknown agent type
**Then** the agent name is displayed in gray color

### Story 2.2: Success/Failure Status Indicators

As a **Developer** debugging an agent workflow,
I want to view success/failure status indicators (✓/✗) for each agent action,
So that I can instantly identify which agents succeeded or failed without reading error messages.

**Acceptance Criteria:**

**Given** Agent Monitor is displaying agent activities
**When** an agent action completes successfully (no error field)
**Then** a green checkmark (✓) is displayed next to the activity
**When** an agent action fails (error field is present)
**Then** a red cross (✗) is displayed next to the activity
**And** the status indicator is clearly visible and color-coded

### Story 2.3: Prominent Error Message Display

As a **Developer** debugging agent failures,
I want to view error messages prominently displayed for failed agent actions,
So that I can quickly understand the root cause of failures without digging through log files.

**Acceptance Criteria:**

**Given** an agent action has failed and error information is present
**When** the activity is displayed in the feed
**Then** the error message is displayed prominently below the action description
**And** the error message is displayed in red color to draw attention
**And** the error message is truncated if too long to fit the terminal width

### Story 2.4: Scrollable Activity History

As a **Team Lead** analyzing workflow patterns,
I want to scroll backward through activity history to view earlier agent actions,
So that I can trace the sequence of events leading to specific outcomes.

**Acceptance Criteria:**

**Given** Agent Monitor is running and the buffer contains more than 15 activities
**When** the user scrolls backward (up arrow or page up)
**Then** the activity feed shifts to display earlier activities
**When** the user scrolls forward (down arrow or page down)
**Then** the activity feed shifts to display later activities
**And** scrolling continues until the oldest activity in the buffer is displayed

### Story 2.5: Formatted Timestamp Display

As a **New Team Member** learning agent workflow timing,
I want to view formatted timestamps for each agent action,
So that I can understand the sequence and timing of agent operations.

**Acceptance Criteria:**

**Given** Agent Monitor is displaying agent activities
**When** an activity is displayed with a timestamp less than 1 hour ago
**Then** the timestamp is displayed in relative format (e.g., "2s ago", "5m ago")
**When** an activity is displayed with a timestamp 1 hour or more ago
**Then** the timestamp is displayed in absolute format (HH:mm:ss)
**And** the timestamp is formatted consistently across all activities

### Story 2.6: Duration Information Display

As a **Team Lead** identifying performance bottlenecks,
I want to view duration information for each agent action,
So that I can identify slow agents and optimize system performance.

**Acceptance Criteria:**

**Given** Agent Monitor is displaying agent activities
**When** an activity has a duration_ms field populated
**Then** the duration is displayed in milliseconds next to the action description
**When** an activity does not have a duration_ms field
**Then** no duration information is displayed
**And** the duration is formatted consistently (e.g., "1234ms", "56ms")

---

## Epic 3: Knowledge Capture

**Epic Goal:** Enable developers and team leads to capture observations during monitoring sessions with auto-tagging, preserving insights for future reference and team knowledge sharing.

### Story 3.1: Enter Note-Taking Mode

As a **Developer** debugging an agent workflow,
I want to enter note-taking mode to capture observations during monitoring,
So that I can document insights as they occur without leaving the monitoring session.

**Acceptance Criteria:**

**Given** Agent Monitor is running in normal mode
**When** the user presses the 'N' key
**Then** the system transitions to note-taking mode
**And** a text input prompt is displayed
**And** the activity feed remains visible in the background
**And** the prompt indicates "Note mode - type your observation and press Enter to save"

### Story 3.2: Auto-Tag Notes with Active Agents

As a **Team Lead** capturing workflow patterns,
I want the system to auto-tag notes with active agents from the last 10 seconds,
So that I can quickly identify which agents were involved when I made an observation.

**Acceptance Criteria:**

**Given** Agent Monitor is in note-taking mode
**When** the user types and saves a note
**Then** the system identifies all unique agent names from activities in the last 10 seconds
**And** the saved note includes an auto-tag list: "[Agent: agent1, agent2, ...]"
**And** if no agents were active in the last 10 seconds, no agent tag is added

### Story 3.3: Save Notes with Timestamps

As a **Developer** documenting debugging progress,
I want to save notes with timestamps,
So that I can correlate observations with specific events and track progress over time.

**Acceptance Criteria:**

**Given** Agent Monitor is in note-taking mode and the user has typed a note
**When** the user presses Enter
**Then** the note is saved with a timestamp in ISO 8601 format
**And** the timestamp reflects the exact time the note was saved (YYYY-MM-DD HH:MM:SS)
**And** the timestamp is formatted as: `[YYYY-MM-DD HH:MM:SS]` at the beginning of the note

### Story 3.4: Append Notes to Progress File

As a **Team Lead** capturing insights for team sharing,
I want the system to append notes to `progress-notes.txt` file,
So that the entire team can access shared observations and patterns.

**Acceptance Criteria:**

**Given** Agent Monitor is in note-taking mode and a note is ready to save
**When** the user presses Enter
**Then** the note is appended to the `progress-notes.txt` file in the project root
**And** the note format is: `[YYYY-MM-DD HH:MM:SS] [Agent: agent1, agent2] Note text`
**And** the file is created if it does not exist
**And** existing notes in the file are preserved (append-only)

### Story 3.5: Display Previously Captured Notes

As a **New Team Member** learning from previous observations,
I want the system to display previously captured notes from `progress-notes.txt`,
So that I can learn from team insights and understand recurring patterns.

**Acceptance Criteria:**

**Given** Agent Monitor is running and `progress-notes.txt` exists
**When** the user presses the appropriate key to view notes (or notes are displayed automatically)
**Then** the contents of `progress-notes.txt` are displayed in a readable format
**And** notes are displayed with their full timestamp and agent tags preserved
**And** the notes display can be dismissed to return to the activity feed

---

## Epic 4: Interactive Controls

**Epic Goal:** Provide keyboard-based navigation and interaction for all user roles (Developer, New Team Member, Team Lead) to control the monitoring tool and access its features.

### Story 4.1: Press N to Enter Note Mode

As a **Developer** capturing debugging insights,
I want to press 'N' to enter note-taking mode,
So that I can quickly document observations without complex navigation.

**Acceptance Criteria:**

**Given** Agent Monitor is running in normal mode
**When** the user presses the 'N' key
**Then** the system transitions to note-taking mode
**And** a text input prompt appears
**And** keyboard input is captured for note text
**And** the system ignores other keyboard commands while in note mode

### Story 4.2: Press Q to Quit Application

As a **Developer** finishing a monitoring session,
I want to press 'Q' to quit the application,
So that I can cleanly exit the tool without manual termination.

**Acceptance Criteria:**

**Given** Agent Monitor is running in normal mode
**When** the user presses the 'Q' key
**Then** the system stops file watching
**And** the system closes the terminal UI cleanly
**And** the application exits with status code 0

### Story 4.3: Press ? to View Help

As a **New Team Member** learning to use the tool,
I want to press '?' to view help information,
So that I can quickly learn available keyboard commands and features.

**Acceptance Criteria:**

**Given** Agent Monitor is running in normal mode
**When** the user presses the '?' key
**Then** a help screen is displayed with all available keyboard commands
**And** the help screen lists: N (note mode), Q (quit), ? (help), Esc (cancel), Enter (save note)
**And** the help screen can be dismissed by pressing '?' again or any other key

### Story 4.4: Press Esc to Cancel Note Mode

As a **Developer** abandoning a note entry,
I want to press 'Esc' to cancel note-taking mode without saving,
So that I can exit note mode without creating empty or unwanted notes.

**Acceptance Criteria:**

**Given** Agent Monitor is in note-taking mode with text entered
**When** the user presses the 'Esc' key
**Then** the note input is discarded (not saved)
**And** the system transitions back to normal mode
**And** the activity feed continues to update in real-time

### Story 4.5: Type Characters in Note Mode

As a **Team Lead** documenting detailed observations,
I want to type characters in note-taking mode,
So that I can capture detailed insights and context.

**Acceptance Criteria:**

**Given** Agent Monitor is in note-taking mode
**When** the user types characters on the keyboard
**Then** the characters are displayed in the text input prompt
**And** the user can type up to a reasonable length (e.g., 500 characters)
**And** special characters (spaces, punctuation) are handled correctly
**And** the backspace key deletes the last character

### Story 4.6: Press Enter to Save Note

As a **Developer** completing a note entry,
I want to press Enter to save a note and exit note-taking mode,
So that I can quickly save observations and return to monitoring.

**Acceptance Criteria:**

**Given** Agent Monitor is in note-taking mode with text entered
**When** the user presses the Enter key
**Then** the note is saved to `progress-notes.txt` with timestamp and auto-tags
**And** the system transitions back to normal mode
**And** the text input is cleared
**And** a confirmation message is briefly displayed

### Story 4.7: Detect TTY Support

As a **Developer** running the tool in various terminal environments,
I want the system to detect if terminal supports interactive keyboard input (TTY),
So that the tool can provide appropriate warnings or read-only mode behavior.

**Acceptance Criteria:**

**Given** Agent Monitor is starting up
**When** the system checks for TTY support using `process.stdin.isTTY`
**Then** the system detects whether interactive keyboard input is available
**And** the system enables full interactive features if TTY is available
**And** the system enables read-only mode if TTY is not available

### Story 4.8: Display Non-Interactive Warning

As a **Developer** running the tool in a non-interactive environment,
I want the system to display a warning when running in a non-interactive environment,
So that I understand why keyboard commands are not responding.

**Acceptance Criteria:**

**Given** Agent Monitor detects that TTY is not available (e.g., piped output, redirected stdin)
**When** the application starts
**Then** a warning message is displayed: "Warning: Non-interactive environment detected. Running in read-only mode."
**And** the warning explains that keyboard commands are disabled
**And** the activity feed continues to display in read-only mode

### Story 4.9: Operate in Read-Only Mode

As a **Team Lead** monitoring system output in a CI/CD pipeline,
I want the system to operate in read-only mode when interactive input is unavailable,
So that I can still view agent activity without interactive features.

**Acceptance Criteria:**

**Given** Agent Monitor is running in read-only mode (non-TTY environment)
**When** the system receives keyboard input
**Then** the input is ignored (no commands executed)
**And** the activity feed continues to update in real-time
**And** all file watching and parsing features work normally
**And** the tool does not crash or throw errors due to missing keyboard input

---

## Epic 5: Error Handling

**Epic Goal:** Implement graceful error handling and clear messaging for system failures, ensuring the tool remains stable and provides actionable feedback to developers and team leads.

### Story 5.1: Continue Operation with Invalid JSON

As a **Developer** monitoring agent logs with occasional malformed entries,
I want the system to continue operation when log entries contain invalid JSON,
So that the monitoring session continues without interruption from bad data.

**Acceptance Criteria:**

**Given** Agent Monitor is reading a log file
**When** a line is read that contains invalid or malformed JSON
**Then** the system logs an error to stderr with the line number and parse error details
**And** the system skips that line and continues processing subsequent lines
**And** the activity feed continues to display valid entries without interruption
**And** the monitoring session does not crash

### Story 5.2: Display Error for Missing Log Files

As a **Developer** starting the monitoring tool,
I want the system to display errors when log files are not found,
So that I can quickly identify configuration issues and fix them.

**Acceptance Criteria:**

**Given** Agent Monitor is starting up
**When** the log directory `../Agents/logs/conversation_logs/` does not exist
**Then** the system displays a clear error message: "Error: Log directory not found: ../Agents/logs/conversation_logs/"
**And** the error message suggests verifying the path or creating the directory
**And** the application exits with status code 1
**When** individual log files are not found during operation
**Then** the system logs a warning to stderr and continues monitoring other files

### Story 5.3: Display Operation State Messages

As a **Team Lead** monitoring system health,
I want the system to display status messages for operation state (starting, monitoring, error),
So that I can understand the current system state and diagnose issues.

**Acceptance Criteria:**

**Given** Agent Monitor is running
**When** the application starts
**Then** a "Starting" status message is displayed
**When** file watching is initialized successfully
**Then** a "Monitoring" status message is displayed with the log directory path
**When** an error occurs
**Then** an "Error" status message is displayed with the error details
**And** status messages are displayed in a consistent location in the terminal UI

### Story 5.4: View System Errors and Warnings

As a **Developer** debugging the monitoring tool itself,
I want to view system errors and warnings in terminal,
So that I can diagnose issues with the monitoring tool or log files.

**Acceptance Criteria:**

**Given** Agent Monitor is running
**When** a system error occurs (e.g., file read failure, parse error)
**Then** the error is logged to stderr with a timestamp
**And** the error includes the error type (e.g., "[ParseError]", "[FileSystemError]")
**And** the error includes a descriptive message
**And** the error includes a suggested user action (e.g., "Verify log file format")
**When** a warning occurs (e.g., skipped invalid JSON)
**Then** the warning is logged to stderr with a timestamp
**And** warnings are distinguishable from errors (e.g., "[Warning]" prefix)

---

## Epic 6: System Performance

**Epic Goal:** Ensure responsive performance with efficient memory management and buffering, enabling all user roles (Developer, New Team Member, Team Lead) to monitor agent activity without performance degradation.

### Story 6.1: Maintain Activity Buffer of 50 Items

As a **Team Lead** monitoring system behavior over time,
I want the system to maintain an activity buffer of exactly 50 items,
So that I can trace recent activity patterns without excessive memory usage.

**Acceptance Criteria:**

**Given** Agent Monitor is running
**When** activities are added to the buffer
**Then** the buffer never exceeds 50 items
**And** the buffer maintains exactly the 50 most recent activities when 50+ activities have been recorded
**And** the buffer data structure efficiently maintains the FIFO (First In, First Out) order
**And** memory usage remains under 50MB regardless of total activities processed

### Story 6.2: Automatically Remove Oldest Activities

As a **Developer** monitoring high-frequency agent activity,
I want the system to automatically remove oldest activities when buffer exceeds capacity,
So that the tool remains responsive and doesn't consume excessive memory.

**Acceptance Criteria:**

**Given** the activity buffer contains 50 items
**When** a new activity arrives
**Then** the oldest activity is automatically removed from the buffer
**And** the new activity is added to the buffer
**And** the buffer maintains exactly 50 items
**And** the removal happens efficiently without performance impact

### Story 6.3: Read Last 20 Lines on Startup

As a **New Team Member** starting a monitoring session,
I want the system to read the last 20 lines from each log file on startup,
So that I can see recent agent activity immediately when the tool starts.

**Acceptance Criteria:**

**Given** Agent Monitor is starting up
**When** log files exist in the monitored directory
**Then** the system reads the last 20 lines from each log file
**And** the system parses these lines as activities
**And** the activities are displayed in the activity feed (up to the buffer limit of 50)
**And** startup completes within 5 seconds (NFR-P4)

### Story 6.4: Read Last 5 Lines on File Change

As a **Developer** monitoring real-time agent activity,
I want the system to read the last 5 lines from changed log files during operation,
So that I see new activity without re-reading entire files.

**Acceptance Criteria:**

**Given** Agent Monitor is running and monitoring log files
**When** a log file is modified (file change event detected)
**Then** the system reads only the last 5 lines from that file
**And** these lines are parsed as new activities
**And** duplicate activities (already in buffer) are not added
**And** only genuinely new activities are displayed

### Story 6.5: Limit Displayed Activities to 15 Items

As a **Team Lead** analyzing patterns without terminal clutter,
I want the system to limit displayed activities to the last 15 items for performance,
So that the terminal remains readable and responsive.

**Acceptance Criteria:**

**Given** the activity buffer contains 50 items
**When** the terminal UI renders the activity feed
**Then** only the most recent 15 activities are displayed
**And** older activities are accessible via scrolling
**And** the display updates smoothly as new activities arrive
**And** rendering performance remains within 100ms update target (NFR-P1)

---

## Requirements Coverage Summary

This epic breakdown provides complete coverage of all 35 functional requirements organized into 6 epics, each addressing a specific capability area:

- **Epic 1 (Real-Time Activity Monitoring)**: FR1-FR6 - Core file watching and parsing infrastructure
- **Epic 2 (Visual Pattern Recognition)**: FR7-FR12 - Visual feedback and pattern recognition features
- **Epic 3 (Knowledge Capture)**: FR13-FR17 - Note-taking and knowledge persistence
- **Epic 4 (Interactive Controls)**: FR18-FR26 - Keyboard interaction and user control
- **Epic 5 (Error Handling)**: FR27-FR30 - Graceful error handling and messaging
- **Epic 6 (System Performance)**: FR31-FR35 - Performance optimization and resource management

All stories include appropriate user role assignments (Developer, New Team Member, Team Lead) based on the primary beneficiary of each capability, and BDD-format acceptance criteria for clear, testable implementation requirements.
