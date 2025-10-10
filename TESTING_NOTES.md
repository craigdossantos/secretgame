# Testing Notes

## Playwright MCP Browser Issue

**Problem:**
```
Error: Browser is already in use for /Users/craigdossantos/Library/Caches/ms-playwright/mcp-chrome-be4b021,
use --isolated to run multiple instances of the same browser
```

**Root Cause:**
- The MCP Playwright server maintains a persistent browser instance
- When a browser session isn't properly closed, it remains locked
- Subsequent attempts to navigate fail with "already in use" error

**Symptoms:**
- `browser_navigate` fails after previous sessions
- `browser_close` doesn't always release the browser lock
- Requires manual process killing: `pkill -f "mcp.*playwright"`

**Workaround:**
1. Kill all playwright processes: `pkill -f "mcp.*playwright"`
2. Wait 2-3 seconds for cleanup
3. Retry navigation

**Proper Fix Needed:**
- Investigate MCP Playwright server browser lifecycle
- Ensure proper cleanup after `browser_close()`
- Consider adding `--isolated` flag for concurrent testing
- May need to configure MCP server settings

**Impact:**
- Manual browser testing is more reliable for now
- E2E tests via `npm run test:e2e` still work (different Playwright instance)
- Only affects MCP browser automation tools

---

## Manual Testing Preferred For:
- Interactive features (modals, forms, animations)
- Visual regression checking
- User flow validation
- Quick iteration during development

## Playwright E2E Tests Preferred For:
- Automated regression testing
- CI/CD pipeline
- Critical user path validation
- Cross-browser testing
