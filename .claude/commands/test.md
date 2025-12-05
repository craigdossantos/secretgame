# Browser Testing Mode

Run browser automation and verify UI functionality.

## Prerequisites

1. Dev server running: `npm run dev`
2. Browser tools MCP connected

## Testing Approaches

### Option 1: Use Playwright Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug
```

### Option 2: Screenshot Testing

```bash
# Take full-page screenshot
node screenshot.js
```

### Option 3: Browser MCP Tools

If browser-tools MCP is connected:
1. `mcp__browser-tools__takeScreenshot` - capture current state
2. `mcp__browser-tools__getConsoleLogs` - check for errors
3. `mcp__browser-tools__getConsoleErrors` - get only errors
4. `mcp__browser-tools__runAccessibilityAudit` - check a11y
5. `mcp__browser-tools__runPerformanceAudit` - check performance

## Console Log Monitoring

CRITICAL: After every browser interaction, check console for:
- JavaScript errors
- Network failures (404s, 500s)
- React warnings
- Uncaught exceptions

## On Error Found

1. Document error in plans/tasks.md (create if needed)
2. Note the error message and stack trace
3. Switch to source code, implement fix
4. Re-test until clean
5. Log resolution in plans/walkthrough.md

## Secret Game Test Scenarios

Core flows to verify:
- [ ] Homepage loads with question grid
- [ ] Question cards flip animation works
- [ ] Create room flow completes
- [ ] Room view shows questions
- [ ] Spiciness ratings display correctly
- [ ] Secret submission works
- [ ] Unlock mechanism functions

## Completion

1. Create plans/walkthrough.md with summary
2. Reference screenshots taken
3. List all bugs found and fixed
4. Update knowledge/lessons.md if applicable

---

Ask user what they want to test.
