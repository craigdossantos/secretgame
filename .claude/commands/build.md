# Build Mode

Balanced mode - creates minimal artifacts, good for medium-sized tasks.

## Process

1. Read `.claude/rules/` for coding standards
2. Check `knowledge/` for relevant patterns
3. If task is straightforward, implement directly
4. If browser testing needed:
   - Take screenshot with `node screenshot.js`
   - Check for console errors
   - Fix any errors found
5. Update plans/tasks.md if it exists
6. Provide summary

## Artifacts Created

Only create artifacts if:
- Task involves 3+ files
- You encounter unexpected issues
- User asks for documentation

## Secret Game Checklist

Before completing:
- [ ] `npm run build` passes
- [ ] Follows Whisk-inspired card design
- [ ] Accessibility requirements met (aria labels, keyboard nav)
- [ ] No console errors

## Quick Commands

```bash
# Build check
npm run build

# Screenshot for debugging
node screenshot.js

# Run dev server
npm run dev

# E2E tests
npm run test:e2e
```

---

Now ask the user what they want to build.
