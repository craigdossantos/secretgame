# Setup Antigravity-Style Development Environment

Set up a complete Antigravity-style development environment for Claude Code with:
- Planning artifacts (task lists, implementation plans, walkthroughs)
- Fast mode for quick fixes
- Rules system for consistent agent behavior
- Browser automation with Playwright MCP (with URL allowlist)
- Console log monitoring and auto-fix loop
- Knowledge base for cross-session learning
- Recommended MCP servers
- Full auto-permissions

---

## STEP 1: Create Directory Structure

Create all directories and placeholder files:

```
.claude/
  settings.json
  commands/
    plan.md
    fast.md
    build.md
    test.md
    fix-errors.md
    learn.md
  rules/
    coding-style.md
    tech-stack.md

plans/
  .gitkeep

knowledge/
  patterns.md
  decisions.md
  lessons.md
  snippets/
    .gitkeep

testing/
  .mcp.json
  specs/
  tests/
    seed.spec.ts
  plans/
    .gitkeep
  screenshots/
    .gitkeep
  traces/
    .gitkeep
  playwright.config.ts
  CLAUDE.md

CLAUDE.md (root)
```

---

## STEP 2: Configure Auto-Permissions

Create `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "Read(*)",
      "Edit(*)",
      "Write(*)",
      "mcp__playwright__*"
    ]
  }
}
```

This eliminates permission prompts for all common operations.

---

## STEP 3: Create Rules System

Rules are persistent guidelines the agent always follows.

Create `.claude/rules/coding-style.md`:

```markdown
# Coding Style Rules

Always follow these conventions:

## General
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Add comments for complex logic, not obvious code
- Handle errors explicitly, never silently fail

## TypeScript/JavaScript
- Use TypeScript for all new files
- Prefer `const` over `let`, never use `var`
- Use async/await over raw promises
- Use early returns to reduce nesting

## React
- Use functional components with hooks
- Keep components under 200 lines
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props

## Testing
- Write tests for all new features
- Test behavior, not implementation
- Use descriptive test names that explain the scenario
```

Create `.claude/rules/tech-stack.md`:

```markdown
# Tech Stack Rules

## Preferred Technologies
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express or Next.js API routes
- Database: PostgreSQL or SQLite for local dev
- Testing: Playwright for E2E, Vitest for unit tests

## Package Management
- Use npm (not yarn or pnpm) unless project already uses another
- Pin exact versions in package.json for critical dependencies
- Check for security vulnerabilities before adding new packages

## File Organization
- Keep components in src/components/
- Keep pages in src/pages/ or app/
- Keep utilities in src/lib/ or src/utils/
- Keep types in src/types/
```

---

## STEP 4: Create Knowledge Base

The knowledge base persists learnings across sessions.

Create `knowledge/patterns.md`:

```markdown
# Successful Patterns

Document code patterns that worked well in this project.

## Example Entry
### Pattern: [Name]
**Context:** When to use this pattern
**Solution:**
\`\`\`typescript
// Code example
\`\`\`
**Why it works:** Explanation

---

<!-- Add patterns below as you discover them -->
```

Create `knowledge/decisions.md`:

```markdown
# Architecture Decisions

Document significant technical decisions and their rationale.

## Template
### Decision: [Title]
**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded | Deprecated
**Context:** What prompted this decision
**Decision:** What was decided
**Consequences:** What are the implications

---

<!-- Add decisions below -->
```

Create `knowledge/lessons.md`:

```markdown
# Lessons Learned

Document what worked, what didn't, and insights gained.

## Template
### Lesson: [Title]
**Date:** YYYY-MM-DD
**Category:** Bug | Performance | Architecture | Process
**What happened:** Description
**What we learned:** Insight
**Action:** What to do differently

---

<!-- Add lessons below -->
```

---

## STEP 5: Configure Playwright MCP with Security

Create `testing/.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--isolated",
        "--save-trace",
        "--save-video=1280x720",
        "--allowed-origins=http://localhost:3000;http://localhost:5173;http://127.0.0.1:3000"
      ]
    }
  }
}
```

The `--allowed-origins` flag restricts browser automation to only your local dev servers, preventing accidental navigation to external sites.

---

## STEP 6: Create Playwright Config

