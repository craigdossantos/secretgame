"use client";

import { useState, useEffect, useCallback } from "react";
import {
  parseQuestions,
  QuestionPrompt,
  QuestionType,
  mockQuestions,
  type AnswerConfig,
} from "@/lib/questions";
import type {
  RoomWithDetails,
  SecretWithAuthor,
  CustomQuestion,
} from "@/types/models";

// Re-export types for backward compatibility
export type { RoomWithDetails as Room, SecretWithAuthor as Secret };

type Difficulty = "easy" | "medium" | "hard";

interface UseRoomDataReturn {
  room: RoomWithDetails | null;
  secrets: SecretWithAuthor[];
  roomQuestions: QuestionPrompt[];
  currentUserId: string | null;
  loading: boolean;
  error: string | null;
  setSecrets: React.Dispatch<React.SetStateAction<SecretWithAuthor[]>>;
  setRoomQuestions: React.Dispatch<React.SetStateAction<QuestionPrompt[]>>;
  setRoom: React.Dispatch<React.SetStateAction<RoomWithDetails | null>>;
  refetch: () => Promise<void>;
}

function mapCustomQuestionToPrompt(cq: CustomQuestion): QuestionPrompt {
  // Validate and cast difficulty to the expected type
  const validDifficulties: Difficulty[] = ["easy", "medium", "hard"];
  const difficulty: Difficulty = validDifficulties.includes(
    cq.difficulty as Difficulty,
  )
    ? (cq.difficulty as Difficulty)
    : "medium";

  // Validate and cast questionType to the expected type
  const validQuestionTypes: QuestionType[] = [
    "text",
    "slider",
    "multipleChoice",
  ];
  const questionType: QuestionType | undefined = cq.questionType
    ? validQuestionTypes.includes(cq.questionType as QuestionType)
      ? (cq.questionType as QuestionType)
      : "text"
    : undefined;

  return {
    id: cq.id,
    question: cq.question,
    category: cq.category,
    suggestedLevel: cq.suggestedLevel,
    difficulty,
    tags: [
      {
        name: cq.category.toLowerCase(),
        type: "category" as const,
      },
    ],
    archived: false,
    createdAt: cq.createdAt,
    updatedAt: cq.createdAt,
    questionType,
    answerConfig: cq.answerConfig as AnswerConfig | undefined,
    allowAnonymous: cq.allowAnonymous,
    allowImageUpload: cq.allowImageUpload,
  };
}

export function useRoomData(roomId: string): UseRoomDataReturn {
  const [room, setRoom] = useState<RoomWithDetails | null>(null);
  const [roomQuestions, setRoomQuestions] = useState<QuestionPrompt[]>([]);
  const [secrets, setSecrets] = useState<SecretWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadRoomData = useCallback(async () => {
    try {
      setLoading(true);

      // Load room details
      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      if (!roomResponse.ok) {
        throw new Error("Room not found");
      }
      const roomData = await roomResponse.json();
      setRoom(roomData.room);

      // Get current user ID from cookies
      const userId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userId="))
        ?.split("=")[1];
      setCurrentUserId(userId || null);

      // Load questions from YAML file
      try {
        const questionsResponse = await fetch("/questions.yaml");
        const roomQs: QuestionPrompt[] = [];

        if (questionsResponse.ok) {
          const yamlContent = await questionsResponse.text();
          const parsedQuestions = parseQuestions(yamlContent);

          // Add selected regular questions
          if (
            roomData.room.questionIds &&
            roomData.room.questionIds.length > 0
          ) {
            const selectedQuestions = parsedQuestions.filter((q) =>
              roomData.room.questionIds.includes(q.id),
            );
            roomQs.push(...selectedQuestions);
          }

          // Add custom questions
          if (
            roomData.room.customQuestions &&
            roomData.room.customQuestions.length > 0
          ) {
            const customQuestions = roomData.room.customQuestions.map(
              mapCustomQuestionToPrompt,
            );
            roomQs.push(...customQuestions);
          }
        } else {
          // Fallback to mock questions
          console.warn("Could not load questions.yaml, using mock questions");

          // Add selected regular questions
          if (
            roomData.room.questionIds &&
            roomData.room.questionIds.length > 0
          ) {
            const selectedQuestions = mockQuestions.filter((q) =>
              roomData.room.questionIds.includes(q.id),
            );
            roomQs.push(...selectedQuestions);
          }

          // Add custom questions
          if (
            roomData.room.customQuestions &&
            roomData.room.customQuestions.length > 0
          ) {
            const customQuestions = roomData.room.customQuestions.map(
              mapCustomQuestionToPrompt,
            );
            roomQs.push(...customQuestions);
          }
        }

        setRoomQuestions(roomQs);
      } catch (questionsError) {
        console.warn("Error loading questions:", questionsError);
        setRoomQuestions([]);
      }

      // Load room secrets
      const secretsResponse = await fetch(`/api/rooms/${roomId}/secrets`);
      if (secretsResponse.ok) {
        const secretsData = await secretsResponse.json();
        setSecrets(secretsData.secrets || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      loadRoomData();
    }
  }, [roomId, loadRoomData]);

  return {
    room,
    secrets,
    roomQuestions,
    currentUserId,
    loading,
    error,
    setSecrets,
    setRoomQuestions,
    setRoom,
    refetch: loadRoomData,
  };
}
