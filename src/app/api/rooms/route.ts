import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "@/lib/auth";
import {
  upsertUser,
  insertRoom,
  insertRoomMember,
  insertRoomQuestion,
  insertSecret,
  findUserRooms,
  isSlugAvailable,
} from "@/lib/db/supabase";
import {
  generateInviteCode,
  errorResponse,
  successResponse,
} from "@/lib/api/helpers";
import { getServerEnv, isProduction } from "@/lib/env";
import { generateSlug, isValidSlug, normalizeSlug } from "@/lib/slug";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from NextAuth session
    const session = await auth();
    let userId = session?.user?.id;
    let isAnonymous = false;

    // If no session, check for existing userId cookie or create new anonymous user
    if (!userId) {
      const cookieStore = request.cookies;
      const existingUserId = cookieStore.get("userId")?.value;

      if (existingUserId) {
        userId = existingUserId;
      } else {
        userId = createId();
        isAnonymous = true;
      }

      // Ensure anonymous user exists in database
      await upsertUser({
        id: userId,
        email: `anon-${userId}@secretgame.local`,
        name: "Anonymous Host",
        avatarUrl: null,
      });
    } else if (session?.user?.email) {
      // Ensure authenticated user exists in database
      await upsertUser({
        id: userId!,
        email: session.user.email,
        name: session.user.name || "Anonymous",
        avatarUrl: session.user.image || null,
      });
    }

    const body = await request.json();
    const {
      name,
      questionIds = [],
      customQuestions = [],
      setupMode = false,
      // New fields for simplified flow
      slug: requestedSlug,
      questionId: singleQuestionId,
      questionText: singleQuestionText,
      answer: creatorAnswer,
      isAnonymous: answerIsAnonymous = false,
    } = body;

    // New simplified flow: single question with answer
    const isSimplifiedFlow = singleQuestionId && creatorAnswer;

    // Validate question selection only if NOT in setup mode and NOT simplified flow
    if (!setupMode && !isSimplifiedFlow) {
      const totalQuestions = questionIds.length + customQuestions.length;
      if (totalQuestions < 1) {
        return errorResponse("At least 1 question must be selected");
      }
    }

    // Create room
    const roomId = createId();
    const inviteCode = generateInviteCode();

    // Handle slug - normalize, validate, and check availability
    let finalSlug: string | null = null;
    if (requestedSlug) {
      const normalized = normalizeSlug(requestedSlug);
      if (!isValidSlug(normalized)) {
        return errorResponse(
          "Invalid slug format. Use 3-50 lowercase letters, numbers, and hyphens.",
        );
      }
      const available = await isSlugAvailable(normalized);
      if (!available) {
        return errorResponse(
          "This URL is already taken. Please choose another.",
        );
      }
      finalSlug = normalized;
    } else {
      // Auto-generate a unique slug
      let attempts = 0;
      while (!finalSlug && attempts < 5) {
        const candidate = generateSlug();
        if (await isSlugAvailable(candidate)) {
          finalSlug = candidate;
        }
        attempts++;
      }
      // If all attempts fail, use inviteCode as fallback
      if (!finalSlug) {
        finalSlug = inviteCode.toLowerCase();
      }
    }

    // Auto-generate room name if not provided
    const roomName = name || `Room ${inviteCode.slice(0, 6)}`;

    // Insert room into Supabase
    await insertRoom({
      id: roomId,
      name: roomName,
      ownerId: userId,
      inviteCode,
      slug: finalSlug,
      maxMembers: 20,
      setupMode: isSimplifiedFlow ? false : setupMode, // Never setup mode for simplified flow
      isAnonymous: false, // Room-level anonymous mode - off by default
    });

    // Add owner as first member
    await insertRoomMember({
      roomId,
      userId,
    });

    // Handle simplified flow: single question with creator's answer
    let roomQuestionId: string | null = null;
    if (isSimplifiedFlow) {
      // Create the room question
      roomQuestionId = createId();
      await insertRoomQuestion({
        id: roomQuestionId,
        roomId,
        questionId: singleQuestionId, // Reference to curated question
        question: singleQuestionText || null, // Store question text for display
        category: null,
        suggestedLevel: null,
        difficulty: null,
        questionType: "text",
        answerConfig: null,
        allowAnonymous: true, // Allow anonymous answers
        createdBy: null,
        displayOrder: 0,
      });

      // Create the creator's first secret (answer)
      const secretId = createId();
      await insertSecret({
        id: secretId,
        roomId,
        questionId: roomQuestionId,
        authorId: userId,
        body: creatorAnswer,
        selfRating: 3, // Default spiciness
        importance: 3,
        avgRating: null,
        buyersCount: 0,
        isHidden: false,
        isAnonymous: answerIsAnonymous,
        answerType: "text",
        answerData: null,
      });
    } else {
      // Process and insert selected questions from data/questions.md
      for (let i = 0; i < questionIds.length; i++) {
        await insertRoomQuestion({
          id: createId(),
          roomId,
          questionId: questionIds[i], // Reference to curated question
          question: null, // Will be resolved from questionId
          category: null,
          suggestedLevel: null,
          difficulty: null,
          questionType: "text",
          answerConfig: null,
          allowAnonymous: false,
          createdBy: null, // Curated question, no specific creator
          displayOrder: i,
        });
      }

      // Process and insert custom questions
      for (let i = 0; i < customQuestions.length; i++) {
        const q = customQuestions[i];
        await insertRoomQuestion({
          id: q.id || createId(),
          roomId,
          questionId: null, // Custom question, not from curated list
          question: q.question,
          category: q.category || "Custom",
          suggestedLevel: q.suggestedLevel || 3,
          difficulty: q.difficulty || "medium",
          questionType: q.questionType || "text",
          answerConfig: q.answerConfig || null,
          allowAnonymous: q.allowAnonymous || false,
          createdBy: userId,
          displayOrder: questionIds.length + i,
        });
      }
    }

    const inviteUrl = `${getServerEnv().NEXTAUTH_URL}/invite/${inviteCode}`;
    const slugUrl = finalSlug
      ? `${getServerEnv().NEXTAUTH_URL}/${finalSlug}`
      : null;

    const response = successResponse({
      roomId,
      inviteCode,
      inviteUrl,
      slug: finalSlug,
      slugUrl,
      name: roomName,
      isAnonymous,
      userId,
    });

    // Set userId cookie if it's a new anonymous user or we're using an existing one
    // httpOnly: true for security (client gets userId from API responses instead)
    if (!session?.user?.id) {
      response.cookies.set("userId", userId, {
        httpOnly: true,
        secure: isProduction(),
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      });
    }

    return response;
  } catch {
    return errorResponse("Failed to create room", 500);
  }
}

// GET /api/rooms - Get user's rooms
export async function GET() {
  try {
    // Get authenticated user from NextAuth session
    const session = await auth();

    if (!session?.user?.id) {
      return successResponse({ rooms: [] });
    }

    const userRooms = await findUserRooms(session.user.id);

    return successResponse({ rooms: userRooms });
  } catch {
    return errorResponse("Failed to get rooms", 500);
  }
}