Create `testing/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './traces',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './reports' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'cd .. && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## STEP 7: Create Seed Test

Create `testing/tests/seed.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('seed', async ({ page }) => {
  // Navigate to local dev server
  await page.goto('/');
  
  // Wait for app to be ready
  await page.waitForLoadState('networkidle');
  
  // Add any auth or setup steps your app needs:
  // await page.fill('[data-testid="email"]', 'test@example.com');
  // await page.fill('[data-testid="password"]', 'password');
  // await page.click('[data-testid="login-button"]');
  
  // Verify app loaded
  await expect(page).toHaveTitle(/.+/);
});
```

---

## STEP 8: Initialize Playwright Test Agents

Run this command from the testing/ directory:

```bash
cd testing && npx playwright init-agents --loop=claude
```

This creates `.github/` with planner.md, generator.md, and healer.md agent definitions.

---

## STEP 9: Create Commands

### `/plan` - Planning Mode (Full Artifacts)

Create `.claude/commands/plan.md`:

```markdown
# Planning Mode

Use this for new features or significant changes. Creates full artifact trail.

## Before Starting

1. Read all files in `.claude/rules/` and follow them
2. Read `knowledge/` for relevant context and patterns
3. Check if `plans/` has related previous work

## Step 1: Create Task List

Create `plans/tasks.md`:

\`\`\`markdown
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
\`\`\`

## Step 2: Create Implementation Plan

Create `plans/implementation.md`:

\`\`\`markdown
# Implementation Plan: [Feature Name]
Created: [timestamp]

## Overview
Brief description

## Technical Approach
- Architecture decisions
- Key patterns to use (reference knowledge/patterns.md if applicable)

## Files to Modify
- \`path/to/file.tsx\` - What changes

## Files to Create
- \`path/to/new.tsx\` - Purpose

## Dependencies
- New packages needed (check rules/tech-stack.md for preferences)

## Risks
- Potential issues

## Testing Strategy
- How to verify this works
\`\`\`

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

## Step 6: Create Walkthrough

After completion, create `plans/walkthrough.md`:

\`\`\`markdown
# Walkthrough: [Feature Name]
Completed: [timestamp]

## Summary
What was built

## Changes Made
- file1.tsx: Description
- file2.ts: Description

## Verification
- [ ] Manual testing completed
- [ ] Automated tests passing
- Screenshots: screenshots/feature-name.png
- Traces: traces/feature-name/

## Deviations from Plan
Any changes from original implementation plan

## Lessons Learned
Anything worth adding to knowledge/
\`\`\`

## Step 7: Update Knowledge Base

If you discovered useful patterns, decisions, or lessons, update the appropriate file in `knowledge/`.

Now ask the user what they want to build.
```

---

### `/fast` - Fast Mode (No Artifacts)

Create `.claude/commands/fast.md`:

```markdown
# Fast Mode

Use this for quick fixes, small changes, or when you know exactly what to do.
Skips artifact creation for speed.

## Rules Still Apply

1. Read `.claude/rules/` and follow them
2. Check `knowledge/` for relevant patterns

## Process

1. Understand the request
2. Make the change directly
3. Verify it works (run tests, check browser if UI)
4. Provide brief summary of what changed

## When to Suggest Planning Mode Instead

If the request involves:
- Multiple files
- New architecture
- Uncertainty about approach
- Significant refactoring

Say: "This seems complex enough to benefit from planning. Want me to switch to /plan mode?"

Now ask the user what quick fix they need.
```

---

### `/build` - Build Mode (Light Artifacts)

Create `.claude/commands/build.md`:

```markdown
# Build Mode

Balanced mode - creates minimal artifacts, good for medium-sized tasks.

## Process

1. Read `.claude/rules/` 
2. Check `knowledge/` for relevant patterns
3. If task is straightforward, implement directly
4. If browser testing needed:
   - Navigate to page
   - Check console for errors
   - Fix any errors found
   - Screenshot as verification
5. Update plans/tasks.md if it exists
6. Provide summary

## Artifacts Created

Only create artifacts if:
- Task involves 3+ files
- You encounter unexpected issues
- User asks for documentation

Now ask the user what they want to build.
```

---

### `/test` - Browser Testing Mode

Create `.claude/commands/test.md`:

