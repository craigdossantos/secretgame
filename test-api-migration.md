# API Migration Testing Guide

## Server Status
✅ **Server Running**: http://localhost:3007

## Test Results

### 1. ✅ `/api/users/me` (GET)
**Status**: Working correctly
- Without auth: Returns `{"user": null}`
- Expected behavior: Should return user data when authenticated

**Test Command**:
```bash
curl http://localhost:3007/api/users/me/
```

### 2. ✅ `/api/invite/[code]` (GET)
**Status**: Working correctly
- Invalid code: Returns `{"error": "Invalid invite code"}` with 404
- Logging is working (shows "Looking up invite code" in console)

**Test Command**:
```bash
curl http://localhost:3007/api/invite/TESTCODE123/
```

### 3. ⏳ `/api/rooms` (POST)
**Status**: Requires authentication testing
- Needs authenticated session to test

---

## Manual Testing Steps

### Step 1: Sign In with Google OAuth
1. Open browser: http://localhost:3007
2. Click "Sign In" button (should be in header/nav)
3. Complete Google OAuth flow
4. Verify you're signed in (user menu should appear)

### Step 2: Test User Session
1. Open DevTools (F12)
2. Go to Console
3. Run this code:
```javascript
fetch('/api/users/me/')
  .then(r => r.json())
  .then(data => console.log('User data:', data))
```
Expected result: Should show your user object with id, email, name

### Step 3: Test Room Creation
1. In DevTools Console, run:
```javascript
fetch('/api/rooms/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Room',
    questionIds: ['q1', 'q2', 'q3'],
    setupMode: false
  })
})
  .then(r => r.json())
  .then(data => console.log('Room created:', data))
```
Expected result: Should return room object with inviteCode

### Step 4: Test Invite Code
1. Copy the `inviteCode` from the room response
2. In Console, run:
```javascript
fetch('/api/invite/YOUR_INVITE_CODE/')
  .then(r => r.json())
  .then(data => console.log('Invite data:', data))
```
Expected result: Should return room info with owner details

---

## Verification Checklist

- [ ] Server starts without errors
- [ ] Google OAuth sign-in works
- [ ] `/api/users/me` returns user data when authenticated
- [ ] `/api/rooms` creates room with authenticated user as owner
- [ ] Room gets unique invite code
- [ ] `/api/invite/[code]` returns valid room info
- [ ] Data persists in Supabase (verify in Supabase dashboard)

---

## Common Issues

### Issue: "Authentication required" error
**Solution**: Make sure you're signed in first (Step 1)

### Issue: Google OAuth redirect error
**Check**:
- `.env.local` has correct `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Google Cloud Console has `http://localhost:3007/api/auth/callback/google` in authorized redirects

### Issue: Database connection error
**Check**:
- `.env.local` has valid Supabase credentials
- Supabase project is not paused
- Run SQL schema if tables don't exist

---

## Next Steps After Testing

1. ✅ If all tests pass → Continue with remaining 9 API routes
2. ⚠️ If auth issues → Fix Google OAuth configuration
3. ⚠️ If database errors → Verify Supabase connection and schema

---

**Date**: 2025-11-21
**Branch**: feature/production-backend
**Progress**: 3/12 routes migrated (25%)
