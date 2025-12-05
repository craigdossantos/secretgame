# Fast Mode

Use this for quick fixes, small changes, or when you know exactly what to do.
Skips artifact creation for speed.

## Rules Still Apply

1. Read `.claude/rules/` and follow them
2. Check `knowledge/` for relevant patterns
3. NEVER work directly on main - create feature branch if needed

## Process

1. Understand the request
2. Make the change directly
3. Verify it works (run `npm run build`, check browser if UI)
4. Provide brief summary of what changed

## Secret Game Specifics

- Maintain Whisk-inspired card design
- Use existing API helpers: `successResponse()`, `errorResponse()`
- Handle Next.js 15 async params properly
- Keep spiciness ratings (🌶️ x1-5) consistent

## When to Suggest Planning Mode Instead

If the request involves:
- Multiple files (3+)
- New architecture patterns
- Uncertainty about approach
- Significant refactoring
- New features affecting business logic

Say: "This seems complex enough to benefit from planning. Want me to switch to /plan mode?"

---

Now ask the user what quick fix they need.