```markdown
# Browser Testing Mode

Run from the testing/ directory for full browser automation.

## Prerequisites

1. Dev server running: `cd .. && npm run dev`
2. In testing directory: `cd testing`

## Testing Approaches

### Option 1: Use Test Agents

For exploratory testing:
\`\`\`
@planner explore [feature description]
\`\`\`

For generating tests from spec:
\`\`\`
@generator create tests from specs/[name].md
\`\`\`

For fixing failing tests:
\`\`\`
@healer fix the failing tests
\`\`\`

### Option 2: Manual Browser Loop

1. **Navigate**: `browser_navigate` to target page
2. **Snapshot**: `browser_snapshot` to see current state  
3. **Console**: `browser_console` to check for errors
4. **Interact**: `browser_click`, `browser_type` as needed
5. **Verify**: Check console again, take screenshot
6. **Document**: Update plans/tasks.md with findings

## On Error Found

1. Document error in plans/tasks.md
2. Note the error message and stack trace
3. Switch to source code, implement fix
4. Return to browser, re-test
5. Repeat until clean
6. Log resolution in plans/walkthrough.md

## Console Log Monitoring

CRITICAL: After every browser action, check `browser_console` for:
- JavaScript errors
- Network failures
- React/Vue/Framework warnings
- Uncaught exceptions

## Completion

1. Create plans/walkthrough.md with summary
2. Reference traces and screenshots
3. List all bugs found and fixed
4. Update knowledge/lessons.md if applicable

Ask user what they want to test.
```

---

### `/fix-errors` - Auto-Fix Errors

Create `.claude/commands/fix-errors.md`:

```markdown
# Fix Errors Mode

Automatically diagnose and fix errors from terminal or browser console.

## Process

### Step 1: Gather Error Information

Ask the user to provide one of:
- Terminal output with error
- Browser console errors
- Error message they encountered

Or if in testing/ with browser active, run `browser_console` to get current errors.

### Step 2: Document the Error

Add to plans/tasks.md (create if doesn't exist):

\`\`\`markdown
## Error Fix: [timestamp]
- [ ] Fix: [brief description]
  - Error: [error message]
  - Location: [file/line if known]
  - Cause: [your analysis]
\`\`\`

### Step 3: Analyze

1. Identify the root cause
2. Check knowledge/lessons.md for similar past issues
3. Determine the fix

### Step 4: Fix

1. Make the code change
2. Mark task complete in plans/tasks.md

### Step 5: Verify

1. Re-run the command or refresh browser
2. Check that error is gone
3. Check for new errors introduced

### Step 6: Loop if Needed

If new errors appear, repeat from Step 2.

### Step 7: Document Resolution

Add to plans/tasks.md:
\`\`\`
  - Resolution: [what fixed it]
  - Verified: [timestamp]
\`\`\`

If this was a tricky bug, add to knowledge/lessons.md.

Ask user to share the error, or say "check browser" to read console.
```

---

### `/learn` - Update Knowledge Base

Create `.claude/commands/learn.md`:

```markdown
# Learn Mode

Extract and save learnings from the current session to the knowledge base.

## Process

### Step 1: Review Recent Work

Look at:
- plans/tasks.md - What was accomplished
- plans/implementation.md - Technical decisions made
- plans/walkthrough.md - Outcomes and deviations
- Recent code changes

### Step 2: Identify Learnings

Ask yourself:
1. **Patterns**: Did we create any reusable code patterns?
2. **Decisions**: Did we make significant architecture choices?
3. **Lessons**: Did anything unexpected happen? What worked/didn't?

### Step 3: Update Knowledge Base

For patterns, add to `knowledge/patterns.md`:
\`\`\`markdown
### Pattern: [Name]
**Date:** [today]
**Context:** When to use this
**Solution:**
\\\`\\\`\\\`typescript
// Code
\\\`\\\`\\\`
**Why it works:** Explanation
\`\`\`

For decisions, add to `knowledge/decisions.md`:
\`\`\`markdown
### Decision: [Title]
**Date:** [today]
**Status:** Accepted
**Context:** What prompted this
**Decision:** What was decided
**Consequences:** Implications
\`\`\`

For lessons, add to `knowledge/lessons.md`:
\`\`\`markdown
### Lesson: [Title]
**Date:** [today]  
**Category:** Bug | Performance | Architecture | Process
**What happened:** Description
**What we learned:** Insight
**Action:** What to do differently
\`\`\`

For reusable code, save to `knowledge/snippets/[name].ts`

### Step 4: Confirm

Tell user what was added to the knowledge base.

Ask user what they'd like to document, or say "auto" to analyze recent work automatically.
```

