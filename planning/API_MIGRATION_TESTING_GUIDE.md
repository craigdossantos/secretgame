# API Migration Testing Guide

**Phase 6 - Production Backend Migration**
**Date**: 2025-11-20

## Quick Start Testing

### Prerequisites

1. **Environment Variables** (verify in `.env.local`):
```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

2. **Start Development Server**:
```bash
npm run dev
```

3. **Get Authentication Token**:
   - Navigate to http://localhost:3000
   - Click "Sign in with Google"
   - Open Browser DevTools → Application → Cookies
   - Copy the value of `next-auth.session-token`
   - Save this as `$TOKEN` for test commands below

---

## Testing Migrated Endpoints

### 1. Test User Authentication - `/api/users/me`

**Without Authentication** (should return null user):
```bash
curl http://localhost:3000/api/users/me | jq
```

Expected Response:
```json
{
  "user": null
}
```

**With Authentication** (should return user data):
```bash
TOKEN="your-session-token-here"

curl http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=$TOKEN" \
  | jq
```

Expected Response:
```json
{
  "user": {
    "id": "cm123abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  }
}
```

---

### 2. Test Room Creation - `/api/rooms` (POST)

**Without Authentication** (should fail with 401):
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Room",
    "questionIds": ["relationship-1", "spicy-2"],
    "setupMode": false
  }' \
  | jq
```

Expected Response:
```json
{
  "error": "Authentication required"
}
```

**With Authentication** (should create room):
```bash
TOKEN="your-session-token-here"

curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$TOKEN" \
  -d '{
    "name": "My Secret Room",
    "questionIds": ["relationship-1", "spicy-2", "truth-3"],
    "customQuestions": [],
    "setupMode": false
  }' \
  | jq
```

Expected Response:
```json
{
  "roomId": "cm456def...",
  "inviteCode": "ABC123",
  "inviteUrl": "http://localhost:3000/invite/ABC123",
  "name": "My Secret Room"
}
```

**Save the invite code for next test!**

---

### 3. Test Invite Lookup - `/api/invite/[code]`

**Public Endpoint** (no auth required):
```bash
# Replace ABC123 with actual invite code from previous test
INVITE_CODE="ABC123"

curl http://localhost:3000/api/invite/$INVITE_CODE | jq
```

Expected Response:
```json
{
  "roomId": "cm456def...",
  "roomName": "My Secret Room",
  "memberCount": 1,
  "maxMembers": 20,
  "isFull": false
}
```

**Invalid Invite Code** (should return 404):
```bash
curl http://localhost:3000/api/invite/INVALID999 | jq
```

Expected Response:
```json
{
  "error": "Invalid invite code"
}
```

---

## Complete Test Flow

Here's a complete test scenario from start to finish:

```bash
#!/bin/bash
# Save as test-api-flow.sh

# 1. Get current user (unauthenticated)
echo "=== Test 1: Get user (no auth) ==="
curl -s http://localhost:3000/api/users/me | jq
echo ""

# 2. Get current user (authenticated)
echo "=== Test 2: Get user (with auth) ==="
TOKEN="YOUR_TOKEN_HERE"  # Replace with actual token
curl -s http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=$TOKEN" \
  | jq
echo ""

# 3. Create room (should fail without auth)
echo "=== Test 3: Create room (no auth - should fail) ==="
curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room","questionIds":["q1","q2"]}' \
  | jq
echo ""

# 4. Create room (authenticated)
echo "=== Test 4: Create room (with auth) ==="
ROOM_RESPONSE=$(curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$TOKEN" \
  -d '{
    "name": "Test Room",
    "questionIds": ["relationship-1", "spicy-2"],
    "setupMode": false
  }')
echo $ROOM_RESPONSE | jq
echo ""

# 5. Extract invite code and test invite lookup
INVITE_CODE=$(echo $ROOM_RESPONSE | jq -r '.inviteCode')
echo "=== Test 5: Lookup invite code: $INVITE_CODE ==="
curl -s http://localhost:3000/api/invite/$INVITE_CODE | jq
echo ""

echo "=== All tests complete ==="
```

**Run the script**:
```bash
chmod +x test-api-flow.sh
./test-api-flow.sh
```

---

## Database Verification

After running tests, verify data in Supabase:

### Check Users Table
```sql
SELECT id, name, email, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

### Check Rooms Table
```sql
SELECT id, name, invite_code, owner_id, setup_mode, created_at
FROM rooms
ORDER BY created_at DESC
LIMIT 5;
```

### Check Room Members
```sql
SELECT rm.room_id, r.name as room_name, u.name as member_name, rm.joined_at
FROM room_members rm
JOIN rooms r ON r.id = rm.room_id
JOIN users u ON u.id = rm.user_id
ORDER BY rm.joined_at DESC
LIMIT 10;
```

### Check Room Questions
```sql
SELECT
  rq.id,
  r.name as room_name,
  rq.question_id,
  rq.question as custom_question,
  rq.display_order,
  rq.created_at
FROM room_questions rq
JOIN rooms r ON r.id = rq.room_id
ORDER BY r.created_at DESC, rq.display_order
LIMIT 10;
```

---

## Common Issues & Troubleshooting

### Issue 1: "Authentication required" Error

**Symptom**: Getting 401 errors even with session token

**Solutions**:
1. Verify token is not expired (tokens expire after 30 days)
2. Check `NEXTAUTH_SECRET` matches between requests
3. Sign out and sign in again to get fresh token
4. Verify cookie is being sent: `curl -v` to see headers

### Issue 2: "Invalid invite code" Error

**Symptom**: 404 error when looking up invite code

**Solutions**:
1. Verify room was actually created (check database)
2. Check invite code is exactly as returned (case-sensitive)
3. Ensure no trailing spaces or characters in code

### Issue 3: Room Creation Fails Silently

**Symptom**: No error but room not in database

**Solutions**:
1. Check server logs for database errors
2. Verify `DATABASE_URL` is correct
3. Check Drizzle migrations are applied
4. Verify Supabase connection is working

### Issue 4: CORS Errors in Browser

**Symptom**: Fetch fails with CORS error

**Solutions**:
1. This is expected when testing from different origin
2. Use same origin (http://localhost:3000) for frontend
3. Or use `curl` for API testing which bypasses CORS

---

## Testing with Postman

### Import Collection

1. Create new collection: "Secret Game API"
2. Add environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `sessionToken`: (your session token)

### Request 1: Get Current User

```
GET {{baseUrl}}/api/users/me

Headers:
Cookie: next-auth.session-token={{sessionToken}}
```

### Request 2: Create Room

```
POST {{baseUrl}}/api/rooms

Headers:
Content-Type: application/json
Cookie: next-auth.session-token={{sessionToken}}

Body (JSON):
{
  "name": "Test Room from Postman",
  "questionIds": ["relationship-1", "spicy-2"],
  "customQuestions": [
    {
      "question": "What's your biggest secret?",
      "category": "Deep Questions",
      "suggestedLevel": 5,
      "difficulty": "hard"
    }
  ],
  "setupMode": false
}
```

### Request 3: Lookup Invite

```
GET {{baseUrl}}/api/invite/ABC123

(No authentication required)
```

---

## Performance Benchmarks

Expected response times (local development):

- `/api/users/me`: < 50ms
- `/api/rooms` (POST): < 200ms (includes 3 DB inserts)
- `/api/invite/[code]`: < 100ms (2 queries)

Test with `time` command:
```bash
time curl -s http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=$TOKEN" \
  > /dev/null
```

---

## Next Steps After Testing

1. ✅ Verify all 3 migrated endpoints work correctly
2. ✅ Confirm data appears correctly in Supabase dashboard
3. ✅ Test error cases (invalid tokens, missing data, etc.)
4. 📋 Move to next batch of endpoints (see `API_MIGRATION_SUMMARY.md`)
5. 📋 Update frontend to handle new auth requirements

---

## Breaking Changes Checklist

Before deploying, ensure frontend handles these changes:

### `/api/rooms` (POST)
- [ ] User must be authenticated (sign-in flow added)
- [ ] Remove `userName` parameter from request body
- [ ] Handle 401 errors gracefully (redirect to sign-in)

### Other Endpoints
- [ ] No breaking changes for `/api/users/me`
- [ ] No breaking changes for `/api/invite/[code]`

---

## Rollback Plan

If migration causes issues:

1. **Quick Rollback**:
```bash
git stash
git checkout main
npm run dev
```

2. **Feature Flag Approach** (recommended for production):
```typescript
// Add to .env.local
USE_SUPABASE=false

// In route handlers
if (process.env.USE_SUPABASE === 'true') {
  // Use Supabase
} else {
  // Use mockDb
}
```

3. **Database Rollback**:
```bash
# Revert Drizzle migrations if needed
npm run db:rollback
```

---

## Success Criteria

Migration is successful when:

- ✅ All curl tests return expected responses
- ✅ Data appears correctly in Supabase dashboard
- ✅ No console errors in development
- ✅ `npm run build` passes without errors
- ✅ Frontend functionality remains unchanged
- ✅ Response formats match exactly with mockDb version

---

## Additional Resources

- **Migration Summary**: `planning/API_MIGRATION_SUMMARY.md`
- **Supabase Query Layer**: `src/lib/db/supabase.ts`
- **Auth Config**: `src/lib/auth/config.ts`
- **Database Schema**: `src/lib/db/schema.ts`
