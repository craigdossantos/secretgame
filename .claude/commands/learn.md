# Learn Mode

Extract and save learnings from the current session to the knowledge base.

## Process

### Step 1: Review Recent Work

Look at:
- plans/tasks.md - What was accomplished
- plans/implementation.md - Technical decisions made
- plans/walkthrough.md - Outcomes and deviations
- Recent code changes (git diff)

### Step 2: Identify Learnings

Ask yourself:
1. **Patterns**: Did we create any reusable code patterns?
2. **Decisions**: Did we make significant architecture choices?
3. **Lessons**: Did anything unexpected happen? What worked/didn't?

### Step 3: Update Knowledge Base

For patterns, add to `knowledge/patterns.md`:
```markdown
### Pattern: [Name]
**Date:** [today]
**Context:** When to use this
**Solution:**
\`\`\`typescript
// Code
\`\`\`
**Why it works:** Explanation
```

For decisions, add to `knowledge/decisions.md`:
```markdown
### Decision: [Title]
**Date:** [today]
**Status:** Accepted
**Context:** What prompted this
**Decision:** What was decided
**Consequences:** Implications
```

For lessons, add to `knowledge/lessons.md`:
```markdown
### Lesson: [Title]
**Date:** [today]
**Category:** Bug | Performance | Architecture | Process
**What happened:** Description
**What we learned:** Insight
**Action:** What to do differently
```

For reusable code, save to `knowledge/snippets/[name].ts`

### Step 4: Clean Up Plans

After extracting learnings:
- Archive completed plans (move to plans/archive/ if desired)
- Or delete if no longer needed

### Step 5: Confirm

Tell user what was added to the knowledge base.

---

Ask user what they'd like to document, or say "auto" to analyze recent work automatically.