---

## STEP 10: Create Testing CLAUDE.md

Create `testing/CLAUDE.md`:

```markdown
# Antigravity-Style Testing Environment

This is the browser testing workspace. Source code is in `../`

## Before Starting

1. Read `../.claude/rules/` for coding standards
2. Read `../knowledge/` for relevant patterns
3. Check if dev server is running at http://localhost:3000

## Dev Server
```bash
cd .. && npm run dev
```

## Artifact Generation

ALWAYS create artifacts:

### Before Starting
- `plans/tasks.md` - Checklist with [ ] pending, [x] complete
- `plans/implementation.md` - Approach before starting

### After Completion  
- `plans/walkthrough.md` - Summary with screenshot/trace references

## Browser Automation Workflow

### Navigate and Observe
1. `browser_navigate` to load the page
2. `browser_snapshot` to capture accessibility tree
3. `browser_console` to check for errors

### Interact and Verify
1. `browser_click`, `browser_type`, `browser_select`
2. After EACH action: `browser_console` for new errors
3. `browser_screenshot` to capture visual state

### Debug Loop
1. Error in console? Document in plans/tasks.md
2. Identify fix in source code
3. Apply fix
4. Re-test until console is clean
5. Update plans/walkthrough.md with resolution

## Agents

- `@planner` - Explore app, create specs and tasks
- `@generator` - Create Playwright tests from specs
- `@healer` - Run tests, auto-fix failures, read console

## Console Log Priority

ALWAYS check browser_console for:
- JavaScript errors (highest priority)
- Network failures (404s, 500s)
- Framework warnings (React, Vue, etc.)
- Uncaught exceptions

## Security

Browser is restricted to allowed origins only (localhost).
Do not attempt to navigate to external URLs.
```

---

## STEP 11: Create Root CLAUDE.md

Create or update `CLAUDE.md` in project root:

```markdown
# Project Development Guidelines

## Modes

| Command | Use For | Artifacts |
|---------|---------|-----------|
| `/plan` | New features, significant changes | Full (tasks, implementation, walkthrough) |
| `/build` | Medium tasks | Light (only if needed) |
| `/fast` | Quick fixes, small changes | None |
| `/test` | Browser testing | Test specs and results |
| `/fix-errors` | Debugging | Error documentation |
| `/learn` | End of session | Knowledge base updates |

## Always Do

1. **Read Rules**: Check `.claude/rules/` before starting any work
2. **Check Knowledge**: Look in `knowledge/` for relevant patterns and past decisions
3. **Follow Tech Stack**: Use preferred technologies from rules/tech-stack.md

## Artifact Locations

- `plans/` - Planning documents (tasks, implementation, walkthrough)
- `knowledge/` - Persistent learnings (patterns, decisions, lessons, snippets)
- `testing/specs/` - Test specifications
- `testing/tests/` - Generated Playwright tests
- `testing/screenshots/` - Visual captures
- `testing/traces/` - Playwright traces and videos

## Feedback Loop

After creating artifacts, I will pause for your review. You can:
- Edit `plans/implementation.md` to change the approach
- Edit `plans/tasks.md` to add/remove/reorder tasks
- Say "proceed" when ready

I will re-read these files before implementing to catch your changes.

## Browser Testing

When testing UI:
1. Check console logs after EVERY browser action
2. Document errors in plans/tasks.md
3. Fix and re-test until clean
4. Save evidence (screenshots, traces)

## End of Session

Run `/learn` to extract valuable patterns, decisions, and lessons to the knowledge base for future sessions.
```

---

## STEP 12: Optional - Add Recommended MCPs

For enhanced functionality, you can add these MCP servers to `testing/.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--isolated",
        "--save-trace",
        "--save-video=1280x720",
        "--allowed-origins=http://localhost:3000;http://localhost:5173;http://127.0.0.1:3000"
      ]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "context7": {
      "command": "npx", 
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

**Sequential Thinking**: Helps with complex multi-step reasoning
**Context7**: Provides up-to-date documentation for frameworks (React, Next.js, etc.)

Note: Context7 may require an API key. Check their documentation.

---

## STEP 13: Run Setup Commands

Execute these commands to complete setup:

```bash
# Create all directories
mkdir -p .claude/commands .claude/rules plans knowledge/snippets testing/plans testing/specs testing/tests testing/screenshots testing/traces

