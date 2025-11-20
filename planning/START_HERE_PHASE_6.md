# START HERE: Phase 6 Production Backend

**Created:** January 2025
**For:** New conversation starting production backend work

---

## Quick Context

You've built an **amazing local MVP** with all core features working:
- ✅ Invite system, rooms, questions, secrets
- ✅ Image uploads, multiple choice, collaborative views
- ✅ Beautiful Whisk-inspired UI

**BUT** it only works locally because everything uses a **mock in-memory database**.

---

## What You Need To Do

**Goal:** Replace mock database with real backend so you can deploy to production.

**Read This First:** [PHASE_6_PRODUCTION_BACKEND.md](./PHASE_6_PRODUCTION_BACKEND.md)

**Estimated Time:** 20-30 hours

---

## Quick Start Commands

```bash
# 1. Create new feature branch
git checkout -b feature/production-backend

# 2. Verify current state
npm run build  # Should pass
git status     # Should be on feature/production-backend

# 3. Start implementing Phase 6
# (Follow PHASE_6_PRODUCTION_BACKEND.md step-by-step)
```

---

## The 5 Main Tasks

### 1. Set Up Supabase (6-8 hours)
- Create project at supabase.com
- Run SQL schema (provided in Phase 6 doc)
- Configure environment variables
- Test connection

### 2. Implement Auth (8-10 hours)
- Set up Google OAuth
- Add login/logout UI
- Profile photo upload
- Replace cookie auth

### 3. Migrate API Routes (4-6 hours)
- Replace `mockDb` calls with Supabase queries
- Update all `/api/*` endpoints
- Test each route

### 4. Move Images to Storage (2-4 hours)
- Set up Supabase Storage buckets
- Upload images instead of base64
- Update display components

### 5. Deploy & Test (2-4 hours)
- Add env vars to Vercel
- Deploy to production
- Test with real users

---

## Key Files You'll Create

```
src/lib/supabase/
  ├── client.ts          # Client-side Supabase
  ├── server.ts          # Server-side Supabase
  └── middleware.ts      # Auth middleware

src/lib/db/
  └── supabase.ts        # Real DB queries (replaces mock.ts)

src/components/auth/
  ├── login-button.tsx   # Google login
  ├── logout-button.tsx
  └── user-menu.tsx      # Profile dropdown

.env.example             # Environment template
```

---

## Environment Variables You'll Need

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Current Project Stats

**Lines of Code:** ~8,000 (across all phases)
**Components:** 40+
**API Routes:** 15+
**Features Complete:** All UI/UX done, just needs backend

**Git Status:**
- Branch: `main`
- Latest commits:
  - ✅ Phase 3 complete (custom MC options)
  - ✅ Planning docs updated for Phase 6
  - Ready to branch for backend work

---

## Tips for Success

1. **Follow the Phase 6 doc step-by-step** - Don't skip ahead
2. **Test each section before moving on** - Database first, then auth, then migration
3. **Keep mock DB working alongside** - Don't delete until everything migrated
4. **Use Supabase free tier** - Perfect for development
5. **Document any blockers** - Update Phase 6 doc with solutions you find

---

## Success Criteria

When you're done, you should be able to:
- [ ] Share invite link with friend on different device
- [ ] Friend logs in with Google
- [ ] Friend joins room and answers questions
- [ ] Friend's data persists even after server restart
- [ ] Profile photos display for all users
- [ ] Images load from Supabase Storage (not base64)
- [ ] App works on Vercel production deployment

---

## Resources

- **Full Plan:** [PHASE_6_PRODUCTION_BACKEND.md](./PHASE_6_PRODUCTION_BACKEND.md)
- **Project Overview:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)
- **Progress Tracking:** [progress.md](./progress.md)
- **AI Instructions:** [../CLAUDE.md](../CLAUDE.md)
- **Supabase Docs:** https://supabase.com/docs/guides/auth/server-side/nextjs

---

## What Happens After Phase 6

Once backend is live:
1. **Soft launch** with 5-10 beta testers
2. **Gather feedback** and fix critical bugs
3. **Phase 4: UX Polish** (welcome modals, better onboarding)
4. **Public alpha launch** 🚀

---

## Questions to Ask Claude in New Conversation

> "I need to implement Phase 6: Production Backend for The Secret Game. I've read the planning docs. Let's start with setting up Supabase and creating the database schema. Can you guide me through this step-by-step?"

Or:

> "I'm starting Phase 6 production backend work. I want to use Supabase for database, auth, and storage. Let's begin by creating the Supabase project and running the SQL schema. What's the first step?"

---

**Good luck! You're 20-30 hours away from a production-ready MVP!** 🚀
