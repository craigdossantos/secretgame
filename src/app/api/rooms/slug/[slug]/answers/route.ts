import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "@/lib/auth";
import {
  findRoomBySlug,
  findRoomQuestions,
  findRoomMember,
  findSecretsByQuestionId,
  insertSecret,
  insertRoomMember,
} from "@/lib/db/supabase";
import { errorResponse, successResponse } from "@/lib/api/helpers";

// POST /api/rooms/slug/[slug]/answers - Submit an answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const { slug } = await params;
    const body = await request.json();
    const { answer, isAnonymous = false } = body;

    // Validate answer
    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return errorResponse("Answer is required");
    }

    if (answer.length > 500) {
      return errorResponse("Answer must be 500 characters or less");
    }

    // Find room by slug
    const room = await findRoomBySlug(slug);
    if (!room) {
      return errorResponse("Room not found", 404);
    }

    // Get room question
    const questions = await findRoomQuestions(room.id);
    if (questions.length === 0) {
      return errorResponse("No question in this room");
    }
    const question = questions[0];

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
    const secretId = createId();
    await insertSecret({
      id: secretId,
      roomId: room.id,
      questionId: question.id,
      authorId: session.user.id,
      body: answer.trim(),
      selfRating: 3, // Default for V1
      importance: 3,
      avgRating: null,
      buyersCount: 0,
      isHidden: false,
      isAnonymous: isAnonymous || room.isAnonymous,
      answerType: "text",
      answerData: null,
    });

    return successResponse({
      success: true,
      secretId,
    });
  } catch (error) {
    console.error("Failed to submit answer:", error);
    return errorResponse("Failed to submit answer", 500);
  }
}