# Initialize Playwright (if not already installed)
cd testing
npm init -y
npm install -D @playwright/test
npx playwright install chromium

# Initialize test agents
npx playwright init-agents --loop=claude

# Return to root
cd ..

echo "Setup complete!"
```

---

## Usage Summary

After setup, use these workflows:

### Daily Development

| What you want | Command |
|--------------|---------|
| New feature (needs planning) | `/plan` |
| Medium task | `/build` |
| Quick fix | `/fast` |
| Fix an error | `/fix-errors` |
| End of day/session | `/learn` |

### Browser Testing

```bash
cd testing
claude
```

Then:
| What you want | Command |
|--------------|---------|
| Explore a feature | `@planner explore the checkout flow` |
| Generate tests | `@generator create tests from specs/checkout.md` |
| Fix failing tests | `@healer fix the failing tests` |
| Manual testing | `/test` |

---

## What You Now Have

- ✅ Auto-permissions (no more prompts)
- ✅ Planning artifacts like Antigravity (tasks, implementation, walkthrough)
- ✅ Fast mode for quick changes
- ✅ Rules system for consistent behavior
- ✅ Knowledge base for cross-session learning  
- ✅ Browser automation with console monitoring
- ✅ URL allowlist for security
- ✅ Screenshot and trace capture
- ✅ Test agents (planner, generator, healer)
- ✅ Error auto-fix workflow
- ✅ Feedback loop (edit artifacts before implementation)
- ✅ Learn command for extracting insights

---

## Differences from Antigravity

| Antigravity | Claude Code Setup |
|-------------|-------------------|
| Google Docs-style inline comments | Edit markdown files directly |
| Automatic knowledge base | Manual with `/learn` command |
| Manager view dashboard | Multiple terminal windows |
| Built-in MCP store | Manual MCP configuration |
| Video playback in IDE | View traces in Playwright viewer |

The core workflow and artifact system are equivalent. The main difference is Antigravity has tighter UI integration, while this setup uses files and commands.

---

## STEP 14: Create README Documentation

Create `README-DEV-ENVIRONMENT.md` in the project root with comprehensive documentation:

```markdown
# 🚀 Antigravity-Style Development Environment

