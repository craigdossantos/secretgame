# User Flow Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the app to start with picking a question immediately, defer authentication to sharing/reveal time, and use custom URL slugs for rooms.

**Architecture:** Single-page step-by-step card flow on homepage (pick → answer → auth → share). Custom slug routing (`/[slug]`) replaces room ID routes. Answers unlock automatically when users submit (simplified V1 unlock logic). LocalStorage holds pending answers pre-auth.

**Tech Stack:** Next.js 15 App Router, NextAuth.js (already configured with Google), Drizzle ORM + Supabase, Tailwind CSS, Framer Motion

---

## Task 1: Add Slug Column to Database Schema

**Files:**

- Modify: `src/lib/db/schema.ts:25-35`
- Modify: `src/lib/db/supabase.ts` (add findRoomBySlug)

**Step 1: Write the failing test**

Create a simple test file to verify slug functionality:

```typescript
// tests/unit/slug.test.ts
import { describe, test, expect } from "vitest";
import { generateSlug, isValidSlug } from "@/lib/slug";

describe("Slug utilities", () => {
  test("generateSlug creates URL-safe random slug", () => {
    const slug = generateSlug();
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.length).toBeGreaterThanOrEqual(6);
  });

  test("isValidSlug rejects invalid characters", () => {
    expect(isValidSlug("valid-slug")).toBe(true);
    expect(isValidSlug("UPPERCASE")).toBe(false);
    expect(isValidSlug("has spaces")).toBe(false);
    expect(isValidSlug("special@chars!")).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit tests/unit/slug.test.ts`
Expected: FAIL - module not found

**Step 3: Create slug utility module**

```typescript
// src/lib/slug.ts
import { createId } from "@paralleldrive/cuid2";

/**
 * Generate a random URL-safe slug
 * Format: adjective-noun-4chars (e.g., "happy-tiger-x7k2")
 */
export function generateSlug(): string {
  const id = createId().slice(0, 8).toLowerCase();
  return id;
}

/**
 * Validate a custom slug
 * Rules: lowercase, alphanumeric, hyphens only, 3-50 chars
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 50) return false;
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug);
}

/**
 * Normalize a user-provided slug
 * Converts to lowercase, replaces spaces with hyphens, removes invalid chars
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
```

**Step 4: Update database schema**

```typescript
// src/lib/db/schema.ts - add to rooms table
export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  slug: varchar("slug", { length: 50 }).unique(), // NEW: custom URL slug
  name: varchar("name", { length: 255 }),
  ownerId: text("owner_id")
    .references(() => users.id)
    .notNull(),
  inviteCode: varchar("invite_code", { length: 20 }).unique().notNull(),
  maxMembers: integer("max_members").default(20).notNull(),
  setupMode: boolean("setup_mode").default(true),
  isAnonymous: boolean("is_anonymous").default(false), // NEW: anonymous mode
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Step 5: Add findRoomBySlug to supabase.ts**

```typescript
// src/lib/db/supabase.ts - add new function
export async function findRoomBySlug(slug: string): Promise<Room | undefined> {
  const result = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.slug, slug))
    .limit(1);
  return result[0];
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await findRoomBySlug(slug);
  return !existing;
}
```

**Step 6: Run test to verify it passes**

Run: `npm run test:unit tests/unit/slug.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add src/lib/slug.ts src/lib/db/schema.ts src/lib/db/supabase.ts tests/unit/slug.test.ts
git commit -m "feat: add slug support for room URLs"
```

---

## Task 2: Create Pending Answer Hook

**Files:**

- Create: `src/hooks/use-pending-answer.ts`

**Step 1: Write the hook**

```typescript
// src/hooks/use-pending-answer.ts
"use client";

import { useState, useEffect, useCallback } from "react";

interface PendingAnswer {
  questionId: string;
  questionText: string;
  answer: string;
  isAnonymous: boolean;
  slug?: string;
  createdAt: number;
}

