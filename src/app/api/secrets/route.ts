import { NextRequest } from "next/server";
import { getSessionUserWithUpsert } from "@/lib/api/auth-helpers";
import {
  findRoomById,
  findRoomMember,
  findRoomSecrets,
  insertSecret,
  updateSecret,
} from "@/lib/db/supabase";
import { successResponse, errorResponse } from "@/lib/api/helpers";
import { createId } from "@paralleldrive/cuid2";
import { countWords, MAX_WORD_COUNT } from "@/lib/utils";

interface SecretSubmitBody {
  roomId: string;
  questionId: string;
  body: string;
  selfRating: number;
  importance: number;
  answerType?: string;
  answerData?: unknown;
  isAnonymous?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Get user session and ensure user exists in database
    const authResult = await getSessionUserWithUpsert();
    if (!authResult) {
      return errorResponse("Authentication required", 401);
    }
    const { userId } = authResult;

    // Parse request body
    const data: SecretSubmitBody = await request.json();
    const {
      roomId,
      questionId,
      body,
      selfRating,
      importance,
      answerType,
      answerData,
      isAnonymous,
    } = data;

    // Validate required fields
    if (
      !roomId ||
      !questionId ||
      !body ||
      selfRating === undefined ||
      importance === undefined
    ) {
      return errorResponse("Missing required fields", 400);
    }

    // Validate word count (≤100 words) for text answers only
    if (!answerType || answerType === "text") {
      const wordCount = countWords(body);
      if (wordCount > MAX_WORD_COUNT) {
        return errorResponse(
          `Secret must be ${MAX_WORD_COUNT} words or less`,
          400,
        );
      }
      if (wordCount === 0) {
        return errorResponse("Secret cannot be empty", 400);
      }
    }

    // Validate ratings (1-5)
    if (selfRating < 1 || selfRating > 5 || importance < 1 || importance > 5) {
      return errorResponse("Ratings must be between 1 and 5", 400);
    }

    // Verify room exists
    const room = await findRoomById(roomId);
    if (!room) {
      return errorResponse("Room not found", 404);
    }

    // Verify user is a member of the room
    const membership = await findRoomMember(roomId, userId);
    if (!membership) {
      return errorResponse(
        "You must be a member of this room to submit secrets",
        403,
      );
    }

    // Check if user already has a secret for this question in this room
    const existingSecrets = await findRoomSecrets(roomId);
    const existingSecret = existingSecrets.find(
      (s) => s.authorId === userId && s.questionId === questionId,
    );

    if (existingSecret) {
      // Update existing secret (edit answer)
      await updateSecret(existingSecret.id, {
        body: body.trim(),
        selfRating,
        importance,
        answerType: answerType || "text",
        answerData,
        isAnonymous: isAnonymous || false,
      });

      return successResponse({
        message: "Secret updated successfully",
        secret: {
          ...existingSecret,
          body: body.trim(),
          selfRating,
          importance,
          answerType: answerType || "text",
          answerData,
          isAnonymous: isAnonymous || false,
        },
      });
    } else {
      // Create new secret
      const secretId = createId();

      const newSecret = {
        id: secretId,
        roomId,
        authorId: userId,
        body: body.trim(),
        selfRating,
        importance,
        avgRating: String(selfRating), // Initially, avgRating = selfRating (stored as string)
        buyersCount: 0,
        isHidden: false,
        questionId, // Store questionId for filtering
        answerType: answerType || "text",
        answerData,
        isAnonymous: isAnonymous || false,
      };

      await insertSecret(newSecret);

      return successResponse(
        {
          message: "Secret submitted successfully",
          secret: newSecret,
        },
        201,
      );
    }
  } catch (error) {
    console.error("❌ Error submitting secret:", error);
    return errorResponse("Failed to submit secret", 500);
  }
}
