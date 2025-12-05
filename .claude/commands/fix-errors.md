# Fix Errors Mode

Automatically diagnose and fix errors from terminal or browser console.

## Process

### Step 1: Gather Error Information

Ask the user to provide one of:
- Terminal output with error
- Browser console errors
- Error message they encountered

Or check browser console directly with `mcp__browser-tools__getConsoleErrors`.

### Step 2: Document the Error

Add to plans/tasks.md (create if doesn't exist):

```markdown
## Error Fix: [timestamp]
- [ ] Fix: [brief description]
  - Error: [error message]
  - Location: [file/line if known]
  - Cause: [your analysis]
```

### Step 3: Analyze

1. Identify the root cause
2. Check knowledge/lessons.md for similar past issues
3. Determine the fix

### Common Secret Game Errors

**Next.js 15 Async Params**
```
Error: params.id is undefined
Fix: const id = (await params).id
```

**ESLint Quote Errors**
```
Error: ' can be escaped with &apos;
Fix: Use &apos; instead of ' in JSX
```

**Build Warnings as Errors**
```
Error: Build failed due to ESLint warning
Fix: Address all warnings, not just errors
```

### Step 4: Fix

1. Make the code change
2. Mark task complete in plans/tasks.md

### Step 5: Verify

1. Run `npm run build` to check TypeScript/ESLint
2. Re-run the command or refresh browser
3. Check that error is gone
4. Check for new errors introduced

### Step 6: Loop if Needed

If new errors appear, repeat from Step 2.

### Step 7: Document Resolution

Add to plans/tasks.md:
```
  - Resolution: [what fixed it]
  - Verified: [timestamp]
```

If this was a tricky bug, add to knowledge/lessons.md.

---

Ask user to share the error, or say "check browser" to read console.
