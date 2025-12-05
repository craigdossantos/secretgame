# Antigravity-Style Testing Environment

This is the browser testing workspace for The Secret Game. Source code is in `../`

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

### Using Playwright MCP
1. `browser_navigate` to load the page
2. `browser_snapshot` to capture accessibility tree
3. `browser_console` to check for errors

### Interact and Verify
1. `browser_click`, `browser_type`, `browser_select`
2. After EACH action: `browser_console` for new errors
3. `browser_screenshot` to capture visual state

### Using Browser Tools MCP
If connected to browser-tools:
- `mcp__browser-tools__takeScreenshot` - capture state
- `mcp__browser-tools__getConsoleLogs` - all logs
- `mcp__browser-tools__getConsoleErrors` - errors only
- `mcp__browser-tools__runAccessibilityAudit` - a11y check
- `mcp__browser-tools__runPerformanceAudit` - perf check

## Debug Loop

1. Error in console? Document in plans/tasks.md
2. Identify fix in source code
3. Apply fix
4. Re-test until console is clean
5. Update plans/walkthrough.md with resolution

## Running Tests

```bash
# From this directory
npx playwright test

# With UI
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Specific test
npx playwright test tests/seed.spec.ts
```

## Console Log Priority

ALWAYS check browser_console for:
- JavaScript errors (highest priority)
- Network failures (404s, 500s)
- React warnings
- Uncaught exceptions

## Security

Browser is restricted to allowed origins only (localhost).
Do not attempt to navigate to external URLs.

## Secret Game Test Scenarios

- Homepage with question grid
- Card flip animations
- Create room flow
- Room view with secrets
- Spiciness ratings (🌶️ x1-5)
- Secret submission
- Unlock mechanism
