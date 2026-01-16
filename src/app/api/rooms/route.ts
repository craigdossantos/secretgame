import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "@/lib/auth";
import {
  upsertUser,
  insertRoom,
  insertRoomMember,
  insertRoomQuestion,
  findUserRooms,
} from "@/lib/db/supabase";
import {
  generateInviteCode,
  errorResponse,
  successResponse,
} from "@/lib/api/helpers";
import { getServerEnv, isProduction } from "@/lib/env";

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
    } = body;

    // Validate question selection only if NOT in setup mode
    if (!setupMode) {
      const totalQuestions = questionIds.length + customQuestions.length;
      if (totalQuestions < 1) {
        return errorResponse("At least 1 question must be selected");
      }
    }

    // Create room
    const roomId = createId();
    const inviteCode = generateInviteCode();

    // Auto-generate room name if not provided
    const roomName = name || `Room ${inviteCode.slice(0, 6)}`;

    // Insert room into Supabase
    await insertRoom({
      id: roomId,
      name: roomName,
      ownerId: userId,
      inviteCode,
      maxMembers: 20,
      setupMode,
    });

    // Add owner as first member
    await insertRoomMember({
      roomId,
      userId,
    });

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

    const inviteUrl = `${getServerEnv().NEXTAUTH_URL}/invite/${inviteCode}`;

    const response = successResponse({
      roomId,
      inviteCode,
      inviteUrl,
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
