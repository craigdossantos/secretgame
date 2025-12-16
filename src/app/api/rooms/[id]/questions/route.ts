import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "@/lib/auth";
import {
  findRoomById,
  findRoomMember,
  findRoomQuestions,
  insertRoomQuestion,
  upsertUser,
} from "@/lib/db/supabase";
import { successResponse, errorResponse } from "@/lib/api/helpers";

// POST /api/rooms/[id]/questions - Add a custom question to a room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: roomId } = await params;

    // Get user session from NextAuth
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Authentication required", 401);
    }
    const userId = session.user.id;

    // Upsert user to ensure they exist in database
    await upsertUser({
      id: userId,
      email: session.user.email!,
      name: session.user.name || "Anonymous",
      avatarUrl: session.user.image || null,
    });

    // Get request body
    const body = await request.json();
    const {
      question,
      category,
      suggestedLevel,
      difficulty,
      questionType,
      answerConfig,
      allowAnonymous,
    } = body;

    console.log(
      `❓ Adding custom question to room ${roomId} by user ${userId}`,
    );

    // Validation
    if (!question || typeof question !== "string") {
      return errorResponse("Question text is required", 400);
    }

    if (!category || typeof category !== "string") {
      return errorResponse("Category is required", 400);
    }

    if (
      typeof suggestedLevel !== "number" ||
      suggestedLevel < 1 ||
      suggestedLevel > 5
    ) {
      return errorResponse("Spiciness level must be between 1 and 5", 400);
    }

    const wordCount = question
      .trim()
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;
    if (wordCount < 5 || wordCount > 50) {
      return errorResponse("Question must be between 5 and 50 words", 400);
    }

    if (question.length > 200) {
      return errorResponse("Question must be 200 characters or less", 400);
    }

    // Get the room
    const room = await findRoomById(roomId);
    if (!room) {
      console.log(`❌ Room ${roomId} not found`);
      return errorResponse("Room not found", 404);
    }

    // Check if user is a member of the room
    const isMember = await findRoomMember(roomId, userId);
    if (!isMember) {
      console.log(`❌ User ${userId} is not a member of room ${roomId}`);
      return errorResponse(
        "You must be a member of this room to add questions",
        403,
      );
    }

    // Get current questions to determine display order
    const existingQuestions = await findRoomQuestions(roomId);
    const displayOrder = existingQuestions.length;

    // Create the custom question in room_questions table
    const customQuestionId = createId();
    const customQuestion = await insertRoomQuestion({
      id: customQuestionId,
      roomId,
      questionId: null, // null indicates custom question
      question: question.trim(),
      category,
      suggestedLevel,
      difficulty: difficulty || "medium",
      questionType: questionType || "text",
      answerConfig: answerConfig || null,
      allowAnonymous: allowAnonymous || false,
      createdBy: userId,
      displayOrder,
    });

    console.log(
      `✅ Added custom question to room ${roomId}: ${customQuestion.id}`,
    );

    return successResponse(
      {
        message: "Custom question added successfully",
        question: customQuestion,
      },
      201,
    );
  } catch (error) {
    console.error("❌ Failed to add custom question:", error);
    return errorResponse("Failed to add custom question", 500);
  }
}
