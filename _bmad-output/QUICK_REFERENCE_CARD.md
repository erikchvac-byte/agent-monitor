# Local Agent Quick Reference Card

**Project:** Lincoln (Agent Monitor)  
**Use:** Print or keep open while working on stories

---

## 📥 Story Assignment

**You receive:**

```
_bmad-output/implementation-artifacts/stories/[story-key].md
```

**Read these sections first:**

1. ✅ Acceptance Criteria (your success criteria)
2. ✅ Tasks / Subtasks (what to implement)
3. ✅ Dev Notes > Architecture Patterns (how to implement)
4. ✅ Dev Notes > Common Pitfalls (what to avoid)
5. ✅ Review Follow-ups (if present - fix these first!)

---

## ✅ Implementation Checklist

### Before Starting

- [ ] Read entire story file
- [ ] Understand all Acceptance Criteria
- [ ] Review architecture patterns
- [ ] Note common pitfalls to avoid
- [ ] Check for Review Follow-ups section

### During Implementation

- [ ] Implement all Acceptance Criteria
- [ ] Complete all tasks and subtasks
- [ ] Follow architecture patterns exactly
- [ ] Use correct library versions
- [ ] Follow naming conventions (camelCase, PascalCase)
- [ ] Implement error handling per strategy
- [ ] Use immutable state updates (React)
- [ ] No `any` types (TypeScript strict mode)

### Testing

- [ ] Write unit tests (all functions/classes)
- [ ] Write integration tests (components)
- [ ] Write performance tests (NFR validation)
- [ ] Real assertions (not placeholders!)
- [ ] Tests pass: `npm test`
- [ ] Coverage ~80%

### Documentation

- [ ] Mark all tasks `[x]` when complete
- [ ] Fill "Agent Model Used" field
- [ ] Fill "File List" (all files created/modified)
- [ ] Fill "Completion Notes" (summary + performance)
- [ ] Check off Review Follow-ups (if present)

### Before Submitting

- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] App works: `npm run dev`
- [ ] All tasks marked `[x]`
- [ ] Dev Agent Record complete
- [ ] Update Status: `review`
- [ ] Git commit with clear message
- [ ] Notify Erik

---

## 🚫 Common Mistakes (DON'T DO THESE!)

| ❌ Mistake                                   | ✅ Solution                          |
| -------------------------------------------- | ------------------------------------ |
| Placeholder tests: `expect(true).toBe(true)` | Real assertions with actual behavior |
| Leaving tasks `[ ]` when done                | Mark `[x]` as you complete           |
| Empty Dev Agent Record                       | Fill all fields completely           |
| Using `any` type                             | Use proper TypeScript types          |
| Mutating state: `array.push()`               | Immutable: `[...array, item]`        |
| No performance tests                         | Add tests with measurements          |
| Skipping Dev Notes                           | Read before implementing!            |
| Wrong status                                 | Update to `review` when ready        |

---

## 📝 Dev Agent Record Template

```markdown
## Dev Agent Record

### Agent Model Used

<Your-Agent-Name> <Version>

### Completion Notes List

Implementation approach:

- <Key implementation decisions>
- <Architecture patterns used>
- <Test coverage achieved>

Performance validation:

- <NFR requirement>: Measured <value> (<requirement> ✓)
- <NFR requirement>: Measured <value> (<requirement> ✓)

All acceptance criteria validated and met.

### File List

- src/file1.ts (created/modified - X lines)
- src/file2.tsx (created/modified - X lines)
- src/**tests**/file1.test.ts (created - X lines)
```

---

## 🎯 Status Updates

| Status          | Meaning                     | When to Use                          |
| --------------- | --------------------------- | ------------------------------------ |
| `ready-for-dev` | Story assigned, not started | Initial state (don't change)         |
| `in-progress`   | Actively working            | During implementation                |
| `review`        | Ready for code review       | When complete, before notifying Erik |
| `done`          | Approved by code review     | Code review will set this            |

**Your job:** Change from `ready-for-dev` → `review` when done.

---

## 🔄 Review Cycle

```
1. Implement → 2. Test → 3. Document → 4. Commit → 5. Status: review
                                                               ↓
                                                    6. Notify Erik
                                                               ↓
                                                    7. Code review runs
                                                               ↓
                                    ┌──────────────────────────┴──────────┐
                                    │                                     │
                              Issues found?                         No issues?
                                    │                                     │
                                    ↓                                     ↓
                    8. Review Follow-ups added                    Story: done ✅
                       Status: in-progress
                                    │
                                    ↓
                        9. Fix issues, mark [x]
                                    │
                                    ↓
                        Back to step 4 (commit)
```

**Typical cycles:** 1-3 reviews per story (normal and expected!)

---

## 📞 Notification Template

```
Story <X.X> ready for review! ✅

Summary:
- All <N> tasks complete (<X>/<X> subtasks)
- Comprehensive test suite (<X>% coverage)
- All NFRs validated with measurements
- Dev Agent Record complete
- Status: review

File: _bmad-output/implementation-artifacts/stories/<story-key>.md
Commit: <hash>

Please run: /bmad:bmm:workflows:code-review
```

---

## 🧪 Test Template

```typescript
// src/__tests__/className.test.ts
import { ClassName } from '../fileName.js';

describe('ClassName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = setupTestData();

      // Act
      const result = className.method(input);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe('Performance', () => {
    it('should meet NFR requirement', async () => {
      const start = Date.now();
      // ... perform operation ...
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(threshold);
    });
  });
});
```

---

## 🎨 Naming Conventions

| Type       | Convention | Example                          |
| ---------- | ---------- | -------------------------------- |
| Variables  | camelCase  | `logDirectory`, `activityBuffer` |
| Functions  | camelCase  | `parseLogEntry`, `addActivity`   |
| Classes    | PascalCase | `LogTailer`, `NoteWriter`        |
| Interfaces | PascalCase | `Activity`, `LogEntry`           |
| Types      | PascalCase | `AgentType`, `StatusType`        |
| Test files | `.test.ts` | `logTailer.test.ts`              |

---

## 💾 Git Commit Template

```bash
git commit -m "Implement Story X.X: <Story title>

Features implemented:
- <Feature 1>
- <Feature 2>
- <Feature 3>

Tests added:
- <test file 1> (<X> lines, <Y>% coverage)
- <test file 2> (<X> lines, <Y>% coverage)

All acceptance criteria met and validated.
Test coverage: <X>% overall"
```

---

## 🔍 Code Review Checks For

1. **Git vs Story:** Files listed match git changes?
2. **Tasks:** Marked `[x]` actually implemented?
3. **ACs:** Each AC really met?
4. **Tests:** Real assertions vs placeholders?
5. **Performance:** NFRs validated with measurements?
6. **Architecture:** Follows documented patterns?
7. **Security:** No injection risks, validation present?
8. **Error Handling:** Try-catch present, proper logging?
9. **Code Quality:** Clean code, no magic numbers?
10. **Documentation:** Dev Agent Record complete?

**Expect:** 3-10 issues found (first review)  
**This is normal!** Fix and resubmit.

---

## 🆘 When to Ask for Help

- ✅ Stuck on architecture pattern interpretation
- ✅ Don't understand an Acceptance Criterion
- ✅ Technology choice unclear
- ✅ Multiple review cycles not converging
- ❌ Trying to skip tests (don't ask, write them!)
- ❌ Trying to use `any` type (find proper type)
- ❌ Trying to shortcut process (follow it!)

---

## 📚 Full Details

See complete guide: `_bmad-output/DELEGATION_GUIDE.md`

---

**Remember:** Adversarial review makes your work better. Embrace the feedback!
