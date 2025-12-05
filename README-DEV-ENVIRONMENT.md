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

```
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
```

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
```bash
npm run test:e2e          # Run all Playwright tests
npm run test:e2e:ui       # With interactive UI
npm run test:e2e:debug    # Debug mode
node screenshot.js        # Quick screenshot
```

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

```
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
```

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
```markdown
### Pattern: Whisk Card Component
**Context:** When creating card UI
**Solution:** [code example]
**Why it works:** [explanation]
```

### `knowledge/decisions.md`
Architecture decisions and rationale:
```markdown
### Decision: Mock Database
**Status:** Accepted
**Context:** Why this decision was made
**Consequences:** What it means
```

### `knowledge/lessons.md`
What worked and what didn't:
```markdown
### Lesson: ESLint Breaks Vercel
**Category:** Build
**What happened:** [description]
**Action:** Always run npm run build first
```

### `knowledge/snippets/`
Reusable code files you want to reference.

---

## 🧪 Testing

### From Project Root

```bash
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
```

### From `testing/` Directory

```bash
cd testing
npx playwright test           # Run tests
npx playwright test --ui      # With UI
npx playwright test --debug   # Debug mode
```

### Browser MCP Tools

If browser-tools MCP is connected:
- `mcp__browser-tools__takeScreenshot` — Capture current state
- `mcp__browser-tools__getConsoleErrors` — Check for errors
- `mcp__browser-tools__runAccessibilityAudit` — A11y check
- `mcp__browser-tools__runPerformanceAudit` — Performance check

---

## 📁 Directory Structure

```
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
```

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

```markdown
# My Custom Command

Instructions for what Claude should do...
```

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
