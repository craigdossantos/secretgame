import { QuestionPrompt } from "@/lib/questions";

export interface UnlockQuestionAnswer {
  questionId: string;
  body: string;
  selfRating: number;
  importance: number;
  answerType?: string;
  answerData?: unknown;
  isAnonymous?: boolean;
}

export interface UnlockData {
  body: string;
  selfRating: number;
  importance: number;
}

export async function unlockSecretWithQuestion(
  secretId: string,
  roomId: string,
  answer: UnlockQuestionAnswer,
): Promise<void> {
  const response = await fetch(`/api/secrets/${secretId}/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roomId,
      questionId: answer.questionId,
      body: answer.body,
      selfRating: answer.selfRating,
      importance: answer.importance,
      answerType: answer.answerType,
      answerData: answer.answerData,
      isAnonymous: answer.isAnonymous,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to unlock secret");
  }
}

export async function unlockSecret(
  secretId: string,
  roomId: string,
  questionId: string,
  unlockData: UnlockData,
): Promise<void> {
  const response = await fetch(`/api/secrets/${secretId}/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roomId,
      questionId,
      body: unlockData.body,
      selfRating: unlockData.selfRating,
      importance: unlockData.importance,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to unlock secret");
  }
}

export async function rateSecret(
  secretId: string,
  rating: number,
): Promise<number> {
  const response = await fetch(`/api/secrets/${secretId}/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to rate secret");
  }

  const data = await response.json();
  return data.avgRating;
}

export async function fetchRoomSecrets(
  roomId: string,
): Promise<{ secrets: unknown[] }> {
  const response = await fetch(`/api/rooms/${roomId}/secrets`);
  if (!response.ok) {
    throw new Error("Failed to fetch secrets");
  }
  return response.json();
}

export async function createCustomQuestion(
  roomId: string,
  customQuestion: QuestionPrompt,
): Promise<{ question: QuestionPrompt }> {
  const response = await fetch(`/api/rooms/${roomId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: customQuestion.question,
      category: customQuestion.category,
      suggestedLevel: customQuestion.suggestedLevel,
      difficulty: customQuestion.difficulty || "medium",
      questionType: customQuestion.questionType || "text",
      answerConfig: customQuestion.answerConfig,
      allowAnonymous: customQuestion.allowAnonymous || false,
      allowImageUpload: customQuestion.allowImageUpload || false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add custom question");
  }

  return response.json();
}