const STORAGE_KEY = "secretgame_pending_answer";
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export function usePendingAnswer() {
  const [pending, setPending] = useState<PendingAnswer | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PendingAnswer;
        // Check if expired
        if (Date.now() - parsed.createdAt < EXPIRY_MS) {
          setPending(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const savePending = useCallback(
    (answer: Omit<PendingAnswer, "createdAt">) => {
      const withTimestamp = { ...answer, createdAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
      setPending(withTimestamp);
    },
    [],
  );

  const clearPending = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPending(null);
  }, []);

  const getPending = useCallback((): PendingAnswer | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PendingAnswer;
        if (Date.now() - parsed.createdAt < EXPIRY_MS) {
          return parsed;
        }
      }
    } catch {
      // Ignore errors
    }
    return null;
  }, []);

  return { pending, savePending, clearPending, getPending };
}
```

**Step 2: Commit**

```bash
git add src/hooks/use-pending-answer.ts
git commit -m "feat: add usePendingAnswer hook for pre-auth answer storage"
```

---

## Task 3: Create Auth Button Component

**Files:**

- Create: `src/components/auth-button.tsx`

**Step 1: Write the component**

```typescript
// src/components/auth-button.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, LogOut, Loader2 } from "lucide-react";

interface AuthButtonProps {
  onSignInClick?: () => void;
  variant?: "default" | "minimal" | "cta";
  ctaText?: string;
}

