# Successful Patterns - The Secret Game

Document code patterns that worked well in this project.

---

### Pattern: Whisk-Inspired Card Component
**Date:** 2024-12-04
**Context:** When creating card-based UI components
**Solution:**
```tsx
<div className="rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white border border-gray-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition-all duration-200">
  {/* Card content */}
</div>
```
**Why it works:** Consistent with Google Labs Whisk design language. Subtle shadows create depth, rounded corners feel tactile.

---

### Pattern: Next.js 15 Async Params
**Date:** 2024-12-04
**Context:** When accessing route params in Next.js 15 App Router
**Solution:**
```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  // Use id...
}
```
**Why it works:** Next.js 15 changed params to be a Promise. Must await before accessing properties.

---

### Pattern: API Response Helpers
**Date:** 2024-12-04
**Context:** When returning API responses from route handlers
**Solution:**
```tsx
import { successResponse, errorResponse } from '@/lib/api/helpers';

// Success
return successResponse({ data });

// Error
return errorResponse('Error message', 400);
```
**Why it works:** Consistent response format across all endpoints. Proper HTTP status codes.

---

### Pattern: Spiciness Rating Display
**Date:** 2024-12-04
**Context:** When showing spiciness levels (1-5)
**Solution:**
```tsx
const SpicyRating = ({ level }: { level: number }) => (
  <span aria-label={`Spiciness level ${level} out of 5`}>
    {'🌶️'.repeat(level)}
  </span>
);
```
**Why it works:** Visual gamification. Accessible with aria-label for screen readers.

---

<!-- Add new patterns below as you discover them -->
