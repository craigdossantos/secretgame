# The Secret Game - Feature Analysis & Technical Specifications

> **Last Updated:** 2025-01-20
> **Status:** Comprehensive analysis of current implementation, proposed features, and implementation roadmap

---

## Table of Contents

1. [Question Type Analysis](#question-type-analysis)
2. [Current Implementation Status](#current-implementation-status)
3. [Unlock Mechanism Analysis](#unlock-mechanism-analysis)
4. [User Flow Analysis](#user-flow-analysis)
5. [Gap Analysis](#gap-analysis)
6. [Technical Specifications](#technical-specifications)
7. [Priority Recommendations](#priority-recommendations)

---

## Question Type Analysis

### ✅ Currently Implemented Question Types

#### 1. **Text Questions**
- **Implementation:** Fully working
- **Location:** `src/components/question-card.tsx:334-530`
- **Features:**
  - Flip card UI (front: question, back: answer form)
  - 100-word limit with real-time counter
  - Spiciness rating (1-5)
  - Keep-it-private rating (1-5)
  - Anonymous answer checkbox
- **Data Model:** `answerType: 'text'`, no special answerData
- **Display:** Plain text in `SecretAnswerDisplay`

#### 2. **Slider Questions**
- **Implementation:** Fully working
- **Location:** `src/components/question-card.tsx:142-234`
- **Features:**
  - Inline answer (no flip card)
  - Custom min/max labels
  - Configurable step size
  - Visual slider with numeric display
  - Anonymous answer checkbox
- **Data Model:**
  ```typescript
  answerType: 'slider'
  answerData: { value: number }
  answerConfig: {
    type: 'slider',
    config: { min, max, minLabel, maxLabel, step }
  }
  ```
- **Display:** Large numeric value + visual progress bar + labels

#### 3. **Multiple Choice Questions**
- **Implementation:** Fully working
- **Location:** `src/components/question-card.tsx:238-331`
- **Features:**
  - Inline answer (no flip card)
  - Single or multi-select options
  - Checkbox/radio UI
  - Distribution percentage display
  - Anonymous answer checkbox
- **Data Model:**
  ```typescript
  answerType: 'multipleChoice'
  answerData: { selected: string[] }
  answerConfig: {
    type: 'multipleChoice',
    config: {
      options: string[],
      allowMultiple: boolean,
      useRoomMembers?: boolean,
      showDistribution?: boolean
    }
  }
  ```
- **Display:** Options with checkmarks for selected items

---

### 🎨 Proposed New Question Types

#### 4. **Collaborative Text Questions**

**Concept:**
*"A text question that can be answered by multiple participants, and each participant gets the answers of the other people if they also submit their answer."*

**Technical Requirements:**
- **Schema Changes:** None needed (use existing questionId field)
- **UI Changes:**
  - Add "View All Answers" button to answered questions
  - Create new component: `CollaborativeAnswersFeed`
  - Show ALL secrets with matching questionId
- **Access Control:**
  - User must have answered the question to view other answers
  - Filter: `secrets.filter(s => s.questionId === targetQuestionId && hasUserAnswered)`
- **Display:**
  - Side-by-side comparison view
  - Optionally show/hide author names
  - Preserve anonymous flag for individual answers

**Implementation Complexity:** Medium (10-12 hours)

**Files to Modify:**
- Create: `src/components/collaborative-answers-feed.tsx`
- Modify: `src/app/rooms/[id]/page.tsx` - add "View All Answers" button
- Create: `src/app/api/questions/[questionId]/answers/route.ts` - fetch all answers

---

#### 5. **Image Upload Questions**

**Concept:**
*"A text question with an image for an answer (and the ability to add some text). Such as 'Submit the homepage of suggested videos (a screenshot) of your youtube profile.'"*

**Current State:**
- ✅ Flag exists: `allowImageUpload` in `src/lib/questions.ts:55`
- ✅ Storage field exists: `answerData` in `src/lib/db/mock.ts:62`
- ❌ NO UI for file upload
- ❌ NO image rendering in secret display

**Technical Requirements:**

**Data Model:**
```typescript
interface ImageAnswerData {
  imageBase64?: string;      // For mock DB
  imageUrl?: string;         // For cloud storage (future)
  caption?: string;          // Optional text description
  mimeType?: string;         // image/png, image/jpeg
  fileSize?: number;         // In bytes
}

answerType: 'imageUpload'
answerData: ImageAnswerData
```

**UI Components:**
1. **File Input Component** (`src/components/image-upload-input.tsx`)
   - Drag-and-drop zone
   - File type validation (image/* only)
   - Size limit (e.g., 5MB)
   - Image preview before submit
   - Optional text caption field

2. **Image Display Component** (`src/components/image-answer-display.tsx`)
   - Full-size image with modal viewer
   - Caption text below image
   - Placeholder for loading states

**Storage Strategy:**
- **Phase 1 (Mock DB):** Base64 encoding stored in-memory
  - Pros: No external dependencies
  - Cons: Memory-intensive, not suitable for production
- **Phase 2 (Production):** Cloud storage (Supabase Storage or Cloudinary)
  - Upload to cloud → store URL in database
  - Generate thumbnails for card view

**Implementation Complexity:** Medium-High (12-16 hours)

**Files to Create:**
- `src/components/image-upload-input.tsx`
- `src/components/image-answer-display.tsx`
- `src/lib/image-utils.ts` (validation, compression)

**Files to Modify:**
- `src/components/question-card.tsx` - add image upload UI for text questions
- `src/components/secret-answer-display.tsx` - render images
- `src/app/api/secrets/route.ts` - handle base64 storage

**Acceptance Criteria:**
- [ ] User can select image file via drag-drop or click
- [ ] Image preview shows before submission
- [ ] Optional text caption can be added
- [ ] Images display in unlocked secrets
- [ ] File size limit enforced (5MB)
- [ ] Only image formats accepted (PNG, JPG, GIF)

---

#### 6. **Multiple Choice with Custom Options**

**Concept:**
*"A multiple choice question that has some pre-filled answers and after answering you can see who chose each answer. It's also possible to add in another selection if that option was enabled when the question was created."*

**Current State:**
- ✅ Fixed options work
- ❌ No "Other (specify)" option
- ❌ No "who picked what" view

**Technical Requirements:**

**Data Model Extensions:**
```typescript
interface MultipleChoiceConfig {
  options: string[];
  allowMultiple: boolean;
  allowCustomOptions?: boolean;        // NEW
  showWhoPickedWhat?: boolean;         // NEW
  showDistribution?: boolean;
  useRoomMembers?: boolean;
}

interface MultipleChoiceAnswerData {
  selected: string[];
  customOption?: string;               // NEW - user's custom entry
}
```

**UI Enhancements:**
1. **Custom Option Entry**
   - If `allowCustomOptions: true`, show "Other (specify)" field
   - Text input appears when "Other" is selected
   - Custom option stored in `answerData.customOption`

2. **Results View - "Who Picked What"**
   - Only visible if user answered the question
   - List each option with avatar badges of users who selected it
   - Preserve anonymous users as "?"
   - Example:
     ```
     Option A: [Avatar1] [Avatar2] [?]
     Option B: [Avatar3]
     Custom: "My own answer" - [Avatar4]
     ```

**Implementation Complexity:** Medium (8-10 hours)

**Files to Modify:**
- `src/components/answer-input-multiple-choice.tsx` - add "Other" field
- `src/components/secret-answer-display.tsx` - add "who picked what" view
- `src/lib/questions.ts` - extend MultipleChoiceConfig interface
- `src/components/custom-question-modal.tsx` - add toggle for custom options

**Acceptance Criteria:**
- [ ] Question creator can enable "Allow custom options"
- [ ] "Other (specify)" option appears for users
- [ ] Custom options stored with answer
- [ ] Results show user avatars per option (if user answered)
- [ ] Anonymous users shown as "?" avatar

---

#### 7. **Person Picker Questions** (Already Supported!)

**Current State:** ✅ Framework exists via `useRoomMembers: true`

**Example Use Case:**
```typescript
{
  question: "Who in this group is most likely to become famous?",
  questionType: 'multipleChoice',
  answerConfig: {
    type: 'multipleChoice',
    config: {
      options: [], // Auto-populated from room members
      allowMultiple: false,
      useRoomMembers: true,
      showWhoPickedWhat: true
    }
  }
}
```

**Implementation Status:** Partial
- ✅ Config flag exists
- ❌ UI doesn't dynamically populate room members yet
- ❌ Need API to fetch room members for dropdown

**Implementation Complexity:** Low (4-6 hours)

**Files to Modify:**
- `src/components/answer-input-multiple-choice.tsx` - fetch room members if `useRoomMembers: true`
- `src/app/api/rooms/[id]/members/route.ts` - new endpoint to get members

---

#### 8. **Ranking/Ordering Questions** (Future Consideration)

**Concept:**
*"Rank these life priorities from most to least important"*

**Technical Requirements:**
```typescript
interface RankingConfig {
  items: string[];              // Items to rank
  allowPartialRanking?: boolean; // Can skip some items
}

interface RankingAnswerData {
  ranking: string[];            // Ordered list of items
  skipped?: string[];          // Items not ranked
}

answerType: 'ranking'
```

**UI Needs:**
- Drag-and-drop reorderable list
- Visual feedback for ordering
- Results: Show average position for each item

**Implementation Complexity:** High (16-20 hours)
**Priority:** Low (defer to V2)

---

## Current Implementation Status

### ✅ Fully Implemented Features

#### Room Management
- **Room Creation** ([src/app/page.tsx](src/app/page.tsx))
  - Select questions from database
  - Create custom questions
  - Generate unique invite code
  - Automatic redirect to room
- **Room Display** ([src/app/rooms/[id]/page.tsx](src/app/rooms/[id]/page.tsx))
  - Unified feed (questions + secrets)
  - Invite code copy-to-clipboard
  - Member count display
  - 3 questions shown at a time

#### Question System
- **Text Questions:** Full flip-card UI with 100-word validation
- **Slider Questions:** Inline slider with custom labels
- **Multiple Choice:** Single/multi-select with checkboxes
- **Custom Questions:** Users can add questions mid-game
- **Question Rotation:** Skip mechanism (shows next 3 from pool)

#### Secret System
- **Secret Submission:** Answer → creates locked secret
- **Unlock Mechanism:** Submit matching/higher spiciness secret to unlock
- **Star Ratings:** 1-5 stars on unlocked secrets
- **Access Control:** Secrets locked by default, unlocked for buyers
- **Buyers Count:** Tracks how many people unlocked each secret

#### Anonymous Answers
- **Data Model:** `isAnonymous` flag in database ([src/lib/db/mock.ts:63](src/lib/db/mock.ts#L63))
- **UI:** Checkbox on all question types
- **Display:** Shows "?" avatar instead of user photo ([src/components/secret-card.tsx:73-95](src/components/secret-card.tsx#L73-L95))

---

### ⚠️ Partially Implemented Features

#### Image Upload
- ✅ **Schema:** `allowImageUpload` flag exists
- ✅ **Storage:** `answerData` can hold image data
- ❌ **UI:** No file upload component
- ❌ **Display:** No image rendering in secrets

#### Multiple Choice Enhancements
- ✅ **Core:** Fixed options work
- ❌ **Custom Options:** No "Other (specify)" field
- ❌ **Results View:** No "who picked what" display

#### Unlock Requirements
- ✅ **Schema:** `UnlockRequirement` type exists ([src/lib/questions.ts:35-38](src/lib/questions.ts#L35-L38))
- ✅ **Current:** `matchSpiciness` type works
- ❌ **Not Implemented:** `answerSpecificQuestion` and `answerAnyQuestion` types

---

### ❌ Not Implemented Features

#### Invite System
- **Critical Gap:** No `/invite/[code]` route exists
- Users cannot join via shareable link
- Workaround: Must manually navigate to `/rooms/[roomId]`

#### User Identity Flow
- No name prompt on first visit
- Cookie-based users created silently
- Users don't know "who they are" in system

#### Onboarding/Tutorial
- No explanation of game mechanics
- Unlock mechanism confusing for first-timers
- No tooltips or help text

#### Collaborative Question View
- Cannot see "all answers to Question X"
- No comparison view across participants

#### Question Refresh
- Must skip questions one-by-one
- No "show me 3 different questions" button

#### Real-Time Updates
- Requires manual page refresh
- No polling or WebSocket
- New secrets don't appear automatically

#### Answer Management
- Cannot edit your own answers
- Cannot delete/hide answers
- `isHidden` flag exists but no UI

#### Peer Approval System
- No review/approval mechanism
- Cannot validate answers before unlock
- No notification system

---

## Unlock Mechanism Analysis

### Current Implementation: Spiciness-Based Unlock

**Location:** `src/app/api/secrets/[id]/unlock/route.ts:68-73`

**How It Works:**
1. User clicks "Unlock" on a locked secret (e.g., Level 4)
2. Drawer opens with form to submit a new secret
3. Validation: `selfRating >= secretToUnlock.selfRating`
4. On success:
   - New secret added to room
   - User granted access to locked secret
   - Locked secret's `buyersCount` increments
5. User can now view the unlocked secret

**Code:**
```typescript
if (selfRating < secretToUnlock.selfRating) {
  return errorResponse(
    `Your secret must have a rating of ${secretToUnlock.selfRating} or higher`,
    400
  );
}
```

**Pros:**
- Simple, clear mechanic
- Immediate unlock (no waiting)
- Encourages vulnerability exchange

**Cons:**
- No quality control
- Users could submit gibberish to unlock
- No peer validation

---

### Proposed Enhancement: Peer-Approved Unlock System

**Concept:**
*"To see the answer to a question - you must either answer it, or 'pay' for the answer by submitting an answer to a new question that has not been answered yet - and then someone else in the group has to give an approval rating of your answer before your 'payment' is good."*

#### New Unlock Flow Types

**Type A: Answer Same Question (Instant)**
- User wants to unlock Secret A
- Requirement: Answer the same question Secret A answered
- **Unlock:** Immediate (no approval needed)
- **Rationale:** Fair trade - same vulnerability level

**Type B: Submit New Secret (Requires Approval)**
- User wants to unlock Secret A (spiciness 4)
- Requirement: Submit NEW answer to any unanswered question (spiciness ≥ 4)
- **Approval Flow:**
  1. Answer submitted → status: `pending`
  2. Other room members notified: "Review new answer to unlock"
  3. Members rate the answer 1-5 stars
  4. If avg rating ≥ threshold (e.g., 3.0), unlock granted
  5. If rejected, user must submit different answer
- **Rationale:** Ensures quality, prevents spam

#### Database Schema Changes

```typescript
interface Secret {
  // Existing fields...
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalRatings?: Array<{
    userId: string;
    rating: number;
    createdAt: Date;
  }>;
  unlocksSecretId?: string;  // Which secret this answer is trying to unlock
}

interface UnlockRequirement {
  type: 'matchSpiciness' | 'answerSameQuestion' | 'answerNewQuestion';
  requiresApproval?: boolean;
  minApprovalRating?: number; // e.g., 3.0 out of 5
  minApprovalVotes?: number;  // e.g., must have 2+ votes
}
```

#### UI Components Needed

1. **Review Queue Component** (`src/components/review-queue.tsx`)
   - Shows pending answers awaiting approval
   - Star rating interface
   - "Approve" / "Reject" buttons
   - Context: Shows which secret user is trying to unlock

2. **Notification Badge**
   - Header badge: "2 answers to review"
   - Click → opens review queue modal

3. **Pending Status Indicator**
   - User's own pending answers show "⏳ Awaiting approval"
   - Progress: "1/2 approvals received"

#### API Endpoints Needed

```typescript
// Submit answer for approval
POST /api/secrets/[id]/unlock-with-approval
Body: { questionId, body, selfRating, importance, unlocksSecretId }
Response: { pendingSecretId, requiresApproval: true }

// Review a pending answer
POST /api/secrets/[id]/review
Body: { rating: number }
Response: { approved: boolean, avgRating: number }

// Get pending reviews
GET /api/rooms/[id]/pending-reviews
Response: { pendingSecrets: Secret[] }
```

#### Implementation Complexity

**Effort:** High (20-30 hours)

**Breakdown:**
- Database schema changes: 2 hours
- API endpoints: 8 hours
- Review queue UI: 6 hours
- Notification system: 4 hours
- Testing & edge cases: 4 hours
- Integration with existing unlock flow: 4 hours

**Priority:** Low (defer until after core features ship)

**Rationale:**
While this adds interesting game mechanics, it introduces complexity and friction. Better to launch with simple spiciness-based unlock, then add approval as V2 enhancement based on user feedback.

---

## User Flow Analysis

### Flow 1: Room Creator (Host)

#### Current Experience
1. **Homepage Landing**
   - See pre-filled name and room name inputs
   - Scroll to see ALL 130+ questions in database

2. **Question Selection**
   - Click checkboxes to select questions (no limit)
   - Can filter by category
   - Can create custom questions via "+" button

3. **Room Creation**
   - Click "Create Room" → instant redirect
   - See invite code at top of room page
   - Can copy invite link

4. **Gameplay**
   - View 3 questions from selected pool
   - Answer questions or skip
   - View secrets feed

#### Pain Points
- ⚠️ **Overwhelming:** 130+ questions to choose from (no guidance)
- ⚠️ **No preview:** Can't see room before creating
- ⚠️ **No defaults:** Must manually select (no "Quick Start")
- ⚠️ **No explanation:** Doesn't explain game rules upfront

#### Proposed Improvements
1. **Preset Question Packs**
   - "Icebreaker Pack" (10 light questions, spiciness 1-2)
   - "Deep Dive Pack" (15 questions, spiciness 3-4)
   - "The Full Experience" (20 questions, all levels)
   - "Custom Selection" (current manual mode)

2. **Smart Defaults**
   - "Quick Start" button auto-selects balanced 12 questions
   - One-click room creation with defaults

3. **Room Preview**
   - Modal showing "Your room will have:"
     - X questions across Y categories
     - Spiciness range: 1-5
     - Estimated play time: ~30 mins

---

### Flow 2: Room Participant (Invited Guest)

#### Current Experience (Broken!)
1. **Receive Invite Link**
   - Friend shares link: `https://secretgame.app/invite/ABC123`

2. **❌ BROKEN:** No `/invite/[code]` route exists
   - Link would 404
   - User must manually navigate to `/rooms/[roomId]`

3. **Room Page**
   - Land directly in room (if they know the roomId)
   - No name prompt (silent user creation)
   - See questions and secrets

4. **Gameplay**
   - Answer questions
   - Unlock secrets

#### Pain Points
- ❌ **Critical:** Invite system doesn't work
- ⚠️ **No onboarding:** First-time users lost
- ⚠️ **No identity:** Don't enter name, cookie-based anonymous user
- ⚠️ **Confusing unlock:** Not explained how it works

#### Proposed Fix (Priority 1)
1. **Create `/app/invite/[code]/page.tsx`**
   - Landing page for invite links
   - Shows room name: "You've been invited to: [Room Name]"
   - Prompts for user name
   - "Join Room" button

2. **User Name Flow**
   - Modal/page: "What's your name?"
   - Text input (required)
   - Submit → creates user with name
   - Sets cookie
   - Redirects to room

3. **First-Time Onboarding**
   - Welcome modal (dismissible)
   - "Here's how it works:"
     - Answer questions honestly
     - Rate your answer's spiciness
     - Unlock secrets by sharing secrets
   - Tooltip on first locked secret: "Share a Level X+ secret to unlock"

---

## Gap Analysis

### 🔴 Critical Gaps (Launch Blockers)

#### 1. Invite System
**Status:** ❌ Broken
**Impact:** Users cannot join rooms
**Fix:** Create `/app/invite/[code]/page.tsx`
**Effort:** 4-6 hours

**Implementation:**
```typescript
// app/invite/[code]/page.tsx
export default async function InvitePage({ params }) {
  const { code } = await params;

  // Fetch room by invite code
  const room = await fetch(`/api/invite/${code}`);

  // Show landing page with:
  // - Room name
  // - Member count
  // - "Join Room" form (name input)

  // On submit:
  // - Create/update user with name
  // - Add to room_members
  // - Redirect to /rooms/[roomId]
}
```

---

#### 2. User Identity Flow
**Status:** ❌ Confusing
**Impact:** Users don't know "who they are"
**Fix:** Name prompt on first room join
**Effort:** 2-3 hours

**Implementation:**
- Check if cookie exists
- If not, show modal: "Enter your name"
- Create user with name
- Set cookie
- Continue to room

---

#### 3. Basic Onboarding
**Status:** ❌ Missing
**Impact:** Users don't understand game mechanics
**Fix:** Welcome tooltip + help text
**Effort:** 2-3 hours

**Implementation:**
- Welcome modal (first visit only)
- Tooltip on first locked secret
- "How to Play" link in header

**Total Critical Path:** 8-12 hours

---

### 🟡 High-Value Gaps (Should Have)

#### 4. Image Upload System
**Status:** ⚠️ Schema ready, UI missing
**Impact:** Limits question creativity
**Fix:** File upload component + display
**Effort:** 12-16 hours

#### 5. Collaborative Question View
**Status:** ❌ Missing
**Impact:** Can't see group consensus
**Fix:** "View All Answers" button + feed
**Effort:** 10-12 hours

#### 6. Question Selection UX
**Status:** ⚠️ Overwhelming
**Impact:** Analysis paralysis for hosts
**Fix:** Preset packs + quick start
**Effort:** 6-8 hours

**Total High-Value:** 28-36 hours

---

### 🟢 Nice-to-Have Gaps (Polish)

#### 7. Multiple Choice Enhancements
**Status:** ⚠️ Partial
**Fix:** Custom options + "who picked what" view
**Effort:** 8-10 hours

#### 8. Real-Time Updates
**Status:** ❌ Missing
**Fix:** 15-second polling
**Effort:** 4-6 hours

#### 9. Answer Management
**Status:** ❌ Missing
**Fix:** Edit/delete buttons
**Effort:** 4-6 hours

#### 10. Question Refresh
**Status:** ⚠️ Manual skip only
**Fix:** "Show 3 new questions" button
**Effort:** 2-3 hours

**Total Nice-to-Have:** 18-25 hours

---

### 🔵 Future Enhancements (V2+)

#### 11. Peer Approval System
**Status:** ❌ Not implemented
**Effort:** 20-30 hours
**Priority:** Low (defer to V2)

#### 12. Person Picker Questions
**Status:** ⚠️ Framework exists
**Effort:** 4-6 hours
**Priority:** Medium (defer to V1.5)

#### 13. Ranking Questions
**Status:** ❌ Not implemented
**Effort:** 16-20 hours
**Priority:** Low (defer to V2)

#### 14. Advanced Analytics
**Status:** ❌ Not implemented
**Effort:** 15-20 hours
**Priority:** Low (defer to V2)

---

## Technical Specifications

### Spec 1: Invite System Implementation

#### Route: `/app/invite/[code]/page.tsx`

**Purpose:** Landing page for invite links

**Flow:**
1. User clicks invite link: `https://app.com/invite/ABC123`
2. Server fetches room by invite code
3. Page displays:
   - Room name
   - Member count
   - Brief description
   - Name input form
4. User submits name
5. API creates/updates user
6. API adds user to room_members
7. Redirects to `/rooms/[roomId]`

**API Endpoint:**
```typescript
// GET /api/invite/[code]
export async function GET(request, { params }) {
  const { code } = await params;

  const room = await mockDb.findRoomByInviteCode(code);
  if (!room) {
    return errorResponse('Invalid invite code', 404);
  }

  const memberCount = await mockDb.countRoomMembers(room.id);

  return successResponse({
    roomId: room.id,
    roomName: room.name,
    memberCount,
    maxMembers: room.maxMembers
  });
}

// POST /api/invite/[code]/join
export async function POST(request, { params }) {
  const { code } = await params;
  const { userName } = await request.json();

  // Validate
  if (!userName?.trim()) {
    return errorResponse('Name required', 400);
  }

  // Find room
  const room = await mockDb.findRoomByInviteCode(code);
  if (!room) {
    return errorResponse('Invalid invite code', 404);
  }

  // Check capacity
  const memberCount = await mockDb.countRoomMembers(room.id);
  if (memberCount >= room.maxMembers) {
    return errorResponse('Room is full', 403);
  }

  // Create or update user
  const userId = getUserIdFromCookies(request) || createId();
  const user = {
    id: userId,
    email: `${userId}@temp.local`,
    name: userName.trim(),
    createdAt: new Date()
  };
  await mockDb.insertUser(user);

  // Add to room
  await mockDb.insertRoomMember({
    roomId: room.id,
    userId,
    joinedAt: new Date()
  });

  // Set cookie
  const response = successResponse({
    roomId: room.id,
    userId
  });
  response.cookies.set('userId', userId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365 // 1 year
  });

  return response;
}
```

**Files to Create:**
- `src/app/invite/[code]/page.tsx` (UI)
- `src/app/api/invite/[code]/route.ts` (GET room info)
- `src/app/api/invite/[code]/join/route.ts` (POST join)

**Acceptance Criteria:**
- [ ] Invite link works: `/invite/ABC123`
- [ ] Shows room name and member count
- [ ] Name input required
- [ ] Validates room capacity (max 20)
- [ ] Creates user with entered name
- [ ] Adds user to room_members
- [ ] Sets userId cookie
- [ ] Redirects to room page
- [ ] Handles invalid codes gracefully

---

### Spec 2: Image Upload Implementation

#### Component: `ImageUploadInput`

**Purpose:** Allow users to upload images as answers

**Features:**
- Drag-and-drop zone
- Click to browse
- Image preview before submit
- File validation (type, size)
- Optional text caption
- Progress indicator

**Data Flow:**
```
User selects image
  → Validate (type: image/*, size: ≤5MB)
  → Convert to base64 (for mock DB)
  → Preview in UI
  → User adds optional caption
  → Submit → Store in answerData
  → Display in SecretAnswerDisplay
```

**Component API:**
```typescript
interface ImageUploadInputProps {
  value: ImageAnswerData | null;
  onChange: (data: ImageAnswerData | null) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

interface ImageAnswerData {
  imageBase64: string;
  caption?: string;
  mimeType: string;
  fileSize: number;
  fileName: string;
}
```

**Implementation:**
```typescript
// src/components/image-upload-input.tsx
export function ImageUploadInput({ value, onChange, maxSizeMB = 5 }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const handleFile = async (file: File) => {
    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      toast.error(`Image must be under ${maxSizeMB}MB`);
      return;
    }

    // Convert to base64
    const base64 = await fileToBase64(file);

    // Update state
    const imageData: ImageAnswerData = {
      imageBase64: base64,
      caption,
      mimeType: file.type,
      fileSize: file.size,
      fileName: file.name
    };

    setPreview(base64);
    onChange(imageData);
  };

  return (
    <div>
      {!preview ? (
        <DragDropZone onFile={handleFile} />
      ) : (
        <>
          <img src={preview} alt="Preview" />
          <Input
            placeholder="Add a caption (optional)"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              if (value) {
                onChange({ ...value, caption: e.target.value });
              }
            }}
          />
          <Button onClick={() => { setPreview(null); onChange(null); }}>
            Remove
          </Button>
        </>
      )}
    </div>
  );
}
```

**Utility Function:**
```typescript
// src/lib/image-utils.ts
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File, maxSizeMB: number): string | null {
  if (!file.type.startsWith('image/')) {
    return 'File must be an image';
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return `Image must be under ${maxSizeMB}MB`;
  }

  return null;
}
```

**Files to Create:**
- `src/components/image-upload-input.tsx`
- `src/components/drag-drop-zone.tsx`
- `src/lib/image-utils.ts`

**Files to Modify:**
- `src/components/question-card.tsx` - add image upload for text questions
- `src/components/secret-answer-display.tsx` - render images

**Acceptance Criteria:**
- [ ] Drag-and-drop works
- [ ] Click to browse works
- [ ] File type validation (images only)
- [ ] Size limit enforced (5MB)
- [ ] Preview shows before submit
- [ ] Caption field optional
- [ ] Base64 stored in answerData
- [ ] Images display in unlocked secrets
- [ ] Loading state during upload

---

## Priority Recommendations

### Phase 1: Critical Path to Launch (Must Ship)
**Effort:** 8-12 hours
**Blockers:** Cannot launch without these

1. Invite system (`/invite/[code]`)
2. User identity flow (name prompt)
3. Basic onboarding (welcome tooltip)

**Why First:**
These are launch blockers. Users literally cannot join rooms right now.

---

### Phase 2: High-Value Features (Should Ship)
**Effort:** 28-36 hours
**Impact:** Significantly improves UX

1. Image upload system
2. Collaborative question view
3. Question selection UX improvements

**Why Second:**
These unlock new use cases (image questions) and reduce friction (better question selection).

---

### Phase 3: UX Polish (Nice to Have)
**Effort:** 18-25 hours
**Impact:** Quality of life improvements

1. Multiple choice enhancements
2. Real-time updates (15s polling)
3. Answer management (edit/delete)
4. Question refresh button

**Why Third:**
These make the experience smoother but aren't critical for initial launch.

---

### Phase 4: Advanced Features (Future)
**Effort:** 40-56 hours
**Impact:** New game mechanics

1. Peer approval system
2. Person picker questions
3. Ranking questions
4. Advanced analytics

**Why Last:**
These are complex systems that should be informed by user feedback from V1.

---

## Terminology Improvements

### Current Terms
- "Unlock" ✓ (clear, good)
- "Submit & Unlock" ✓ (action-oriented)
- "Buyers" ⚠️ (too transactional)

### Recommended Alternatives

**Instead of "payment":**
- ✨ **"Trade secrets"** - Emphasizes reciprocity
- ✨ **"Exchange"** - Neutral, clear
- ✨ **"Match vulnerability"** - Emotional stakes
- ✨ **"Share to unlock"** - Simple, direct

**UI Copy Suggestions:**
```
Current: "Submit a Level 4+ Secret"
Better: "Share a Level 4+ secret to unlock this one"

Current: "Submit & Unlock"
Better: "Trade Secrets" or "Share to Unlock"

Current: "Buyers Count: 5"
Better: "Unlocked by: 5 people"
```

---

## Appendix: File Reference

### Key Files by Feature

**Question Types:**
- `src/lib/questions.ts` - Type definitions and configs
- `src/components/question-card.tsx` - Question display and answering
- `src/components/answer-input-slider.tsx` - Slider input
- `src/components/answer-input-multiple-choice.tsx` - MC input
- `src/components/secret-answer-display.tsx` - Answer rendering

**Room System:**
- `src/app/page.tsx` - Homepage with room creation
- `src/app/rooms/[id]/page.tsx` - Room view
- `src/components/question-selector.tsx` - Question selection UI
- `src/components/custom-question-modal.tsx` - Custom question creation

**Secret System:**
- `src/components/secret-card.tsx` - Secret display
- `src/components/unlock-drawer.tsx` - Unlock UI
- `src/app/api/secrets/route.ts` - Create secret
- `src/app/api/secrets/[id]/unlock/route.ts` - Unlock logic
- `src/app/api/secrets/[id]/rate/route.ts` - Rating logic

**Database:**
- `src/lib/db/mock.ts` - In-memory mock database
- All data structures defined here

**API Routes:**
- `src/app/api/rooms/route.ts` - Create room
- `src/app/api/rooms/[id]/route.ts` - Get room
- `src/app/api/rooms/[id]/questions/route.ts` - Add custom question
- `src/app/api/rooms/[id]/secrets/route.ts` - Get room secrets

---

**End of Document**
