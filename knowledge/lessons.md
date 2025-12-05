# Lessons Learned - The Secret Game

Document what worked, what didn't, and insights gained.

---

### Lesson: ESLint Warnings Break Vercel Builds
**Date:** 2024-12-04
**Category:** Build
**What happened:** Vercel deployment failed due to ESLint warnings being treated as errors.
**What we learned:** Vercel's default Next.js build treats ESLint warnings as errors.
**Action:** Always run `npm run build` locally before pushing. Fix all warnings, not just errors.

---

### Lesson: Next.js 15 Async Params
**Date:** 2024-12-04
**Category:** Architecture
**What happened:** Route params stopped working after Next.js 15 upgrade.
**What we learned:** Next.js 15 changed `params` to be a Promise that must be awaited.
**Action:** Use pattern: `const id = (await params).id` in all route handlers.

---

### Lesson: TypeScript Strict Quote Escaping
**Date:** 2024-12-04
**Category:** Bug
**What happened:** TypeScript compilation failed on JSX with apostrophes.
**What we learned:** Strict mode requires escaped quotes in JSX text content.
**Action:** Use `&apos;` and `&quot;` instead of literal quotes in JSX.

---

### Lesson: Feature Branches Always
**Date:** 2024-12-04
**Category:** Process
**What happened:** Direct commits to main caused merge conflicts and confusion.
**What we learned:** Even small changes should go through feature branches and PRs.
**Action:** ALWAYS create feature branch, even for "quick fixes".

---

<!-- Add new lessons below as you discover them -->