export function AuthButton({
  onSignInClick,
  variant = "default",
  ctaText = "Sign in with Google"
}: AuthButtonProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {variant !== "minimal" && (
          <Avatar className="w-8 h-8">
            {session.user.image && (
              <AvatarImage src={session.user.image} alt={session.user.name || ""} />
            )}
            <AvatarFallback>
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        )}
        {variant === "default" && (
          <span className="text-sm">{session.user.name}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  const handleClick = () => {
    if (onSignInClick) {
      onSignInClick();
    }
    signIn("google");
  };

  if (variant === "cta") {
    return (
      <Button onClick={handleClick} size="lg" className="gap-2">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {ctaText}
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleClick} className="gap-2">
      <LogIn className="w-4 h-4" />
      Sign in
    </Button>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/auth-button.tsx
git commit -m "feat: add AuthButton component with Google OAuth"
```

---

## Task 4: Create Question Grid Component

**Files:**

- Create: `src/components/question-grid.tsx`

**Step 1: Write the component**

```typescript
// src/components/question-grid.tsx
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { QuestionPrompt, QUESTION_CATEGORIES } from "@/lib/questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

interface QuestionGridProps {
  questions: QuestionPrompt[];
  onSelectQuestion: (question: QuestionPrompt) => void;
  onCreateCustom: () => void;
}

export function QuestionGrid({
  questions,
  onSelectQuestion,
  onCreateCustom
}: QuestionGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredQuestions = useMemo(() => {
    if (!selectedCategory) return questions;
    return questions.filter(q => q.category === selectedCategory);
  }, [questions, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {QUESTION_CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Question cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Custom question card */}
        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateCustom}
          className="p-5 rounded-xl border-2 border-dashed border-muted-foreground/30
                     hover:border-primary/50 transition-colors text-left h-full min-h-[120px]
                     flex flex-col items-center justify-center gap-2"
        >
          <PenLine className="w-6 h-6 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Write your own question</span>
        </motion.button>

        {/* Question cards */}
        {filteredQuestions.map((question, index) => (
          <motion.button
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectQuestion(question)}
            className="p-5 rounded-xl bg-card border border-border hover:border-primary/50
                       shadow-sm hover:shadow-md transition-all text-left h-full min-h-[120px]"
          >
            <p className="text-foreground font-medium mb-3 line-clamp-3">
              {question.question}
            </p>
            <div className="flex items-center gap-2 mt-auto">
              <Badge variant="outline" className="text-xs">
                {question.category}
              </Badge>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/question-grid.tsx
git commit -m "feat: add QuestionGrid component for question selection"
```

---

## Task 5: Create Answer Form Component

**Files:**

- Create: `src/components/answer-form.tsx`

**Step 1: Write the component**

```typescript
// src/components/answer-form.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QuestionPrompt } from "@/lib/questions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

interface AnswerFormProps {
  question: QuestionPrompt;
  onSubmit: (answer: string, isAnonymous: boolean) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function AnswerForm({
  question,
  onSubmit,
  onBack,
  isSubmitting = false
}: AnswerFormProps) {
  const [answer, setAnswer] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const isValid = answer.trim().length > 0 && wordCount <= 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isSubmitting) {
      onSubmit(answer, isAnonymous);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Pick different question
      </Button>

      {/* Question display */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <p className="text-xl font-medium text-foreground">
          {question.question}
        </p>
      </div>

      {/* Answer form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="answer">Your answer</Label>
          <Textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Be honest! The best answers are authentic.</span>
            <span className={wordCount > 100 ? "text-destructive" : ""}>
              {wordCount}/100 words
            </span>
          </div>
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            disabled={isSubmitting}
          />
          <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
            Make all answers anonymous
          </Label>
        </div>

        {/* Submit button */}
        <div className="space-y-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Get your friends' answers"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            They only see yours once they answer
          </p>
        </div>
      </form>
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/answer-form.tsx
git commit -m "feat: add AnswerForm component with anonymous toggle"
```

---

## Task 6: Create Share Screen Component

**Files:**

- Create: `src/components/share-screen.tsx`

**Step 1: Write the component**

```typescript
// src/components/share-screen.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Share2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { normalizeSlug, isValidSlug } from "@/lib/slug";

interface ShareScreenProps {
  roomSlug: string;
  questionText: string;
  participantCount: number;
  onSlugChange?: (newSlug: string) => Promise<boolean>;
}

export function ShareScreen({
  roomSlug,
  questionText,
  participantCount,
  onSlugChange
}: ShareScreenProps) {
  const [slug, setSlug] = useState(roomSlug);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : '';
  const fullUrl = `${baseUrl}/${slug}`;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [fullUrl]);

  const handleSlugChange = (value: string) => {
    const normalized = normalizeSlug(value);
    setSlug(normalized);
  };

  const handleSlugBlur = async () => {
    if (slug === roomSlug) {
      setIsEditing(false);
      return;
    }

    if (!isValidSlug(slug)) {
      toast.error("Invalid slug. Use lowercase letters, numbers, and hyphens.");
      setSlug(roomSlug);
      setIsEditing(false);
      return;
    }

    if (onSlugChange) {
      setIsSaving(true);
      const success = await onSlugChange(slug);
      setIsSaving(false);

      if (success) {
        copyToClipboard();
        setIsEditing(false);
      } else {
        toast.error("This URL is already taken");
        setSlug(roomSlug);
      }
    }
    setIsEditing(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Secret Game",
          text: questionText,
          url: fullUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30
                        flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Your answer is saved!</h2>
        <p className="text-muted-foreground mt-1">
          Share this link to get your friends&apos; answers
        </p>
      </div>

      {/* Question reminder */}
      <div className="p-4 rounded-lg bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">Your question:</p>
        <p className="font-medium mt-1">{questionText}</p>
      </div>

      {/* Share URL */}
      <div className="space-y-2">
        <Label>Your invite link</Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {baseUrl}/
            </span>
            <Input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onFocus={() => setIsEditing(true)}
              onBlur={handleSlugBlur}
              className="pl-[calc(theme(spacing.3)+var(--base-url-width,100px))]"
              style={{
                '--base-url-width': `${baseUrl.length * 0.55}em`
              } as React.CSSProperties}
              disabled={isSaving}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            disabled={isSaving}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Click to edit • Changes auto-copy to clipboard
        </p>
      </div>

      {/* Share button */}
      <Button onClick={handleShare} size="lg" className="w-full gap-2">
        <Share2 className="w-5 h-5" />
        Share with friends
      </Button>

      {/* Waiting indicator */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>
          {participantCount === 1
            ? "Waiting for friends to answer..."
            : `${participantCount} people have answered`}
        </span>
      </div>
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/share-screen.tsx
git commit -m "feat: add ShareScreen component with editable slug"
```

---

## Task 7: Update Room Creation API

**Files:**

- Modify: `src/app/api/rooms/route.ts`

**Step 1: Update the POST handler**

Add slug generation and handling:

```typescript
// src/app/api/rooms/route.ts
import { generateSlug, isValidSlug } from "@/lib/slug";
import { findRoomBySlug } from "@/lib/db/supabase";

// In POST handler, after creating roomId:
let slug = body.slug;

// Validate or generate slug
if (slug) {
  if (!isValidSlug(slug)) {
    return errorResponse("Invalid slug format");
  }
  const existingBySlug = await findRoomBySlug(slug);
  if (existingBySlug) {
    return errorResponse("This URL is already taken");
  }
} else {
  // Generate unique slug
  slug = generateSlug();
  let attempts = 0;
  while ((await findRoomBySlug(slug)) && attempts < 5) {
    slug = generateSlug();
    attempts++;
  }
}

// Update room insertion to include slug and isAnonymous
await insertRoom({
  id: roomId,
  slug,
  name: roomName,
  ownerId: userId,
  inviteCode,
  maxMembers: 20,
  setupMode: false, // V2: rooms are immediately playable
  isAnonymous: body.isAnonymous || false,
});

// Update response to include slug
const response = successResponse({
  roomId,
  slug,
  inviteCode,
  inviteUrl: `${getServerEnv().NEXTAUTH_URL}/${slug}`,
  name: roomName,
  isAnonymous,
  userId,
});
```

**Step 2: Add PATCH endpoint for slug updates**

```typescript
// src/app/api/rooms/[slug]/route.ts (new file)
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { findRoomBySlug, updateRoom } from "@/lib/db/supabase";
import { isValidSlug } from "@/lib/slug";
import { errorResponse, successResponse } from "@/lib/api/helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const room = await findRoomBySlug(slug);
  if (!room) {
    return errorResponse("Room not found", 404);
  }

  // Fetch additional data...
  return successResponse({ room });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse("Unauthorized", 401);
  }

  const { slug } = await params;
  const body = await request.json();

  const room = await findRoomBySlug(slug);
  if (!room) {
    return errorResponse("Room not found", 404);
  }

  if (room.ownerId !== session.user.id) {
    return errorResponse("Not authorized", 403);
  }

  // Handle slug change
  if (body.newSlug && body.newSlug !== slug) {
    if (!isValidSlug(body.newSlug)) {
      return errorResponse("Invalid slug format");
    }
    const existing = await findRoomBySlug(body.newSlug);
    if (existing) {
      return errorResponse("URL already taken");
    }
    await updateRoom(room.id, { slug: body.newSlug });
    return successResponse({ slug: body.newSlug });
  }

  return successResponse({ room });
}
```

**Step 3: Commit**

```bash
git add src/app/api/rooms/route.ts src/app/api/rooms/[slug]/route.ts
git commit -m "feat: add slug support to room creation and update APIs"
```

---

## Task 8: Create New Homepage

**Files:**

- Modify: `src/app/page.tsx` (complete rewrite)

**Step 1: Write the new homepage**

```typescript
// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { QuestionGrid } from "@/components/question-grid";
import { AnswerForm } from "@/components/answer-form";
import { ShareScreen } from "@/components/share-screen";
import { AuthButton } from "@/components/auth-button";
import { usePendingAnswer } from "@/hooks/use-pending-answer";
import { QuestionPrompt, mockQuestions } from "@/lib/questions";

type FlowStep = "pick" | "answer" | "auth" | "share";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { pending, savePending, clearPending, getPending } = usePendingAnswer();

  const [step, setStep] = useState<FlowStep>("pick");
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionPrompt | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [roomSlug, setRoomSlug] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for pending answer after auth
  useEffect(() => {
    if (status === "authenticated" && step === "auth") {
      const pendingAnswer = getPending();
      if (pendingAnswer) {
        submitAnswer(pendingAnswer.answer, pendingAnswer.isAnonymous, pendingAnswer.questionId, pendingAnswer.questionText);
      }
    }
  }, [status, step]);

  const handleSelectQuestion = (question: QuestionPrompt) => {
    setSelectedQuestion(question);
    setStep("answer");
  };

  const handleCreateCustom = () => {
    // TODO: Implement custom question modal
    toast.info("Custom questions coming soon!");
  };

  const handleAnswerSubmit = async (answer: string, anonymous: boolean) => {
    if (!selectedQuestion) return;

    setIsAnonymous(anonymous);

    if (!session?.user) {
      // Save to localStorage and trigger auth
      savePending({
        questionId: selectedQuestion.id,
        questionText: selectedQuestion.question,
        answer,
        isAnonymous: anonymous,
      });
      setStep("auth");
      signIn("google");
      return;
    }

    await submitAnswer(answer, anonymous, selectedQuestion.id, selectedQuestion.question);
  };

  const submitAnswer = async (
    answer: string,
    anonymous: boolean,
    questionId: string,
    questionText: string
  ) => {
    setIsSubmitting(true);

    try {
      // Create room with first question and answer
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          questionText,
          answer,
          isAnonymous: anonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create room");
        setIsSubmitting(false);
        return;
      }

      clearPending();
      setRoomSlug(data.slug);
      setStep("share");
    } catch (error) {
      console.error("Failed to submit:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlugChange = async (newSlug: string): Promise<boolean> => {
    if (!roomSlug) return false;

    try {
      const response = await fetch(`/api/rooms/${roomSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newSlug }),
      });

      if (response.ok) {
        setRoomSlug(newSlug);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with auth */}
      <header className="fixed top-0 right-0 p-4 z-50">
        <AuthButton variant="minimal" />
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">The Secret Game</h1>
          <p className="text-lg text-muted-foreground">
            {step === "pick" && "Pick a question to ask your friends"}
            {step === "answer" && "Answer first, then share"}
            {step === "auth" && "Sign in to save your answer"}
            {step === "share" && "Share with your friends"}
          </p>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === "pick" && (
            <motion.div
              key="pick"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <QuestionGrid
                questions={mockQuestions}
                onSelectQuestion={handleSelectQuestion}
                onCreateCustom={handleCreateCustom}
              />
            </motion.div>
          )}

          {step === "answer" && selectedQuestion && (
            <motion.div
              key="answer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnswerForm
                question={selectedQuestion}
                onSubmit={handleAnswerSubmit}
                onBack={() => {
                  setSelectedQuestion(null);
                  setStep("pick");
                }}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}

          {step === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="mb-6">Sign in to save your answer and get your share link</p>
              <AuthButton variant="cta" ctaText="Continue with Google" />
            </motion.div>
          )}

          {step === "share" && roomSlug && selectedQuestion && (
            <motion.div
              key="share"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShareScreen
                roomSlug={roomSlug}
                questionText={selectedQuestion.question}
                participantCount={1}
                onSlugChange={handleSlugChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rewrite homepage with question-first flow"
```

---

## Task 9: Create Room Page (Joiner Flow)

**Files:**

- Create: `src/app/[slug]/page.tsx`
- Create: `src/components/participant-list.tsx`
- Create: `src/components/answers-feed.tsx`

**Step 1: Create participant list component**

```typescript
// src/components/participant-list.tsx
"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string | null;
  hasAnswered: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
  isAnonymous: boolean;
}

export function ParticipantList({ participants, isAnonymous }: ParticipantListProps) {
  const answeredCount = participants.filter(p => p.hasAnswered).length;

  if (isAnonymous) {
    return (
      <div className="text-center text-muted-foreground">
        {answeredCount} {answeredCount === 1 ? 'person has' : 'people have'} answered
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        {answeredCount} {answeredCount === 1 ? 'person has' : 'people have'} answered
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {participants.filter(p => p.hasAnswered).map((participant) => (
          <div key={participant.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
            <Avatar className="w-6 h-6">
              {participant.avatarUrl && (
                <AvatarImage src={participant.avatarUrl} alt={participant.name} />
              )}
              <AvatarFallback className="text-xs">
                {participant.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{participant.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Create answers feed component**

```typescript
// src/components/answers-feed.tsx
"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Answer {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  createdAt: string;
}

interface AnswersFeedProps {
  answers: Answer[];
  isAnonymous: boolean;
  currentUserId?: string;
}

export function AnswersFeed({ answers, isAnonymous, currentUserId }: AnswersFeedProps) {
  return (
    <div className="space-y-4">
      {answers.map((answer, index) => (
        <motion.div
          key={answer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          {/* Author header */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              {!isAnonymous && answer.authorAvatar && (
                <AvatarImage src={answer.authorAvatar} alt={answer.authorName} />
              )}
              <AvatarFallback>
                {isAnonymous ? "?" : answer.authorName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {isAnonymous
                  ? "Anonymous"
                  : answer.authorId === currentUserId
                    ? "You"
                    : answer.authorName}
              </p>
            </div>
          </div>

          {/* Answer content */}
          <p className="text-foreground">{answer.body}</p>
        </motion.div>
      ))}
    </div>
  );
}
```

**Step 3: Create room page**

```typescript
// src/app/[slug]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { notFound } from "next/navigation";

import { AnswerForm } from "@/components/answer-form";
import { ParticipantList } from "@/components/participant-list";
import { AnswersFeed } from "@/components/answers-feed";
import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { usePendingAnswer } from "@/hooks/use-pending-answer";
import { QuestionPrompt } from "@/lib/questions";
import { PlusCircle } from "lucide-react";

type FlowStep = "view" | "answer" | "auth" | "reveal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function RoomPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data: session, status } = useSession();
  const { savePending, clearPending, getPending } = usePendingAnswer();

  const [step, setStep] = useState<FlowStep>("view");
  const [room, setRoom] = useState<any>(null);
  const [question, setQuestion] = useState<QuestionPrompt | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch room data
  useEffect(() => {
    async function fetchRoom() {
      try {
        const response = await fetch(`/api/rooms/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error("Failed to fetch room");
        }
        const data = await response.json();
        setRoom(data.room);
        setQuestion(data.question);
        setParticipants(data.participants || []);
        setAnswers(data.answers || []);

        // Check if current user has answered
        if (session?.user?.id) {
          const userAnswer = data.answers?.find(
            (a: any) => a.authorId === session.user?.id
          );
          if (userAnswer) {
            setHasAnswered(true);
            setStep("reveal");
          }
        }
      } catch (error) {
        console.error("Failed to fetch room:", error);
        toast.error("Failed to load room");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoom();
  }, [slug, session]);

  // Handle post-auth answer submission
  useEffect(() => {
    if (status === "authenticated" && step === "auth") {
      const pendingAnswer = getPending();
      if (pendingAnswer && pendingAnswer.slug === slug) {
        submitAnswer(pendingAnswer.answer);
      }
    }
  }, [status, step, slug]);

  const handleAnswerSubmit = async (answer: string, anonymous: boolean) => {
    if (!session?.user) {
      savePending({
        questionId: question?.id || "",
        questionText: question?.question || "",
        answer,
        isAnonymous: anonymous,
        slug,
      });
      setStep("auth");
      signIn("google");
      return;
    }
    await submitAnswer(answer);
  };

  const submitAnswer = async (answer: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/rooms/${slug}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to submit answer");
        return;
      }

      clearPending();
      setHasAnswered(true);

      // Refresh answers
      const roomResponse = await fetch(`/api/rooms/${slug}`);
      const roomData = await roomResponse.json();
      setAnswers(roomData.answers || []);
      setParticipants(roomData.participants || []);

      setStep("reveal");
    } catch (error) {
      console.error("Failed to submit:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!room || !question) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 right-0 p-4 z-50">
        <AuthButton variant="minimal" />
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-12">
        {/* Question */}
        <div className="p-6 rounded-xl bg-card border border-border mb-8">
          <p className="text-xl font-medium text-center">{question.question}</p>
        </div>

        <AnimatePresence mode="wait">
          {(step === "view" || step === "answer") && !hasAnswered && (
            <motion.div
              key="answer-flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Who has answered */}
              <ParticipantList
                participants={participants}
                isAnonymous={room.isAnonymous}
              />

              {/* Answer form */}
              <AnswerForm
                question={question}
                onSubmit={handleAnswerSubmit}
                onBack={() => {}}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}

          {step === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="mb-6">Sign in to see everyone&apos;s answers</p>
              <AuthButton variant="cta" ctaText="Continue with Google" />
            </motion.div>
          )}

          {step === "reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Answers */}
              <AnswersFeed
                answers={answers}
                isAnonymous={room.isAnonymous}
                currentUserId={session?.user?.id}
              />

              {/* Ask another question CTA */}
              <div className="text-center pt-8">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => {
                    // TODO: Navigate to question picker for this room
                    toast.info("Adding more questions coming soon!");
                  }}
                >
                  <PlusCircle className="w-5 h-5" />
                  Now ask YOUR question
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Pick a question and get their answers
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/[slug]/page.tsx src/components/participant-list.tsx src/components/answers-feed.tsx
git commit -m "feat: add room page with joiner flow and answer reveal"
```

---

## Task 10: Create Room Answers API

**Files:**

- Create: `src/app/api/rooms/[slug]/answers/route.ts`

**Step 1: Write the API route**

```typescript
// src/app/api/rooms/[slug]/answers/route.ts
import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "@/lib/auth";
import {
  findRoomBySlug,
  findRoomQuestions,
  insertSecret,
  insertRoomMember,
  findRoomMember,
  findSecretsByQuestionId,
  findUserById,
} from "@/lib/db/supabase";
import { errorResponse, successResponse } from "@/lib/api/helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse("Unauthorized", 401);
  }

  const { slug } = await params;
  const { answer } = await request.json();

  if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
    return errorResponse("Answer is required");
  }

  const wordCount = answer.trim().split(/\s+/).length;
  if (wordCount > 100) {
    return errorResponse("Answer must be 100 words or less");
  }

  const room = await findRoomBySlug(slug);
  if (!room) {
    return errorResponse("Room not found", 404);
  }

  // Get the question for this room
  const questions = await findRoomQuestions(room.id);
  if (questions.length === 0) {
    return errorResponse("No question in this room");
  }
  const question = questions[0]; // For V1, rooms have one question

  // Check if user already answered
  const existingAnswers = await findSecretsByQuestionId(question.id);
  const userAlreadyAnswered = existingAnswers.some(
    (s) => s.authorId === session.user?.id,
  );
  if (userAlreadyAnswered) {
    return errorResponse("You have already answered this question");
  }

  // Add user as room member if not already
  const existingMember = await findRoomMember(room.id, session.user.id);
  if (!existingMember) {
    await insertRoomMember({ roomId: room.id, userId: session.user.id });
  }

  // Create the answer (stored as a "secret" in current schema)
  await insertSecret({
    id: createId(),
    roomId: room.id,
    authorId: session.user.id,
    questionId: question.id,
    body: answer.trim(),
    selfRating: 3, // Default for V1
    importance: 3,
    buyersCount: 0,
    isHidden: false,
    isAnonymous: room.isAnonymous,
    answerType: "text",
  });

  return successResponse({ success: true });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  const { slug } = await params;

  const room = await findRoomBySlug(slug);
  if (!room) {
    return errorResponse("Room not found", 404);
  }

  const questions = await findRoomQuestions(room.id);
  if (questions.length === 0) {
    return successResponse({ answers: [] });
  }

  const question = questions[0];
  const secrets = await findSecretsByQuestionId(question.id);

  // For V1: If user has answered, they can see all answers
  // Otherwise, only see participant count
  const userHasAnswered = session?.user?.id
    ? secrets.some((s) => s.authorId === session.user?.id)
    : false;

  if (!userHasAnswered) {
    return successResponse({
      answers: [],
      answerCount: secrets.length,
    });
  }

  // Fetch author info for each answer
  const answersWithAuthors = await Promise.all(
    secrets.map(async (secret) => {
      const author = await findUserById(secret.authorId);
      return {
        id: secret.id,
        body: secret.body,
        authorId: secret.authorId,
        authorName: room.isAnonymous ? "Anonymous" : author?.name || "Unknown",
        authorAvatar: room.isAnonymous ? null : author?.avatarUrl || null,
        createdAt: secret.createdAt.toISOString(),
      };
    }),
  );

  return successResponse({ answers: answersWithAuthors });
}
```

**Step 2: Commit**

```bash
git add src/app/api/rooms/[slug]/answers/route.ts
git commit -m "feat: add answers API for room participation"
```

---

## Task 11: Wrap App with SessionProvider

**Files:**

- Modify: `src/app/layout.tsx`

**Step 1: Add SessionProvider**

```typescript
// src/app/layout.tsx
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {/* existing providers */}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add SessionProvider for client-side auth"
```

---

## Task 12: Run Build and Fix Errors

**Step 1: Run build**

Run: `npm run build`

**Step 2: Fix any TypeScript errors**

Address any errors that appear in the build output.

**Step 3: Run lint**

Run: `npm run lint`

**Step 4: Fix any lint errors**

**Step 5: Commit fixes**

```bash
git add .
git commit -m "fix: resolve build and lint errors"
```

---

## Task 13: Manual End-to-End Testing

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test creator flow**

1. Open http://localhost:3000
2. Pick a question from the grid
3. Type an answer
4. Click "Get your friends' answers"
5. Sign in with Google
6. Verify share screen appears with editable slug
7. Copy the share link

**Step 3: Test joiner flow**

1. Open the share link in an incognito window
2. Verify question and participant count appear
3. Type an answer
4. Sign in with Google
5. Verify all answers are revealed
6. Verify "Ask YOUR question" CTA appears

**Step 4: Test edge cases**

1. Test duplicate slug validation
2. Test slug editing and auto-copy
3. Test mobile viewport
4. Test anonymous mode

---

## Task 14: Update E2E Tests

**Files:**

- Modify: `tests/e2e/*.spec.ts`

**Step 1: Update homepage tests**

```typescript
// tests/e2e/homepage.spec.ts
import { test, expect } from "@playwright/test";

test("creator can pick question and answer", async ({ page }) => {
  await page.goto("/");

  // Should see question grid
  await expect(page.locator("text=Pick a question")).toBeVisible();

  // Click a question
  await page.locator('[data-testid="question-card"]').first().click();

  // Should see answer form
  await expect(page.locator("text=Your answer")).toBeVisible();

  // Type answer
  await page.fill("textarea", "This is my test answer");

  // Submit should trigger auth
  await page.click("text=Get your friends");

  // Should redirect to Google auth (or show auth prompt)
  await expect(page.locator("text=Sign in")).toBeVisible();
});
```

**Step 2: Commit**

```bash
git add tests/e2e/
git commit -m "test: update E2E tests for new user flow"
```

---

## Verification Plan

### Manual Verification Checklist

1. **Creator Flow**
   - [ ] Homepage shows question grid
   - [ ] Clicking question shows answer form
   - [ ] Submitting answer triggers Google auth
   - [ ] After auth, share screen appears
   - [ ] Slug is editable and auto-copies
   - [ ] Share button works (native share on mobile, copy on desktop)

2. **Joiner Flow**
   - [ ] Opening slug URL shows question and participant count
   - [ ] Answer form appears for new users
   - [ ] Submitting triggers auth
   - [ ] After auth, all answers are revealed
   - [ ] "Ask your question" CTA appears

3. **Edge Cases**
   - [ ] Anonymous mode hides names
   - [ ] Duplicate slug shows error
   - [ ] Invalid slug format rejected
   - [ ] Session persists across page refreshes
   - [ ] Pending answer survives OAuth redirect

### Automated Verification

```bash
# TypeScript + ESLint
npm run build
npm run lint

# E2E tests
npm run test:e2e
```

---

## Summary

**Total Tasks:** 14
**Estimated Time:** 4-6 hours

**Key Decisions:**

- Slug stored in `rooms` table, indexed and unique
- Pending answers stored in localStorage with 30-min expiry
- V1 unlock logic: answering = unlocking (spiciness mechanics deferred)
- Room isAnonymous flag controls name visibility
- Single question per room for V1 (multi-question in V2)
