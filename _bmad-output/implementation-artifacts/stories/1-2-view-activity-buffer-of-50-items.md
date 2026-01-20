# Story 1.2: View Activity Buffer of 50 Items

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Team Lead** monitoring system behavior patterns,
I want to view the last 50 agent activities in a circular buffer,
so that I can trace recent workflow sequences and identify recurring patterns.

## Acceptance Criteria

**Given** Agent Monitor is running and monitoring log files
**When** more than 50 activities have been recorded
**Then** the buffer maintains exactly the 50 most recent activities
**And** older activities beyond 50 are automatically removed (FIFO)
**And** the buffer remains consistent even during high-frequency log updates

## Context

This story validates and enhances the circular buffer implementation from Story 1.1. While Story 1.1 established a functional buffer using `Array.push()` + `Array.shift()`, this story ensures the buffer is production-ready for high-frequency log update scenarios and performs consistently under load.

**Business Value:** Enables team leads to analyze workflow patterns over time, identify bottlenecks, and trace agent behavior sequences for system optimization.

**Technical Context:** The current array-based FIFO implementation (logTailer.ts:194-197) is functional but has O(n) complexity due to the `shift()` operation. This story focuses on:

1. Validating buffer behavior under high-frequency scenarios
2. Adding comprehensive tests for concurrent access and rapid insertions
3. Performance benchmarking and optimization if needed
4. Ensuring consistency guarantees during simultaneous file changes

## Tasks / Subtasks

- [ ] **Task 1: Validate existing circular buffer implementation** (AC: Maintains exactly 50 activities)
  - [ ] Subtask 1.1: Review current buffer implementation in LogTailer (logTailer.ts:194-197)
  - [ ] Subtask 1.2: Verify FIFO behavior with existing test (logTailer.test.ts:250-272)
  - [ ] Subtask 1.3: Document buffer operation complexity and performance characteristics

- [ ] **Task 2: Add comprehensive tests for high-frequency scenarios** (AC: Buffer remains consistent during high-frequency updates)
  - [ ] Subtask 2.1: Add test for rapid sequential insertions (100 activities in <1s)
  - [ ] Subtask 2.2: Add test for concurrent file change scenarios (multiple files updating simultaneously)
  - [ ] Subtask 2.3: Add test for buffer consistency under load (verify no duplicate or missing activities)
  - [ ] Subtask 2.4: Add performance benchmark for buffer operations (measure push+shift latency)

- [ ] **Task 3: Performance benchmarking and optimization** (AC: Buffer performs efficiently under load)
  - [ ] Subtask 3.1: Benchmark current array+shift implementation (measure ops/sec)
  - [ ] Subtask 3.2: Compare with theoretical ring buffer performance (O(n) vs O(1))
  - [ ] Subtask 3.3: Optimize implementation if performance tests show bottleneck (consider true ring buffer library)
  - [ ] Subtask 3.4: Document performance improvements and actual measured latency

- [ ] **Task 4: Enhance error handling for buffer edge cases** (AC: Buffer remains consistent)
  - [ ] Subtask 4.1: Add validation for buffer size invariants (check length never exceeds maxActivities)
  - [ ] Subtask 4.2: Add test for buffer corruption scenarios (e.g., force override maxActivities)
  - [ ] Subtask 4.3: Ensure buffer remains in consistent state after errors

## Dev Notes

### Architecture Patterns for This Story

**Current Circular Buffer Implementation (from Story 1.1):**

```typescript
// Current implementation (logTailer.ts:194-197)
this.activities.push(activity);
if (this.activities.length > this.maxActivities) {
  this.activities.shift(); // O(n) operation
}
```

**Performance Characteristics:**

- `push()` operation: O(1) amortized
- `shift()` operation: O(n) - shifts all elements left
- Overall complexity: O(n) on each buffer overflow
- Suitable for low-frequency scenarios, potential bottleneck at high frequency

**True Ring Buffer (for optimization consideration):**

- Fixed-size array with head/tail pointers
- `push()` and `pop()` both O(1)
- No element shifting required
- ~16x faster in benchmarks (5,984 vs 367 ops/sec)

### Previous Story Intelligence

**Story 1.1 Learnings:**

1. **Memory Leak Fixed**: Used useRef hooks for LogTailer singleton in App component (App.tsx:15-16, 22-27)
   - Prevents re-creation of LogTailer on every render
   - Critical for long-running monitoring sessions

2. **File Position Tracking**: Implemented O(1) readNewLines() with file position tracking (logTailer.ts:119-164)
   - Tracks file positions in `filePositions` Map
   - Reads only new data on file changes
   - Prevents re-reading entire files

3. **Test Coverage**: 79.31% overall (logTailer 67.56%, notes 100%, types 100%, App 0%)
   - Buffer overflow test exists (logTailer.test.ts:250-272)
   - Performance tests present but could be enhanced

4. **Code Patterns Established**:
   - Immutable state updates with spread operators
   - Hybrid error handling (local recovery + centralized fatal)
   - camelCase naming for all variables/functions
   - Feature-based directory structure (not yet implemented, still flat)

