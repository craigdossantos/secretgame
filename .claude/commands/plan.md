# Planning Mode

Use this for new features or significant changes. Creates full artifact trail.

## Before Starting

1. Read all files in `.claude/rules/` and follow them
2. Read `knowledge/` for relevant context and patterns
3. Check if `plans/` has related previous work

## Step 1: Create Task List

Create `plans/tasks.md`:

```markdown
# Task List: [Feature Name]
Created: [timestamp]
Status: Planning

## Tasks
- [ ] Task 1
  - Verification: How to verify
- [ ] Task 2
  - Verification: How to verify

## Progress Log
- [timestamp] Created task list
```

## Step 2: Create Implementation Plan

Create `plans/implementation.md`:

```markdown
# Implementation Plan: [Feature Name]
Created: [timestamp]

## Overview
Brief description

## Technical Approach
- Architecture decisions
- Key patterns to use (reference knowledge/patterns.md if applicable)

## Files to Modify
- `path/to/file.tsx` - What changes

## Files to Create
- `path/to/new.tsx` - Purpose

## Dependencies
- New packages needed (check rules/tech-stack.md for preferences)

## Risks
- Potential issues

## Testing Strategy
- How to verify this works
```

## Step 3: STOP and Wait

Tell the user:
"I've created the task list and implementation plan. Please review:
- plans/tasks.md
- plans/implementation.md

Edit these files if you want changes. When ready, say 'proceed' and I'll begin implementation."

## Step 4: Check for User Edits

Before implementing, re-read both files. If the user modified them, incorporate their changes.

## Step 5: Implement

- Update plans/tasks.md as you complete each task (change [ ] to [x])
- Add timestamps to Progress Log
- Follow rules in .claude/rules/
- Follow patterns in knowledge/patterns.md
- Maintain Whisk-inspired card design

## Step 6: Create Walkthrough

After completion, create `plans/walkthrough.md`:

```markdown
# Walkthrough: [Feature Name]
Completed: [timestamp]

## Summary
What was built

## Changes Made
- file1.tsx: Description
- file2.ts: Description

## Verification
- [ ] Manual testing completed
- [ ] Build passes: `npm run build`
- [ ] E2E tests passing
- Screenshots: testing/screenshots/feature-name.png

## Deviations from Plan
Any changes from original implementation plan

## Lessons Learned
Anything worth adding to knowledge/
```

## Step 7: Update Knowledge Base

If you discovered useful patterns, decisions, or lessons, update the appropriate file in `knowledge/`.

---

Now ask the user what they want to build.
