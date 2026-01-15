---
module: Build System
date: 2025-12-15
problem_type: build_error
component: frontend_stimulus
symptoms:
  - "ESLint @typescript-eslint/no-unused-vars warnings treated as errors on Vercel"
  - "Production build fails with TypeScript compilation errors"
  - "Removed prop still being passed to component causes type error"
root_cause: config_error
resolution_type: code_fix
severity: high
tags: [eslint, typescript, vercel, unused-vars, prettier, build-failure]
---

# Troubleshooting: ESLint Unused Variables Breaking Vercel Build

## Problem
Vercel production builds were failing because ESLint warnings are treated as errors in production mode. Multiple `@typescript-eslint/no-unused-vars` warnings accumulated in the codebase, preventing deployment.

## Environment
- Module: Build System / Code Quality
- Framework: Next.js 15.5.3
- TypeScript: Strict mode enabled
- Deployment: Vercel
- Date: 2025-12-15

## Symptoms
- `npm run build` fails with ESLint errors locally
- Vercel deployment fails at build step
- 9 total ESLint warnings across multiple files
- TypeScript error when component prop was removed but usage remained:
  ```
  Type error: Property 'showAverage' does not exist on type 'IntrinsicAttributes & ChiliRatingProps'
  ```

## What Didn't Work

**Direct solution:** The problem was identified systematically through `npm run lint` and fixed file by file.

## Solution

**Files fixed and changes made:**

1. **`src/app/rooms/[id]/page.tsx`** - Multiple fixes:
```typescript
// Before (broken):
import { QuestionCard } from "@/components/question-card";  // Never used
const [userSpicinessRatings, setUserSpicinessRatings] = useState<Record<string, number>>({});  // Never used
const handleSubmitAnswer = async (...) => { ... }  // ~50 lines never called
const handleRateSpiciness = (...) => { ... }  // Never called
onAnswer={(_q: QuestionPrompt) => { ... }}  // _q flagged as unused

// After (fixed):
// Removed unused import entirely
// Removed unused state variables entirely
// Removed unused functions entirely
onAnswer={() => {  // Removed unused parameter
  // Answer handling is done within SingleQuestionView
}}
```

2. **`src/components/chili-rating.tsx`** - Remove unused prop:
```typescript
// Before (broken):
interface ChiliRatingProps {
  showAverage?: boolean;  // Declared but never read
}
export function ChiliRating({
  showAverage: _showAverage = false,  // Prefixed but still flagged
}: ChiliRatingProps)

// After (fixed):
interface ChiliRatingProps {
  rating: number;
  userRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}
// showAverage removed entirely from interface and destructuring
```

3. **`src/components/question-card.tsx`** - Remove prop usage:
```typescript
// Before (broken):
<ChiliRating
  rating={question.suggestedLevel}
  size="sm"
  showAverage={true}  // Prop no longer exists!
/>

// After (fixed):
<ChiliRating
  rating={question.suggestedLevel}
  size="sm"
/>
```

4. **`src/components/setup-mode-view.tsx`** - Remove unused state:
```typescript
// Before (broken):
const [loading, setLoading] = useState(true);  // Never read
const [error, setError] = useState<string | null>(null);  // Set but never displayed

// After (fixed):
// Both state variables removed entirely
// Also removed setError() call that was orphaned
```

5. **`tests/debug.spec.ts`** - Remove unused import:
```typescript
// Before (broken):
import { test, expect } from '@playwright/test';  // expect never used

// After (fixed):
import { test } from '@playwright/test';
```

**Commands run:**
```bash
# Format all files consistently
npx prettier --write "src/**/*.{ts,tsx}" "tests/**/*.ts"

# Verify no ESLint warnings remain
npm run lint

# Verify build passes
npm run build
```

## Why This Works

1. **ROOT CAUSE:** The codebase accumulated unused code over time as features were refactored. When props/functions were removed from one location, their usages or declarations weren't cleaned up everywhere.

2. **Vercel Build Behavior:** Vercel's production builds treat ESLint warnings as errors by default. This is intentional to ensure code quality, but means warnings that pass locally can fail deployment.

3. **The Cascade Effect:** Removing a prop from a component interface (`ChiliRating`) requires also removing:
   - The prop from the destructuring
   - All usages of that prop in consuming components
   - TypeScript will catch the usage errors, but only if you remove the interface definition first

4. **Underscore Prefix Doesn't Always Work:** ESLint's `@typescript-eslint/no-unused-vars` configuration varies. Sometimes `_prefixed` variables are allowed, sometimes not. The safest approach is to remove unused code entirely rather than masking it.

## Prevention

- **Run `npm run build` before committing** - Catches all ESLint and TypeScript errors
- **Remove unused code immediately** - Don't leave "commented out" or prefixed unused code
- **When removing a prop/function, search the codebase** - Use `grep` or IDE search to find all usages
- **Set up pre-commit hooks** - Consider husky + lint-staged to block commits with warnings
- **Regular code cleanup sessions** - Schedule periodic reviews to remove dead code

## Related Issues

No related issues documented yet.
