# Architecture Decisions - The Secret Game

Document significant technical decisions and their rationale.

---

### Decision: Mock Database for Development
**Date:** 2024-12-04
**Status:** Accepted
**Context:** Need fast iteration during MVP development. Drizzle + Supabase setup was slowing down development.
**Decision:** Use mock database implementation in `lib/db/mock.ts` that simulates persistence.
**Consequences:**
- Faster development cycles
- No external dependencies during development
- Migration path to real DB is prepared (types match)
- Data doesn't persist between server restarts

---

### Decision: Cookie-Based Temporary Users
**Date:** 2024-12-04
**Status:** Accepted
**Context:** Need user identity without complex auth setup during MVP.
**Decision:** Use cookie-based temporary user system. No passwords or OAuth yet.
**Consequences:**
- Simple to implement
- Users can start using app immediately
- NextAuth.js integration prepared for future
- User data not persistent across devices

---

### Decision: Whisk-Inspired Design System
**Date:** 2024-12-04
**Status:** Accepted
**Context:** Need cohesive, modern UI that feels tactile and engaging.
**Decision:** Base design on Google Labs Whisk - card-based layout with subtle shadows and smooth animations.
**Consequences:**
- Consistent look and feel
- Clear visual hierarchy
- Animation-first approach
- Framer Motion required for interactions

---

### Decision: Question Selection from Markdown
**Date:** 2024-12-04
**Status:** Accepted
**Context:** Need easy way to manage and update question content.
**Decision:** Store questions in `data/questions.md`, parse with unified tagging system.
**Consequences:**
- Non-technical users can edit questions
- Version control for content
- Flexible tagging system
- Parsing overhead at build/runtime

---

<!-- Add new decisions below -->
