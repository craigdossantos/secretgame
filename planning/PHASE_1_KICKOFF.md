# Phase 1: Critical Path to Launch - Implementation Kickoff

> **Branch:** `feature/phase-1-critical-path`
> **Status:** Ready to begin
> **Estimated Effort:** 8-12 hours
> **Priority:** MUST HAVE (Launch Blockers)

---

## Overview

This is the **first and most critical phase** of The Secret Game implementation roadmap. These features are absolute launch blockers - users cannot currently join rooms via invite links.

---

## Goals

Fix the three critical issues preventing launch:

1. ✅ **Invite System** - Users can join rooms via shareable links
2. ✅ **User Identity** - Users can enter their names and see who they are
3. ✅ **Basic Onboarding** - Users understand how the game works

---

## Features to Implement

### 1. Invite System (4-6 hours) ⭐⭐⭐

**Problem:** Users cannot join rooms via invite link (route doesn't exist)

**Files to Create:**
- `src/app/invite/[code]/page.tsx` (~80 lines)
- `src/app/api/invite/[code]/route.ts` (~50 lines)
- `src/app/api/invite/[code]/join/route.ts` (~100 lines)

**User Flow:**
1. User clicks invite link: `https://app.com/invite/ABC123`
2. Lands on invite page showing room name and member count
3. Enters name in form
4. Clicks "Join Room"
5. System creates user, adds to room, sets cookie
6. Redirects to `/rooms/[roomId]`

**Acceptance Criteria:**
- [ ] Invite link works: `/invite/[code]`
- [ ] Shows room info before joining
- [ ] Name input required and validated
- [ ] Checks room capacity (max 20)
- [ ] Creates user with entered name
- [ ] Sets userId cookie
- [ ] Redirects to room on success
- [ ] Handles invalid codes gracefully (404)
- [ ] Handles full rooms gracefully (error message)

---

### 2. User Identity Flow (2-3 hours) ⭐⭐

**Problem:** Users don't know "who they are" in the system

**Files to Create:**
- `src/components/user-identity-modal.tsx`
- `src/app/api/users/me/route.ts`

**Files to Modify:**
- `src/app/layout.tsx` - add name display in header

**User Flow:**
1. User visits any page
2. Check for userId cookie
3. If no cookie: Show modal "What's your name?"
4. Create user on submit, set cookie
5. Display name in header with edit icon

**Acceptance Criteria:**
- [ ] First-time visitors prompted for name
- [ ] Name displayed in header
- [ ] "Edit name" button works
- [ ] Name persists across sessions
- [ ] Cookie expires in 1 year

---

### 3. Basic Onboarding (2-3 hours) ⭐

**Problem:** Users don't understand game mechanics

**Files to Create:**
- `src/components/welcome-modal.tsx`
- `src/components/unlock-tooltip.tsx`

**Content:**
```
Welcome to The Secret Game!

Here's how it works:
1. Answer questions honestly
2. Rate your answer's spiciness (1-5 chilis)
3. Unlock others' secrets by sharing secrets of equal or higher spiciness

The more vulnerable you are, the more you learn about others.

Ready? Let's go!
```

**Acceptance Criteria:**
- [ ] Welcome modal shows on first room join
- [ ] Dismissible (don't show again)
- [ ] Tooltip appears on first locked secret view
- [ ] "How to Play" link opens instructions

---

## Success Metrics

After Phase 1 completion:
- ✅ New users can join a room in <30 seconds
- ✅ 0% bounce rate on invite pages
- ✅ Users understand unlock mechanic before first attempt

---

## Testing Checklist

Before marking Phase 1 complete:

- [ ] **Happy Path:** Invite → join → answer → unlock (works end-to-end)
- [ ] **Edge Case:** Invalid invite code (shows 404 error)
- [ ] **Edge Case:** Full room (shows "room full" message)
- [ ] **Edge Case:** Existing user revisits (no name prompt)
- [ ] **Mobile:** Invite flow works on phone
- [ ] **Multi-Browser:** Cookie isolation works correctly

---

## Development Tips

### Useful Files to Reference

**Existing Invite Code Generation:**
- `src/app/api/rooms/route.ts` - See how invite codes are created
- `src/lib/db/mock.ts` - Database helper methods

**Existing User Creation:**
- Cookie handling pattern used throughout the app
- See `src/app/api/secrets/route.ts` for getUserIdFromCookies example

**Existing Modals:**
- `src/components/custom-question-modal.tsx` - Modal pattern reference
- `src/components/ui/dialog.tsx` - Radix Dialog primitives

### Mock Database Helper Methods Available

```typescript
// In src/lib/db/mock.ts
await mockDb.findRoomByInviteCode(code);
await mockDb.countRoomMembers(roomId);
await mockDb.insertUser(user);
await mockDb.insertRoomMember(member);
await mockDb.findUserById(userId);
```

### Cookie Pattern

```typescript
// Setting cookie (in API route)
response.cookies.set('userId', userId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 365 // 1 year
});

// Reading cookie (in API route)
const userId = request.cookies.get('userId')?.value;

// Reading cookie (client-side)
const userId = document.cookie
  .split('; ')
  .find(row => row.startsWith('userId='))
  ?.split('=')[1];
```

---

## Implementation Order

**Recommended sequence:**

1. **Start with Invite System** (most critical)
   - Create `/invite/[code]/page.tsx` UI
   - Create GET `/api/invite/[code]` endpoint
   - Create POST `/api/invite/[code]/join` endpoint
   - Test end-to-end with existing room

2. **Add User Identity**
   - Create user identity modal
   - Add name display to header
   - Add edit name functionality

3. **Finish with Onboarding**
   - Create welcome modal
   - Add tooltip to locked secrets
   - Add "How to Play" link

---

## Definition of Done

Phase 1 is complete when:

- ✅ All acceptance criteria met for all 3 features
- ✅ All testing checklist items pass
- ✅ `npm run build` passes with no errors
- ✅ No console errors in development mode
- ✅ Mobile responsive tested on at least one device
- ✅ Code committed with proper message format
- ✅ Ready to merge to main

---

## Related Documentation

- **Full Roadmap:** `planning/PROJECT_PLAN.md`
- **Technical Specs:** `planning/FEATURE_ANALYSIS.md`
- **User Guide:** `planning/USER_INSTRUCTIONS.md`

---

## Questions or Issues?

If you encounter issues during implementation:

1. Check `planning/FEATURE_ANALYSIS.md` for detailed technical specs
2. Reference existing patterns in the codebase
3. Test incrementally (don't wait until everything is done)
4. Commit often with descriptive messages

---

**Ready to begin! 🚀**

**Start Time:** When you begin Phase 1
**Target Completion:** 8-12 hours of focused work
**Next Phase:** Phase 2 (Image Upload System)
