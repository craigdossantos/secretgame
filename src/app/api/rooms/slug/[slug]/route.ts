import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  findRoomBySlug,
  findRoomQuestions,
  findRoomMembers,
  findSecretsByQuestionId,
  findUserById,
} from "@/lib/db/supabase";
import { errorResponse, successResponse } from "@/lib/api/helpers";

// GET /api/rooms/slug/[slug] - Load room by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const session = await auth();

    const room = await findRoomBySlug(slug);
    if (!room) {
      return errorResponse("Room not found", 404);
    }

    // Get room question(s)
    const questions = await findRoomQuestions(room.id);
    const question = questions[0] || null; // V1: single question per room

    // Get members and answers
    const members = await findRoomMembers(room.id);
    const secrets = question ? await findSecretsByQuestionId(question.id) : [];

    // Check if current user has answered
    const userId = session?.user?.id;
    const userHasAnswered = userId
      ? secrets.some((s) => s.authorId === userId)
      : false;

    // Get participant info
    const participants = await Promise.all(
      members.map(async (member) => {
        const user = await findUserById(member.userId);
        return {
          id: member.userId,
          name: user?.name || "Anonymous",
          avatarUrl: user?.avatarUrl || null,
        };
      }),
    );

    // Prepare answers (only visible if user has answered)
    let answers: {
      id: string;
      body: string;
      authorId: string;
      authorName: string;
      authorAvatar: string | null;
      createdAt: string;
    }[] = [];

    if (userHasAnswered) {
      answers = await Promise.all(
        secrets.map(async (secret) => {
          const author = await findUserById(secret.authorId);
          return {
            id: secret.id,
            body: secret.body,
            authorId: secret.authorId,
            authorName: room.isAnonymous
              ? "Anonymous"
              : author?.name || "Unknown",
            authorAvatar: room.isAnonymous ? null : author?.avatarUrl || null,
            createdAt: secret.createdAt.toISOString(),
          };
        }),
      );
    }

    return successResponse({
      room: {
        id: room.id,
        name: room.name,
        slug: room.slug,
        isAnonymous: room.isAnonymous,
        question: question
          ? {
              id: question.id,
              question: question.question || question.questionId,
              category: question.category,
              suggestedLevel: question.suggestedLevel,
            }
          : null,
        answerCount: secrets.length,
        participants,
        userHasAnswered,
        answers,
      },
    });
  } catch (error) {
    console.error("Failed to get room:", error);
    return errorResponse("Failed to get room", 500);
  }
}