**Code Review Issues from Story 1.1 (All Resolved):**

All critical and high issues from previous review were addressed:

- ✅ Memory leak fixed (useRef pattern)
- ✅ Inefficient readNewLines() optimized to O(1)
- ✅ Performance test suite added
- ✅ Error logging added to parseLine()
- ✅ TTY warning message expanded

**Key Files Modified (from git log):**

- f55a93e: Complete Story 1.1: Observe Agent Actions in Real-Time
- 96fbeab: Remove 'nul' file and complete BMAD planning workflow
- 1a8c480: Fix runtime issues and add testing verification

### Technology Stack Details

**Current Implementation:**

- **Language**: TypeScript 5.9.3 (strict mode enabled)
- **Runtime**: Node.js ES2020
- **Data Structure**: Array-based FIFO with `push()` + `shift()`

**Potential Optimization Libraries** (if performance tests show need):

- `circular_buffer_js` (StoneCypher) - Extremely well tested, ~16x faster
- `ring-buffer` (toolbuilder) - Fast TS/JS implementation
- `ring-buffer-ts` (domske) - Modern TypeScript implementation

**Benchmarks from Research (jamiebuilds/cirbuf):**

- Array-based implementation: 367.8 ops/sec (±2.5)
- Circular buffer implementation: 5,984.3 ops/sec (±31.6)
- **Speedup: 16.3x faster**

### File Structure Requirements

**Current Structure (Flat - from Story 1.1):**

```
src/
├── index.ts              # CLI entry point
├── types.ts              # Activity, LogEntry, AgentType interfaces
├── logTailer.ts          # LogTailer class (modify here)
│   └── Circular buffer: lines 194-197
└── __tests__/
    └── logTailer.test.ts   # Add tests here
```

**DO NOT reorganize to feature-based structure yet** - flat structure remains until Story 6.x when architecture reorganization is planned.

**Files to Modify:**

- `src/logTailer.ts` - Potentially optimize buffer implementation
- `src/__tests__/logTailer.test.ts` - Add comprehensive tests

### Testing Requirements

**Existing Tests (from Story 1.1):**

```typescript
// logTailer.test.ts:250-272
it('should limit activities to maxActivities (circular buffer)', async () => {
  // Tests that adding 5 activities with maxActivities=3 results in 3 activities
  // Validates FIFO behavior
});
```

**New Tests to Add:**

**High-Frequency Sequential Insertions:**

```typescript
describe('High-Frequency Scenarios', () => {
  it('should handle 100 rapid insertions within 1 second', async () => {
    // Simulate high-frequency log updates
    // Verify buffer maintains 50 items with correct FIFO order
    // Measure operation latency
  });
});
```

**Concurrent File Change Scenarios:**

```typescript
it('should maintain buffer consistency with simultaneous file changes', async () => {
  // Simulate multiple files changing at same time
  // Verify no duplicates or missing activities
  // Verify buffer size invariant (never exceeds 50)
});
```

**Buffer Invariant Validation:**

```typescript
it('should enforce buffer size invariant at all times', async () => {
  // Test under load conditions
  // Assert activities.length <= maxActivities always holds
  // Test edge cases: rapid add, concurrent callbacks, errors
});
```

**Performance Benchmarks:**

```typescript
describe('Performance (Circular Buffer)', () => {
  it('should achieve O(1) buffer operations', async () => {
    // Benchmark 1000 push+shift operations
    // Verify <10ms total time (10 microseconds per operation)
    // Compare against true ring buffer if needed
  });

  it('should maintain <50MB memory usage under load', async () => {
    // Simulate 10,000 activities over time
    // Verify memory never exceeds 50MB (NFR-P3)
  });
});
```

**Test Infrastructure:**

- Use Jest performance timers (`jest.useFakeTimers()`)
- Mock file system for concurrent scenarios
- Measure memory usage if possible (or use process.memoryUsage())
- Benchmark with `performance.now()` for precise timing

### Error Handling Strategy

**Buffer Invariant Protection:**

```typescript
// Defensive programming - add assertion in LogTailer
private addToBuffer(activity: Activity): void {
  this.activities.push(activity);

  // Enforce invariant: never exceed maxActivities
  if (this.activities.length > this.maxActivities) {
    this.activities.shift();  // Remove oldest (FIFO)
  }

  // Development-mode invariant check (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    if (this.activities.length > this.maxActivities) {
      console.error(`[Invariant Violation] Buffer size ${this.activities.length} exceeds ${this.maxActivities}`);
      throw new Error('Circular buffer invariant violation');
    }
  }
}
```

**Graceful Degradation:**

