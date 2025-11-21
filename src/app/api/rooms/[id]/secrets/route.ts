import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  findRoomById,
  findRoomMember,
  findRoomSecrets,
  findUserSecretAccess,
  findUserById,
  upsertUser,
  findRoomQuestions
} from '@/lib/db/supabase';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import { parseQuestions } from '@/lib/questions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

    // Get user session from NextAuth
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }
    const userId = session.user.id;

    // Upsert user to ensure they exist in database
    await upsertUser({
      id: userId,
      email: session.user.email!,
      name: session.user.name || 'Anonymous',
      avatarUrl: session.user.image || null,
    });

    console.log(`🔍 Fetching secrets for room ${roomId}, user ${userId}`);

    // Verify room exists
    const room = await findRoomById(roomId);
    if (!room) {
      console.log(`❌ Room ${roomId} not found`);
      return errorResponse('Room not found', 404);
    }

    console.log(`🏠 Found room: ${room.name}`);

    // Verify user is a member
    const membership = await findRoomMember(roomId, userId);
    if (!membership) {
      console.log(`❌ User ${userId} is not a member of room ${roomId}`);
      return errorResponse('You must be a member of this room', 403);
    }

    console.log(`✅ User is a member, fetching secrets...`);

    // Get all secrets for this room
    const allSecrets = await findRoomSecrets(roomId);
    console.log(`📦 Found ${allSecrets.length} total secrets in room`);

    // Get room questions from database
    const roomQuestions = await findRoomQuestions(roomId);
    const validQuestionIds = new Set(roomQuestions.map(q => q.id));

    console.log(`📋 Room has ${roomQuestions.length} questions`);

    const filteredSecrets = allSecrets.filter(secret => {
      // Only include secrets that have a questionId and it's in the room's questions
      return secret.questionId && validQuestionIds.has(secret.questionId);
    });

    console.log(`🔒 Filtered to ${filteredSecrets.length} secrets for room questions`);

    // Load questions to get question text
    const questionsMap = new Map<string, string>();

    // Add room questions from database
    roomQuestions.forEach(q => {
      // Use the question text - either custom question or questionId reference
      if (q.question) {
        questionsMap.set(q.id, q.question);
      }
    });

    // Load regular questions from markdown for curated questions
    try {
      const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/questions.md`);
      if (questionsResponse.ok) {
        const markdownContent = await questionsResponse.text();
        const parsedQuestions = parseQuestions(markdownContent);

        // Add question text for curated questions
        roomQuestions.forEach(rq => {
          if (rq.questionId && !questionsMap.has(rq.id)) {
            const curatedQuestion = parsedQuestions.find(q => q.id === rq.questionId);
            if (curatedQuestion) {
              questionsMap.set(rq.id, curatedQuestion.question);
            }
          }
        });
      }
    } catch {
      console.warn('Could not load questions.md, some question text may be missing');
    }

    // For each secret, check if current user has access
    const userSecretAccess = await findUserSecretAccess(userId);
    const unlockedSecretIds = new Set(userSecretAccess.map(access => access.secretId));

    console.log(`🔓 User has unlocked ${unlockedSecretIds.size} secrets`);

    // Get user info for authors
    const secretsWithAccess = await Promise.all(
      filteredSecrets.map(async (secret) => {
        const author = await findUserById(secret.authorId);
        const isAuthor = secret.authorId === userId;
        const hasAccess = unlockedSecretIds.has(secret.id);
        const isUnlocked = isAuthor || hasAccess;

        return {
          id: secret.id,
          body: isUnlocked ? secret.body : '', // Only send body if unlocked
          selfRating: secret.selfRating,
          importance: secret.importance,
          avgRating: secret.avgRating ? Number(secret.avgRating) : null,
          buyersCount: secret.buyersCount,
          authorName: author?.name || 'Unknown',
          authorAvatar: author?.avatarUrl,
          createdAt: secret.createdAt.toISOString(), // Convert Date to ISO string for JSON
          isUnlocked,
          questionId: secret.questionId,
          questionText: secret.questionId ? questionsMap.get(secret.questionId) : undefined,
          // Typed answer support
          answerType: secret.answerType,
          answerData: isUnlocked ? secret.answerData : undefined, // Only send answer data if unlocked
          // Anonymous answer support
          isAnonymous: secret.isAnonymous || false,
        };
      })
    );

    console.log(`✅ Returning ${secretsWithAccess.length} secrets to client`);

    return successResponse({
      secrets: secretsWithAccess,
    });
  } catch (error) {
    console.error('❌ Error fetching room secrets:', error);
    return errorResponse('Failed to fetch secrets', 500);
  }
}
