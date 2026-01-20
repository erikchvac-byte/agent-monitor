# Local Agent Delegation Guide - Lincoln Project

**Version:** 1.0  
**Project:** Lincoln (Agent Monitor)  
**Last Updated:** 2026-01-19  
**Owner:** Erik

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What You Receive](#what-you-receive)
3. [Your Responsibilities](#your-responsibilities)
4. [Story File Format](#story-file-format)
5. [Implementation Workflow](#implementation-workflow)
6. [Testing Requirements](#testing-requirements)
7. [Updating the Story File](#updating-the-story-file)
8. [Signaling Ready for Review](#signaling-ready-for-review)
9. [Code Review Process](#code-review-process)
10. [Handling Review Feedback](#handling-review-feedback)
11. [Quality Bar & Best Practices](#quality-bar--best-practices)
12. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
13. [Quick Reference](#quick-reference)

---

## Overview

### Your Role

You are a **local AI agent** working on the Lincoln project (Agent Monitor CLI tool). You will receive story files from Erik (via Claude Code), implement the requirements, and submit your work for adversarial code review.

### The Workflow

```
1. Erik assigns you a story file
   ↓
2. You read the story (ACs, tasks, dev notes)
   ↓
3. You implement the requirements
   ↓
4. You write comprehensive tests
   ↓
5. You update the story file (mark tasks, fill Dev Agent Record)
   ↓
6. You commit your work to git
   ↓
7. You signal "ready for review" (Status: review)
   ↓
8. Claude runs adversarial code review
   ↓
9a. If issues found → You address them → Repeat from step 8
9b. If no issues → Story marked "done" → Next story!
```

### Success Criteria

- ✅ All Acceptance Criteria implemented
- ✅ All tasks checked off `[x]`
- ✅ Comprehensive tests (unit + integration + performance)
- ✅ Dev Agent Record filled out completely
- ✅ Code passes adversarial review (0 CRITICAL/HIGH issues)
- ✅ Git commits cleanly describe work

---

## What You Receive

### Story File Location

```
_bmad-output/implementation-artifacts/stories/[story-key].md

Example:
_bmad-output/implementation-artifacts/stories/1-1-observe-agent-actions-in-real-time.md
```

### Story File Contains

1. **Story Header**
   - Story ID (e.g., "1.1")
   - Title
   - Current Status (`ready-for-dev`, `in-progress`, `review`, `done`)

2. **User Story**
   - As a [role], I want [action], so that [benefit]

3. **Acceptance Criteria (ACs)**
   - Given/When/Then format
   - **These are your success criteria!**

4. **Context**
   - Business value
   - User impact
   - Why this story matters

5. **Tasks / Subtasks**
   - Detailed breakdown of work
   - **You must check these off as `[x]` when complete**

6. **Dev Notes**
   - Architecture patterns
   - Technology stack details
   - File structure requirements
   - Testing requirements
   - Error handling strategy
   - State management patterns
   - Naming conventions
   - Critical success factors
   - Common pitfalls to avoid

7. **Dev Agent Record** (Empty - YOU fill this out)
   - Agent Model Used
   - Debug Log References
   - Completion Notes
   - File List

8. **Review Follow-ups** (If present from previous review)
   - Action items from code review
   - Issues to fix
   - **Address these first if they exist!**

---

## Your Responsibilities

### 1. Read Completely

- ✅ Read the **entire story file** before starting
- ✅ Understand all Acceptance Criteria
- ✅ Study the Dev Notes section carefully
- ✅ Review architecture patterns
- ✅ Note the "Common Pitfalls to Avoid" section

### 2. Implement Requirements

- ✅ Implement all Acceptance Criteria
- ✅ Complete all tasks and subtasks
- ✅ Follow architecture patterns documented in Dev Notes
- ✅ Use technology stack specified (versions matter!)
- ✅ Follow naming conventions (camelCase, PascalCase, etc.)
- ✅ Implement error handling per documented strategy
- ✅ Use immutable state updates (never mutate)

### 3. Write Tests

- ✅ Unit tests for all classes/functions
- ✅ Integration tests for components
- ✅ Performance tests for NFR validation
- ✅ Real assertions (not placeholders)
- ✅ Mock appropriately (file system, external deps)
- ✅ Co-locate tests: `fileName.test.ts` next to `fileName.ts`

### 4. Document Your Work

- ✅ Mark tasks complete: `- [x] Task description`
- ✅ Fill out Dev Agent Record completely
- ✅ List all files created/modified
- ✅ Write clear git commit messages
- ✅ Add code comments where logic is complex

### 5. Validate Before Submitting

- ✅ Run tests: `npm test` (all pass)
- ✅ Run build: `npm run build` (no errors)
- ✅ Run app: `npm run dev` (works as expected)
- ✅ Check git status: All files committed
- ✅ Review story file: All sections filled out

---

## Story File Format

### Story Header Example

```markdown
# Story 1.1: Observe Agent Actions in Real-Time

Status: ready-for-dev

<!-- You'll change this to "review" when ready -->
```

### Acceptance Criteria Example

```markdown
## Acceptance Criteria

**Given** the Agent Monitor is running and log directory exists
**When** a new log entry is written to a monitored log file
**Then** the activity is displayed in the terminal UI within 100ms
**And** the activity appears at the top of the activity feed
```

**Your job:** Make these statements true!

### Tasks Example

```markdown
## Tasks / Subtasks

- [ ] **Task 1: Implement LogTailer class**
  - [ ] Subtask 1.1: Initialize chokidar watcher
  - [ ] Subtask 1.2: Handle file system events
  - [ ] Subtask 1.3: Read last 20 lines on startup
```

**Your job:** Implement each, then mark as `[x]`

### Dev Notes Section

**This is your implementation guide!**

Key subsections:

- **Architecture Patterns** - How components should work together
- **Technology Stack Details** - Exact library versions and configuration
- **File Structure Requirements** - Where to create files
- **Testing Requirements** - What tests to write
- **Error Handling Strategy** - How to handle errors
- **State Management Patterns** - How to manage state (immutable!)
- **Naming Conventions** - camelCase, PascalCase rules
- **Critical Success Factors** - Patterns ALL future stories depend on
- **Common Pitfalls to Avoid** - ❌ DO NOT and ✅ DO lists

**Read this section carefully!** It prevents mistakes.

---

## Implementation Workflow

### Step 1: Analyze the Story (15-30 minutes)

```bash
# Read the story file completely
cat _bmad-output/implementation-artifacts/stories/1-1-observe-agent-actions-in-real-time.md

# Study these sections carefully:
# 1. Acceptance Criteria - What success looks like
# 2. Tasks/Subtasks - What to implement
# 3. Dev Notes > Architecture Patterns - How to implement
# 4. Dev Notes > Common Pitfalls - What to avoid
```

**Checklist:**

- [ ] I understand all Acceptance Criteria
- [ ] I know which files to create/modify
- [ ] I understand the architecture pattern
- [ ] I know what tests are required
- [ ] I know what pitfalls to avoid

### Step 2: Set Up Your Environment (5 minutes)

```bash
# Ensure dependencies installed
npm install

# Verify tests work
npm test

# Verify build works
npm run build

# Verify dev server works
npm run dev
```

### Step 3: Implement (Main Work)

**Follow this order:**

1. **Create types first** (if needed)
   - Define interfaces in `src/types.ts`
   - Follow PascalCase for types/interfaces

2. **Implement core logic**
   - Create classes/functions in appropriate files
   - Follow naming conventions (camelCase for functions/vars)
   - Use TypeScript strict mode (no `any`)
   - Follow architecture patterns from Dev Notes

3. **Add error handling**
   - Use try-catch for recoverable errors
   - Throw for fatal errors
   - Log to stderr with proper format: `[timestamp] [errorType] message`

4. **Integrate with UI (if applicable)**
   - Use React hooks (useState, useEffect)
   - Immutable state updates (spread operators)
   - Never mutate state directly

### Step 4: Write Tests (Critical!)

**Unit Tests:**

```typescript
// src/__tests__/logTailer.test.ts
import { LogTailer } from '../logTailer.js';

describe('LogTailer', () => {
  describe('JSONL Parsing', () => {
    it('should parse valid JSONL entry', () => {
      // Test implementation
    });

    it('should handle invalid JSON gracefully', () => {
      // Test error recovery
    });
  });

  describe('Circular Buffer', () => {
    it('should maintain exactly 50 items', () => {
      // Test FIFO overflow
    });
  });

  describe('Performance', () => {
    it('should detect file changes within 500ms', async () => {
      // Test NFR-P2
    });
  });
});
```

**Integration Tests:**

```typescript
// src/__tests__/App.test.tsx
import { render } from 'ink-testing-library';
import { App } from '../App.js';

describe('App Integration', () => {
  it('should update activity state when LogTailer emits', () => {
    // Mock LogTailer, test state updates
  });

  it('should display last 15 of 50 activities', () => {
    // Test rendering logic
  });
});
```

**Performance Tests:**

```typescript
describe('Performance', () => {
  it('should update UI within 100ms', async () => {
    const start = Date.now();
    // Trigger activity
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
```

### Step 5: Validate Your Work (Pre-Review Checklist)

```bash
# Run all tests
npm test
# ✅ All tests pass

# Run build
npm run build
# ✅ No TypeScript errors

# Run the application
npm run dev
# ✅ Works as expected, ACs are met

# Check git status
git status
# ✅ All new/modified files are staged

# Review your changes
git diff --cached
# ✅ Changes match tasks in story
```

---

## Testing Requirements

### Minimum Test Coverage

- **Unit Tests:** All functions, classes, methods
- **Integration Tests:** Component interactions
- **Performance Tests:** NFR validation (timing, memory)
- **Target Coverage:** 80% (aim for this)

### Test File Naming

```
src/logTailer.ts       → src/__tests__/logTailer.test.ts
src/App.tsx            → src/__tests__/App.test.tsx
src/notes.ts           → src/__tests__/notes.test.ts
```

### Test Structure

```typescript
describe('ClassName or Feature', () => {
  describe('Method or Behavior', () => {
    it('should do something specific', () => {
      // Arrange
      const input = setupTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe('Performance', () => {
    it('should meet NFR requirement', () => {
      // Measure actual performance
    });
  });
});
```

### What Makes a Good Test?

✅ **Good Test:**

```typescript
it('should parse valid JSONL and extract fields', () => {
  const line =
    '{"agent":"Router","action":"route","timestamp":"2026-01-19T10:00:00Z","duration_ms":50}';
  const result = logTailer.parseLine(line);

  expect(result).not.toBeNull();
  expect(result?.agent).toBe('Router');
  expect(result?.action).toBe('route');
  expect(result?.duration_ms).toBe(50);
});
```

❌ **Bad Test (Placeholder):**

```typescript
it('should parse JSONL', () => {
  expect(true).toBe(true); // ❌ Tests nothing!
});
```

### Performance Test Example

```typescript
describe('Performance', () => {
  it('should detect file changes within 500ms', async () => {
    const logTailer = new LogTailer();
    const activityReceived = jest.fn();

    await logTailer.start(activityReceived);

    const start = Date.now();

    // Simulate file change
    fs.writeFileSync(testLogFile, newLogEntry);

    // Wait for callback
    await waitFor(() => activityReceived.mock.calls.length > 0, {
      timeout: 500,
    });

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500); // NFR-P2
  });
});
```

---

## Updating the Story File

### Mark Tasks Complete

**Before:**

```markdown
- [ ] **Task 1: Implement LogTailer class**
  - [ ] Subtask 1.1: Initialize chokidar watcher
  - [ ] Subtask 1.2: Handle file system events
```

**After (when complete):**

```markdown
- [x] **Task 1: Implement LogTailer class**
  - [x] Subtask 1.1: Initialize chokidar watcher
  - [x] Subtask 1.2: Handle file system events
```

**Rule:** Only mark `[x]` when ACTUALLY DONE. Code review validates this!

### Fill Out Dev Agent Record

**Template:**

```markdown
## Dev Agent Record

### Agent Model Used

<Your-Agent-Name> <Version>
Example: Windsurf Cascade 1.0 or Claude Sonnet 3.5 or Cursor AI

### Debug Log References

<Optional: Link to debug logs if applicable>
Example: See .cursor/logs/implementation-2026-01-19.log

### Completion Notes List

<Summary of your implementation approach>
Example:
- Implemented LogTailer using chokidar 5.0.0 for file watching
- Created circular buffer with FIFO overflow handling
- Added comprehensive unit tests with 85% coverage
- All acceptance criteria validated and met
- Performance tests confirm <100ms UI updates (measured 45ms avg)

### File List

<All files you created or modified>
Example:
- src/logTailer.ts (created - 178 lines)
- src/App.tsx (modified - added activity feed)
- src/types.ts (modified - added Activity interface)
- src/__tests__/logTailer.test.ts (created - 120 lines)
- src/__tests__/App.test.tsx (created - 85 lines)
```

**Why this matters:** Code review cross-references this with git reality!

### Address Review Follow-ups (If Present)

If your story has a "Review Follow-ups" section, **start here**:

```markdown
### Review Follow-ups (Code Review - 2026-01-19)

- [ ] **[AI-Review][CRITICAL]** Update story Dev Agent Record
- [ ] **[AI-Review][HIGH]** Create logTailer.test.ts
- [ ] **[AI-Review][MEDIUM]** Fix LogTailer instance creation
```

**Your job:**

1. Read each action item
2. Implement the fix
3. Check it off: `- [x]`
4. Note what you did in Completion Notes

---

## Signaling Ready for Review

### Update Story Status

**Before submitting:**

```markdown
# Story 1.1: Observe Agent Actions in Real-Time

Status: in-progress # ← Change this!
```

**After completing work:**

```markdown
# Story 1.1: Observe Agent Actions in Real-Time

Status: review # ← Signals ready for code review
```

### Commit Your Work

```bash
# Stage all changes
git add .

# Commit with clear message
git commit -m "Implement Story 1.1: Real-time activity monitoring

- Implemented LogTailer with chokidar file watching
- Added circular buffer (50 items) with FIFO overflow
- Created React/ink UI with activity feed display
- Implemented JSONL parsing with error recovery
- Added comprehensive test suite (85% coverage)
- All acceptance criteria met and validated"

# Verify commit
git log -1 --stat
```

### Notify Erik

**Message to Erik:**

```
Story 1.1 ready for review!

File: _bmad-output/implementation-artifacts/stories/1-1-observe-agent-actions-in-real-time.md
Status: review
Commit: <commit-hash>

Summary:
- All 4 tasks complete (18/18 subtasks)
- Comprehensive tests added (logTailer.test.ts, App.test.tsx)
- Dev Agent Record filled out
- All ACs validated

Please run code-review workflow when convenient.
```

---

## Code Review Process

### What Happens When Erik Runs Review

```bash
# Erik runs:
/bmad:bmm:workflows:code-review

# Code review workflow:
1. Loads your story file
2. Discovers git changes (git status, git diff)
3. Extracts Acceptance Criteria
4. Extracts Tasks/Subtasks (checks [x] status)
5. Reads your Dev Agent Record
6. Cross-references story claims vs git reality
7. Reviews code quality, security, performance
8. Validates test quality (real assertions vs placeholders)
9. Finds 3-10 issues minimum (adversarial!)
10. Presents findings
```

### What Code Review Checks

**Git vs Story Validation:**

- ✅ Files in Dev Agent Record match git changes?
- ✅ Tasks marked `[x]` actually implemented?
- ✅ No undocumented file changes?

**Acceptance Criteria:**

- ✅ Each AC actually implemented?
- ✅ Proof of implementation in code?
- ✅ Performance requirements met (NFRs)?

**Task Completion:**

- ✅ Tasks marked `[x]` really done?
- ✅ Subtasks complete?
- ✅ Evidence in files?

**Code Quality:**

- ✅ Security: No injection risks, validation present?
- ✅ Performance: No N+1 queries, efficient algorithms?
- ✅ Error Handling: Try-catch present, proper logging?
- ✅ Code Quality: Clean functions, no magic numbers?

**Test Quality:**

- ✅ Tests exist for all components?
- ✅ Real assertions (not `expect(true).toBe(true)`)?
- ✅ Performance tests with actual measurements?
- ✅ Appropriate mocking?

**Architecture Compliance:**

- ✅ Follows documented patterns?
- ✅ Naming conventions followed?
- ✅ State management correct (immutable)?
- ✅ Error handling strategy followed?

### Review Outcomes

**Option A: Issues Found (Most Common)**

Code review creates action items in your story file:

```markdown
### Review Follow-ups (Code Review - 2026-01-19)

**🔴 CRITICAL ISSUES**

- [ ] [AI-Review][CRITICAL] Missing tests for LogTailer
- [ ] [AI-Review][HIGH] Performance not validated

**🟡 MEDIUM ISSUES**

- [ ] [AI-Review][MEDIUM] LogTailer instance memory leak

**Review Summary:**

- Total Issues: 8 (3 Critical, 3 Medium, 2 Low)
```

Story status: `in-progress` (you need to fix issues)

**Option B: Clean (Rare on First Try)**

Story status: `done` ✅  
Sprint status: `done` ✅  
You're done! Move to next story.

### Adversarial Review Philosophy

**Code review MUST find 3-10 issues minimum.**

Why? Because:

- First implementations always have room for improvement
- Tests are often placeholders initially
- Performance isn't usually validated
- Architecture compliance needs verification
- Documentation gaps exist

**Don't be discouraged!** This is normal and expected. The review makes your work better.

---

## Handling Review Feedback

### Step 1: Read Review Follow-ups

After code review, your story file will have a new section:

```markdown
### Review Follow-ups (Code Review - 2026-01-19)

**🔴 CRITICAL ISSUES (Must Fix Before Approval)**

- [ ] **[AI-Review][CRITICAL]** Create comprehensive unit tests
  - Create file: src/**tests**/logTailer.test.ts
  - Test JSONL parsing (valid and invalid)
  - Test circular buffer overflow
  - Mock file system with Jest
  - **Location:** src/\_\_tests/logTailer.test.ts (missing)
```

### Step 2: Prioritize Fixes

**Fix in this order:**

1. 🔴 CRITICAL issues (must fix)
2. 🔴 HIGH issues (must fix)
3. 🟡 MEDIUM issues (should fix)
4. 🟢 LOW issues (nice to fix)

**Code review won't approve until CRITICAL and HIGH issues resolved.**

### Step 3: Implement Fixes

For each action item:

1. **Read the issue description**
2. **Note the location** (file:line references)
3. **Implement the fix**
4. **Test your fix**
5. **Check off the item:** `- [x]`

Example:

**Before:**

```markdown
- [ ] **[AI-Review][CRITICAL]** Create logTailer.test.ts
  - Test JSONL parsing
  - Test circular buffer
```

**After:**

```markdown
- [x] **[AI-Review][CRITICAL]** Create logTailer.test.ts
  - ✅ Added comprehensive JSONL parsing tests
  - ✅ Added circular buffer overflow tests
  - ✅ Added performance tests (<500ms file detection)
  - ✅ 90% test coverage achieved
```

### Step 4: Update Completion Notes

Add what you fixed:

```markdown
### Completion Notes List

Initial Implementation:

- Implemented LogTailer with chokidar
- Created circular buffer
- Added basic tests

Code Review Fixes (2026-01-19):

- Added comprehensive unit tests (logTailer.test.ts)
- Fixed LogTailer instance memory leak in App.tsx
- Added performance validation tests
- Improved error logging format
- All CRITICAL and HIGH issues resolved
```

### Step 5: Re-commit and Re-signal

```bash
# Stage fixes
git add .

# Commit
git commit -m "Address code review feedback - Story 1.1

Fixed issues:
- Added comprehensive test suite (logTailer.test.ts)
- Fixed memory leak in App.tsx
- Added performance validation tests
- Improved error logging

All CRITICAL and HIGH issues resolved."

# Update story status
# (Keep as "review" - Erik will re-run code-review)
```

### Step 6: Notify Erik for Re-Review

```
Story 1.1 fixes complete - ready for re-review!

Addressed:
- 3 CRITICAL issues (tests, validation)
- 3 HIGH issues (memory leak, error handling)
- 2 MEDIUM issues (optimization, documentation)

All action items checked off in Review Follow-ups section.
Commit: <commit-hash>

Please re-run code-review workflow.
```

### Iteration Cycle

Expect **1-3 review cycles** per story:

```
Review 1: Find 8-16 issues (typical first review)
    ↓ (you fix)
Review 2: Find 3-8 issues (typical second review)
    ↓ (you fix)
Review 3: Find 0-3 issues (approval likely)
    ↓
Done! ✅
```

**This is normal and healthy!** Each cycle improves quality.

---

## Quality Bar & Best Practices

### Acceptance Criteria Are Sacred

**Rule #1:** If AC says it, code must do it. No exceptions.

Example AC:

```
**Then** the activity is displayed within 100ms of file write
```

You must:

- ✅ Implement the functionality
- ✅ Add performance test that measures actual timing
- ✅ Document measured performance in Completion Notes

### Architecture Patterns Must Be Followed

**Rule #2:** Dev Notes > Architecture Patterns are mandatory.

Example:

```markdown
**Event-Driven File Watcher Pattern:**
chokidar → LogTailer → callback → React setState → ink rendering
```

Don't invent your own pattern! Follow the documented one.

### Tests Must Be Real

**Rule #3:** Placeholder tests will be rejected.

❌ **Bad:**

```typescript
it('should work', () => {
  expect(true).toBe(true);
});
```

✅ **Good:**

```typescript
it('should parse valid JSONL and extract agent name', () => {
  const input = '{"agent":"Router","action":"route"}';
  const result = parseLine(input);
  expect(result.agent).toBe('Router');
});
```

### Performance Must Be Validated

**Rule #4:** NFRs require proof, not assumptions.

If AC says "<100ms", you must:

- ✅ Add performance test with timing measurement
- ✅ Document actual measured time
- ✅ Prove it meets requirement

### TypeScript Strict Mode

**Rule #5:** No `any` type allowed.

❌ **Bad:**

```typescript
function process(data: any) {
  // ❌ Strict mode violation
  return data.something;
}
```

✅ **Good:**

```typescript
interface Data {
  something: string;
}

function process(data: Data): string {
  return data.something;
}
```

### Immutable State Updates

**Rule #6:** Never mutate state directly (React).

❌ **Bad:**

```typescript
const [items, setItems] = useState([]);
items.push(newItem); // ❌ Mutation!
setItems(items); // Won't trigger re-render
```

✅ **Good:**

```typescript
const [items, setItems] = useState([]);
setItems([...items, newItem]); // ✅ New array
```

### Error Handling Must Follow Strategy

**Rule #7:** Use documented error handling pattern.

From Dev Notes:

```
Recoverable: try-catch, log to stderr, continue
Fatal: throw error, let centralized handler catch
```

Follow this! Don't invent your own error handling.

### Naming Conventions

**Rule #8:** Follow project naming conventions.

- `camelCase`: variables, functions, properties
- `PascalCase`: types, interfaces, classes
- `snake_case`: YAML config keys (if applicable)
- `.test.ts`: test file suffix

### Git Commits Must Be Clear

**Rule #9:** Write clear, descriptive commit messages.

❌ **Bad:**

```
git commit -m "fixes"
git commit -m "update"
git commit -m "done"
```

✅ **Good:**

```
git commit -m "Implement LogTailer with chokidar file watching

- Added chokidar watcher for log directory
- Implemented circular buffer (50 items FIFO)
- Added JSONL parsing with error recovery
- Created comprehensive test suite"
```

### Documentation Is Required

**Rule #10:** Dev Agent Record must be complete.

Don't leave placeholders:

- ✅ Agent Model Used: Filled in
- ✅ File List: All files listed
- ✅ Completion Notes: Summary of approach

---

## Common Mistakes to Avoid

### ❌ Mistake #1: Not Reading Dev Notes

**Problem:** Implementing without reading Dev Notes section.

**Impact:** You'll violate architecture patterns, use wrong libraries, ignore performance requirements.

**Solution:** Read ENTIRE story file before starting. Dev Notes section is your implementation guide.

---

### ❌ Mistake #2: Placeholder Tests

**Problem:** Writing tests that don't actually test anything.

```typescript
// ❌ This will be rejected
it('should work', () => {
  expect(true).toBe(true);
});
```

**Solution:** Write real assertions that validate actual behavior.

---

### ❌ Mistake #3: Not Marking Tasks Complete

**Problem:** Implementing everything but leaving tasks as `[ ]`.

**Impact:** Code review thinks nothing is done, creates CRITICAL finding.

**Solution:** Mark `[x]` as you complete each task/subtask.

---

### ❌ Mistake #4: Empty Dev Agent Record

**Problem:** Leaving Dev Agent Record with placeholder text.

**Impact:** Code review has CRITICAL finding - who did this work?

**Solution:** Fill out ALL fields before submitting.

---

### ❌ Mistake #5: No Performance Validation

**Problem:** Implementing functionality but not measuring performance.

**Impact:** Code review rejects - no proof NFRs are met.

**Solution:** Add performance tests with actual measurements.

---

### ❌ Mistake #6: Ignoring "Common Pitfalls" Section

**Problem:** Not reading the "Common Pitfalls to Avoid" in Dev Notes.

**Impact:** You make mistakes that were explicitly warned against.

**Solution:** Read that section! It lists exact mistakes to avoid.

---

### ❌ Mistake #7: Using `any` Type

**Problem:** Using TypeScript `any` type to bypass strict mode.

```typescript
function process(data: any) {  // ❌ Strict mode violation
```

**Impact:** Code review rejects - strict mode violations.

**Solution:** Use proper types. Ask for help if needed.

---

### ❌ Mistake #8: Mutating State

**Problem:** Directly mutating React state instead of creating new objects.

```typescript
items.push(newItem); // ❌ Mutation
setItems(items); // Won't work
```

**Impact:** React won't re-render, tests fail, code review rejects.

**Solution:** Always create new arrays/objects with spread operators.

---

### ❌ Mistake #9: Undocumented File Changes

**Problem:** Modifying files but not listing them in File List.

**Impact:** Code review finds git discrepancy - MEDIUM issue.

**Solution:** List ALL files you create or modify.

---

### ❌ Mistake #10: Wrong Status Update

**Problem:** Leaving status as `in-progress` when ready for review.

**Impact:** Erik doesn't know you're ready for review.

**Solution:** Update status to `review` when complete.

---

## Quick Reference

### Pre-Implementation Checklist

- [ ] Read entire story file
- [ ] Understand all Acceptance Criteria
- [ ] Review Dev Notes > Architecture Patterns
- [ ] Review Dev Notes > Common Pitfalls
- [ ] Check if Review Follow-ups exist (fix those first!)
- [ ] Understand which files to create/modify
- [ ] Know what tests are required

### Implementation Checklist

- [ ] Implement all Acceptance Criteria
- [ ] Complete all tasks and subtasks
- [ ] Follow architecture patterns
- [ ] Use correct technology stack versions
- [ ] Follow naming conventions
- [ ] Implement error handling per strategy
- [ ] Use immutable state updates
- [ ] No `any` types (TypeScript strict mode)

### Testing Checklist

- [ ] Unit tests for all classes/functions
- [ ] Integration tests for components
- [ ] Performance tests for NFRs
- [ ] Real assertions (not placeholders)
- [ ] Tests pass: `npm test`
- [ ] Test coverage ~80%

### Documentation Checklist

- [ ] Mark all tasks `[x]` when complete
- [ ] Fill out Agent Model Used
- [ ] Fill out File List (all files)
- [ ] Fill out Completion Notes
- [ ] Address Review Follow-ups (if present)
- [ ] Update story Status to `review`

### Git Checklist

- [ ] All files staged: `git add .`
- [ ] Clear commit message
- [ ] Commit describes work accurately
- [ ] Verify: `git status` clean

### Pre-Review Checklist

- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] App works: `npm run dev`
- [ ] Story file updated (tasks, Dev Agent Record)
- [ ] Status: `review`
- [ ] Git committed
- [ ] Ready for adversarial review!

---

## Example: Complete Story Submission

### Story File (Excerpt)

```markdown
# Story 1.1: Observe Agent Actions in Real-Time

Status: review ← Changed from "ready-for-dev"

## Tasks / Subtasks

- [x] **Task 1: Implement LogTailer class** ← Marked complete
  - [x] Subtask 1.1: Initialize chokidar watcher
  - [x] Subtask 1.2: Handle file system events
  - [x] Subtask 1.3: Read last 20 lines on startup
  - [x] Subtask 1.4: Read last 5 lines on change
  - [x] Subtask 1.5: Implement circular buffer (50 items)

- [x] **Task 2: Implement JSONL parsing**
      [... all subtasks marked [x] ...]

- [x] **Task 3: Implement React/ink UI**
      [... all subtasks marked [x] ...]

- [x] **Task 4: Implement error handling**
      [... all subtasks marked [x] ...]

## Dev Agent Record

### Agent Model Used

Windsurf Cascade 1.0

### Completion Notes List

Implementation approach:

- Created LogTailer class using chokidar 5.0.0 for file watching
- Implemented circular buffer with FIFO overflow (exactly 50 items)
- Added JSONL parsing with try-catch error recovery
- Built React/ink UI with useState hooks for reactive updates
- Ensured immutable state updates throughout
- Added comprehensive test suite with 87% coverage

Performance validation:

- File detection: Measured 45ms average (< 500ms requirement ✓)
- UI updates: Measured 35ms average (< 100ms requirement ✓)
- Memory usage: Peaked at 42MB (< 50MB requirement ✓)
- Startup time: 2.1 seconds (< 5 seconds requirement ✓)

All acceptance criteria validated and met.

### File List

- src/logTailer.ts (created - 178 lines)
- src/App.tsx (modified - added activity feed, 168 lines)
- src/types.ts (modified - added Activity interface, 54 lines)
- src/**tests**/logTailer.test.ts (created - 145 lines)
- src/**tests**/App.test.tsx (created - 98 lines)
```

### Git Commit

```bash
git commit -m "Implement Story 1.1: Real-time activity monitoring

Features implemented:
- LogTailer class with chokidar file watching
- Circular buffer (50 items) with FIFO overflow
- JSONL parsing with error recovery
- React/ink UI with activity feed (last 15 of 50)
- Error handling with proper logging format

Tests added:
- logTailer.test.ts (145 lines, 90% coverage)
- App.test.tsx (98 lines, 85% coverage)
- Performance tests validating all NFRs

All acceptance criteria met and validated.
Test coverage: 87% overall"
```

### Notification to Erik

```
Story 1.1 ready for review! ✅

Summary:
- All 4 tasks complete (18/18 subtasks)
- Comprehensive test suite (87% coverage)
- All NFRs validated with measurements
- Dev Agent Record complete
- Status: review

File: _bmad-output/implementation-artifacts/stories/1-1-observe-agent-actions-in-real-time.md
Commit: a3f7c9d

Please run: /bmad:bmm:workflows:code-review
```

---

## Questions or Issues?

If you encounter problems:

1. **Check this guide** - Most questions answered here
2. **Review Dev Notes** - Story-specific guidance
3. **Check git history** - See previous story patterns
4. **Ask Erik** - If truly stuck

---

## Workflow Summary

```
┌─────────────────────────────────────────┐
│  1. Read story file completely          │
│  2. Understand ACs and Dev Notes        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  3. Implement requirements              │
│  4. Write comprehensive tests           │
│  5. Validate performance                │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  6. Mark tasks [x]                      │
│  7. Fill Dev Agent Record               │
│  8. Update Status: review               │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  9. Commit with clear message           │
│  10. Notify Erik for review             │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Claude runs adversarial code review    │
└─────────────┬───────────────────────────┘
              │
        ┌─────┴─────┐
        │ Issues?   │
        └─────┬─────┘
              │
      ┌───────┴───────┐
      │ YES           │ NO
      ▼               ▼
┌──────────────┐  ┌────────────┐
│ Fix issues   │  │ Story done!│
│ (Review      │  │ Status:    │
│  Follow-ups) │  │   done ✅  │
│              │  └────────────┘
│ Back to step │
│ 9 (commit)   │
└──────────────┘
```

---

**Good luck! This process makes your work better. Embrace the adversarial review - it catches issues before production!**

---

**End of Delegation Guide**