> A structured workflow for AI-assisted development with planning artifacts, persistent knowledge, and mode-based task handling.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Development Modes](#-development-modes)
- [The Planning Workflow](#-the-planning-workflow)
- [Knowledge Base](#-knowledge-base)
- [Testing](#-testing)
- [Directory Structure](#-directory-structure)
- [Best Practices](#-best-practices)

---

## ⚡ Quick Start

### Choose Your Mode

| What you're doing | Command to use |
|-------------------|----------------|
| Building a new feature | `/plan` |
| Medium-sized task | `/build` |
| Quick bug fix | `/fast` |
| Testing the UI | `/test` |
| Fixing an error | `/fix-errors` |
| End of session | `/learn` |

### Example Session

\`\`\`
You: /plan
Claude: What would you like to build?

You: Add a dark mode toggle to the settings

Claude: [Creates plans/tasks.md and plans/implementation.md]
        Please review the plans. Say "proceed" when ready.

You: [Reviews and optionally edits the plan files]
You: proceed

Claude: [Implements the feature, updating tasks as completed]
        [Creates plans/walkthrough.md with summary]

You: /learn
Claude: [Extracts patterns and lessons to knowledge/]
\`\`\`

---

## 🎮 Development Modes

### `/plan` — Full Planning Mode

**Best for:** New features, architectural changes, multi-file modifications

**What happens:**
1. Claude reads rules and knowledge base
2. Creates `plans/tasks.md` with checklist
3. Creates `plans/implementation.md` with approach
4. **Pauses for your review** ← You can edit these files!
5. Implements after you say "proceed"
6. Creates `plans/walkthrough.md` summary

**Artifacts created:**
- ✅ `plans/tasks.md`
- ✅ `plans/implementation.md`
- ✅ `plans/walkthrough.md`

---

### `/build` — Balanced Mode

**Best for:** Medium tasks, straightforward implementations

**What happens:**
1. Claude reads rules and knowledge
2. Implements directly (no planning pause)
3. Creates artifacts only if needed
4. Verifies with build/tests

**Artifacts created:**
- ⚡ Only if task is complex or issues arise

---

### `/fast` — Quick Mode

**Best for:** Bug fixes, small changes, typos, one-file edits

**What happens:**
1. Claude makes the change directly
2. Verifies it works
3. Provides brief summary

**Artifacts created:**
- ❌ None (speed is the priority)

---

### `/test` — Testing Mode

**Best for:** Browser testing, UI verification, console monitoring

**What happens:**
1. Uses Playwright or browser-tools MCP
2. Monitors console for errors
3. Takes screenshots for verification
4. Documents any bugs found

**Key commands available:**
\`\`\`bash
npm run test:e2e          # Run all Playwright tests
npm run test:e2e:ui       # With interactive UI
npm run test:e2e:debug    # Debug mode
node screenshot.js        # Quick screenshot
\`\`\`

---

### `/fix-errors` — Debug Mode

**Best for:** When you have an error message to fix

**What happens:**
1. You share the error (or say "check browser")
2. Claude documents the error in `plans/tasks.md`
3. Analyzes root cause
4. Implements fix
5. Verifies error is gone
6. Documents resolution

---

### `/learn` — Knowledge Extraction

**Best for:** End of session, after completing significant work

**What happens:**
1. Reviews recent work and changes
2. Identifies patterns, decisions, lessons
3. Updates knowledge base files
4. Optionally cleans up plans

**Run this regularly!** It makes future sessions smarter.

---

## 📝 The Planning Workflow

### The Feedback Loop

\`\`\`
┌─────────────────────────────────────────────────────────┐
│  1. You request a feature                               │
│  2. Claude creates plans/tasks.md + implementation.md   │
│  3. Claude PAUSES                                       │
│  4. You review and optionally EDIT the plan files       │
│  5. You say "proceed"                                   │
│  6. Claude RE-READS the files (catches your edits!)     │
│  7. Claude implements                                   │
│  8. Claude creates walkthrough.md                       │
└─────────────────────────────────────────────────────────┘
\`\`\`

### Editing Plans

When Claude pauses, you can edit:

**`plans/tasks.md`**
- Reorder tasks
- Add new tasks
- Remove unnecessary tasks
- Change verification criteria

**`plans/implementation.md`**
- Change the technical approach
- Specify different patterns
- Add constraints
- Note preferences

Claude will incorporate your changes when you say "proceed".

---

## 🧠 Knowledge Base

The `knowledge/` directory persists learnings across sessions.

### `knowledge/patterns.md`
Successful code patterns with examples:
\`\`\`markdown
### Pattern: Whisk Card Component
**Context:** When creating card UI
**Solution:** [code example]
**Why it works:** [explanation]
\`\`\`

### `knowledge/decisions.md`
Architecture decisions and rationale:
\`\`\`markdown
### Decision: Mock Database
**Status:** Accepted
**Context:** Why this decision was made
**Consequences:** What it means
\`\`\`

### `knowledge/lessons.md`
What worked and what didn't:
\`\`\`markdown
### Lesson: ESLint Breaks Vercel
**Category:** Build
**What happened:** [description]
**Action:** Always run npm run build first
\`\`\`

### `knowledge/snippets/`
Reusable code files you want to reference.

---

## 🧪 Testing

### From Project Root

\`\`\`bash
# Development
npm run dev                    # Start dev server

# Testing
npm run test:e2e              # Run Playwright tests
npm run test:e2e:ui           # Interactive test UI
npm run test:e2e:debug        # Debug mode
node screenshot.js            # Quick screenshot

# Quality
npm run build                 # TypeScript + production build
npm run lint                  # ESLint check
\`\`\`

### From `testing/` Directory

\`\`\`bash
cd testing
npx playwright test           # Run tests
npx playwright test --ui      # With UI
npx playwright test --debug   # Debug mode
\`\`\`

### Browser MCP Tools

If browser-tools MCP is connected:
- `mcp__browser-tools__takeScreenshot` — Capture current state
- `mcp__browser-tools__getConsoleErrors` — Check for errors
- `mcp__browser-tools__runAccessibilityAudit` — A11y check
- `mcp__browser-tools__runPerformanceAudit` — Performance check

---

## 📁 Directory Structure

\`\`\`
.claude/
├── settings.json              # Auto-permissions config
├── commands/                  # Slash command definitions
│   ├── plan.md               # /plan command
│   ├── build.md              # /build command
│   ├── fast.md               # /fast command
│   ├── test.md               # /test command
│   ├── fix-errors.md         # /fix-errors command
│   └── learn.md              # /learn command
├── rules/                     # Persistent guidelines
│   ├── coding-style.md       # Code conventions
│   └── tech-stack.md         # Technology rules
└── agents/                    # Specialized AI agents

plans/                         # Planning artifacts (ephemeral)
├── tasks.md                  # Current task checklist
├── implementation.md         # Implementation plan
└── walkthrough.md            # Post-implementation summary

knowledge/                     # Persistent learnings
├── patterns.md               # Successful code patterns
├── decisions.md              # Architecture decisions
├── lessons.md                # What worked/didn't
└── snippets/                 # Reusable code

testing/                       # Browser testing workspace
├── .mcp.json                 # Playwright MCP config
├── playwright.config.ts      # Test configuration
├── CLAUDE.md                 # Testing guide
├── tests/                    # Test files
├── specs/                    # Test specifications
├── screenshots/              # Visual captures
└── traces/                   # Playwright traces
\`\`\`

---

## ✨ Best Practices

### 1. Choose the Right Mode

| Situation | Mode |
|-----------|------|
| "Add user authentication" | `/plan` |
| "Fix the button color" | `/fast` |
| "Add a new API endpoint" | `/build` |
| "Why isn't this working?" | `/fix-errors` |
| "Check if the UI looks right" | `/test` |
| "Done for today" | `/learn` |

### 2. Review Plans Before Proceeding

When Claude pauses with plans, take a moment to:
- Read through the task list
- Check the implementation approach
- Edit if something seems off
- Only then say "proceed"

### 3. Run `/learn` Regularly

After completing features or fixing tricky bugs:
- Patterns get saved for reuse
- Decisions get documented
- Lessons prevent repeat mistakes

### 4. Keep the Knowledge Base Current

When you notice:
- A pattern that keeps working → Add to `patterns.md`
- A decision that should stick → Add to `decisions.md`
- Something that bit you → Add to `lessons.md`

### 5. Use the Rules System

If you want Claude to always:
- Follow a coding convention → Add to `rules/coding-style.md`
- Use specific tech → Add to `rules/tech-stack.md`

Claude reads these before every task.

---

## 🔧 Customization

### Adding New Slash Commands

Create a new `.md` file in `.claude/commands/`:

\`\`\`markdown
# My Custom Command

Instructions for what Claude should do...
\`\`\`

Then use it with `/my-custom-command`.

### Modifying Rules

Edit files in `.claude/rules/` to change:
- Coding conventions
- Technology preferences
- Project-specific guidelines

### Extending the Knowledge Base

Add new files to `knowledge/`:
- `api-patterns.md` — API-specific patterns
- `testing-strategies.md` — Testing approaches
- `performance-tips.md` — Optimization tricks

---

## 🆘 Troubleshooting

### Claude isn't following the rules

1. Check that `.claude/rules/` files exist
2. Start a new conversation (rules are read at command start)

### Plans aren't being created

1. Make sure you're using `/plan` not just asking
2. Check that `plans/` directory exists

### Knowledge isn't persisting

1. Run `/learn` before ending sessions
2. Verify `knowledge/` files are being updated

### Tests aren't running

1. Ensure dev server is running: `npm run dev`
2. Check Playwright is installed: `npx playwright install`

---

## 📚 Related Files

- [CLAUDE.md](./CLAUDE.md) — Main project guidelines
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) — Feature roadmap
- [testing/CLAUDE.md](./testing/CLAUDE.md) — Testing workspace guide

---

*Built with the Antigravity-style development pattern for structured AI-assisted coding.*
\`\`\`

---

## Setup Complete! 🎉

After running this command, you will have:

- ✅ Auto-permissions (no more prompts)
- ✅ Planning artifacts (tasks, implementation, walkthrough)
- ✅ Fast mode for quick changes
- ✅ Rules system for consistent behavior
- ✅ Knowledge base for cross-session learning
- ✅ Browser automation with console monitoring
- ✅ URL allowlist for security
- ✅ Screenshot and trace capture
- ✅ Error auto-fix workflow
- ✅ Feedback loop (edit artifacts before implementation)
- ✅ Learn command for extracting insights
- ✅ Comprehensive README documentation

Tell the user: "Setup complete! Check out README-DEV-ENVIRONMENT.md for a complete guide on using your new development environment."
