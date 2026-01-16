import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  findRoomById,
  findRoomMember,
  countRoomMembers,
  findRoomQuestions,
  updateRoom,
} from "@/lib/db/supabase";
import { errorResponse, successResponse } from "@/lib/api/helpers";

// GET /api/rooms/[id] - Get room details and secrets
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const roomId = (await params).id;

    // Get authenticated user from NextAuth session
    // Get authenticated user from NextAuth session
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const cookieStore = request.cookies;
      userId = cookieStore.get("userId")?.value;
    }

    if (!userId) {
      return errorResponse("Authentication required", 401);
    }

    // Get room details from Supabase
    const room = await findRoomById(roomId);

    if (!room) {
      return errorResponse("Room not found", 404);
    }

    // Check if user is a member
    const membership = await findRoomMember(roomId, userId);

    if (!membership) {
      // Return limited info for non-members
      return successResponse({
        room: {
          id: room.id,
          name: room.name,
          isMember: false,
        },
      });
    }

    // Get room member count and questions
    const memberCount = await countRoomMembers(roomId);
    const roomQuestions = await findRoomQuestions(roomId);

    // Separate curated questions (have questionId) from custom questions
    const questionIds = roomQuestions
      .filter((q) => q.questionId)
      .map((q) => q.questionId!);

    const customQuestions = roomQuestions
      .filter((q) => !q.questionId)
      .map((q) => ({
        id: q.id,
        question: q.question!,
        category: q.category,
        suggestedLevel: q.suggestedLevel,
        difficulty: q.difficulty,
        questionType: q.questionType,
        answerConfig: q.answerConfig,
        allowAnonymous: q.allowAnonymous,
      }));

    return successResponse({
      room: {
        id: room.id,
        name: room.name,
        memberCount,
        inviteCode: room.inviteCode,
        ownerId: room.ownerId,
        questionIds,
        customQuestions,
        setupMode: room.setupMode,
        isMember: true,
      },
    });
  } catch {
    return errorResponse("Failed to get room", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const roomId = (await context.params).id;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return errorResponse("Room name is required", 400);
    }

    // Get authenticated user
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const cookieStore = request.cookies;
      userId = cookieStore.get("userId")?.value;
    }

    if (!userId) {
      return errorResponse("Authentication required", 401);
    }

    // Find the room
    const room = await findRoomById(roomId);
    if (!room) {
      return errorResponse("Room not found", 404);
    }

    // Verify ownership
    if (room.ownerId !== userId) {
      return errorResponse("Only the room owner can rename the room", 403);
    }

    // Update room
    const updatedRoom = await updateRoom(roomId, {
      name: name.trim(),
    });

    return successResponse({ room: updatedRoom });
  } catch {
    return errorResponse("Failed to update room", 500);
  }
}