- Continue monitoring if buffer operations slow down (log warning, but don't crash)
- Prioritize most recent activities over perfect ordering in extreme scenarios
- Log performance degradation metrics to stderr

### State Management Patterns

**Buffer Access Patterns:**

```typescript
// Immutable buffer access (existing pattern)
getActivities(): Activity[] {
  return [...this.activities];  // Return copy, prevent external mutation
}

// Direct buffer mutation (internal only)
private addToBuffer(activity: Activity): void {
  this.activities.push(activity);
  if (this.activities.length > this.maxActivities) {
    this.activities.shift();
  }
}
```

**FIFO Ordering Guarantee:**

- `push()` adds to end of array (newest)
- `shift()` removes from front of array (oldest)
- Buffer always contains last N activities in chronological order
- `getActivities()` returns activities[0] (oldest) → activities[N-1] (newest)

### Naming Conventions

**Follow existing patterns:**

- `activities` - array (camelCase, plural)
- `maxActivities` - constant (camelCase, descriptive)
- `addToBuffer()` - method (camelCase, verb + noun)
- `getActivities()` - method (camelCase, verb + noun)

### Project Structure Notes

**Current File Locations:**

- `src/logTailer.ts` - Circular buffer implementation (lines 194-197)
- `src/__tests__/logTailer.test.ts` - Test file (add new tests here)

**Import Patterns:**

```typescript
// Relative imports for co-located files
import { Activity, LogEntry } from './types.js';
```

### References

**Primary Requirements:**

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/planning-artifacts/prd.md#Functional Requirements FR2, FR31, FR32]
- [Source: _bmad-output/planning-artifacts/prd.md#Non-Functional Requirements NFR-P3 (<50MB memory)]

**Previous Story Context:**

- [Source: _bmad-output/implementation-artifacts/stories/1-1-observe-agent-actions-in-real-time.md#Dev Notes]
- [Source: _bmad-output/implementation-artifacts/stories/1-1-observe-agent-actions-in-real-time.md#Review Follow-ups]

**Architecture Patterns:**

- [Source: _bmad-output/planning-artifacts/architecture.md#Circular buffer pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Performance NFRs]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]

**Technology Stack:**

- [Source: _bmad-output/planning-artifacts/project-context.md#Technology Stack & Versions]

**Research:**

- [Source: Web research on circular buffer performance - jamiebuilds/cirbuf benchmark]
- [Source: StoneCypher/circular_buffer_js - well-tested ring buffer library]

### Critical Success Factors

**This story MUST ensure production-ready buffer implementation:**

1. **Consistency Guarantee** - Buffer size never exceeds 50, even under concurrent load
2. **High-Frequency Performance** - Handles rapid insertions without degradation (>100 ops/sec minimum)
3. **Memory Efficiency** - Maintains <50MB memory usage per NFR-P3
4. **FIFO Ordering** - Always maintains chronological order (oldest → newest)
5. **Comprehensive Testing** - Tests cover sequential, concurrent, and edge case scenarios
6. **Performance Benchmarking** - Document actual measured latency and ops/sec

**If buffer fails under high-frequency load, it will impact all 34 remaining stories and degrade real-time monitoring experience!**

### Common Pitfalls to Avoid

**❌ DO NOT:**

- Assume array+shift is sufficient without testing under load
- Ignore concurrent file change scenarios (multiple files updating simultaneously)
- Modify buffer invariants without comprehensive tests
- Optimize prematurely without benchmarking first
- Break FIFO ordering (e.g., using unshift+pop instead of push+shift)
- Allow buffer to temporarily exceed maxActivities (even briefly)

**✅ DO:**

- Benchmark current implementation before optimizing
- Add comprehensive tests for high-frequency and concurrent scenarios
- Measure actual performance with realistic workloads
- Validate buffer invariants in tests (size, ordering, consistency)
- Document performance characteristics and any optimizations
- Consider optimization only if tests show bottleneck
- Use production-like workloads in benchmarks (realistic log entry sizes)

### Performance Benchmarking Strategy

**Benchmark Scenarios:**

1. **Sequential Insertions:**
   - Insert 100 activities back-to-back
   - Measure: Total time, avg time per insertion, maxActivities maintained
   - Target: <1000ms total, <10ms per operation

2. **High-Frequency Burst:**
   - Insert 50 activities in 100ms (simulating burst log writes)
   - Verify: Buffer maintains 50 items, correct FIFO order
   - Measure: Memory usage peak

3. **Concurrent Updates:**
   - Simulate 5 files changing simultaneously
   - Verify: No duplicates, no missing activities, size invariant holds
   - Measure: Consistency recovery time

4. **Memory Usage:**
   - Process 10,000 activities over time (keeps 50 in buffer)
   - Verify: Memory never exceeds 50MB (NFR-P3)
   - Use: `process.memoryUsage().heapUsed` before/after

**Documentation Requirements:**

In Dev Agent Record Completion Notes:

- Actual measured ops/sec for buffer operations
- Memory usage peak during high-frequency load
- Comparison with optimization (if implemented): Before vs After performance
- Conclusion: Whether array+shift is sufficient or ring buffer needed

## Dev Agent Record

### Agent Model Used

_To be filled in by dev agent_

### Debug Log References

_To be filled in by dev agent_

### Completion Notes List

_To be filled in by dev agent_

### File List

_To be filled in by dev agent_
