"use client";

import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { QuestionPrompt } from "@/lib/questions";
import type { SecretWithAuthor } from "@/types/models";
import {
  unlockSecretWithQuestion,
  unlockSecret,
  rateSecret,
  fetchRoomSecrets,
  createCustomQuestion,
  UnlockQuestionAnswer,
  UnlockData,
} from "@/lib/api/room-api";
import { toast } from "sonner";

interface UseRoomActionsProps {
  roomId: string;
  secrets: SecretWithAuthor[];
  roomQuestions: QuestionPrompt[];
  setSecrets: Dispatch<SetStateAction<SecretWithAuthor[]>>;
  setRoomQuestions: Dispatch<SetStateAction<QuestionPrompt[]>>;
}

interface UseRoomActionsReturn {
  displayedQuestions: QuestionPrompt[];
  answeredQuestionIds: string[];
  skippedQuestionIds: string[];
  setDisplayedQuestions: Dispatch<SetStateAction<QuestionPrompt[]>>;
  unlockDrawerOpen: boolean;
  setUnlockDrawerOpen: Dispatch<SetStateAction<boolean>>;
  selectedSecretToUnlock: SecretWithAuthor | null;
  setSelectedSecretToUnlock: Dispatch<SetStateAction<SecretWithAuthor | null>>;
  unlockQuestionModalOpen: boolean;
  setUnlockQuestionModalOpen: Dispatch<SetStateAction<boolean>>;
  questionForUnlock: QuestionPrompt | null;
  setQuestionForUnlock: Dispatch<SetStateAction<QuestionPrompt | null>>;
  isCustomQuestionModalOpen: boolean;
  setIsCustomQuestionModalOpen: Dispatch<SetStateAction<boolean>>;
  collaborativeModalOpen: boolean;
  setCollaborativeModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedCollaborativeQuestion: QuestionPrompt | null;
  setSelectedCollaborativeQuestion: Dispatch<
    SetStateAction<QuestionPrompt | null>
  >;
  handleSkipQuestion: (questionId: string) => void;
  handleUnlock: (secretId: string) => void;
  handleUnlockQuestionSubmit: (answer: UnlockQuestionAnswer) => Promise<void>;
  handleUnlockSubmit: (unlockData: UnlockData) => Promise<void>;
  handleRate: (secretId: string, rating: number) => Promise<void>;
  handleCreateCustomQuestion: (customQuestion: QuestionPrompt) => Promise<void>;
  handleViewCollaborativeAnswers: (question: QuestionPrompt) => void;
}

export function useRoomActions({
  roomId,
  secrets,
  roomQuestions,
  setSecrets,
  setRoomQuestions,
}: UseRoomActionsProps): UseRoomActionsReturn {
  // Question display state
  const [displayedQuestions, setDisplayedQuestions] = useState<
    QuestionPrompt[]
  >([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [skippedQuestionIds, setSkippedQuestionIds] = useState<string[]>([]);

  // Modal state
  const [unlockDrawerOpen, setUnlockDrawerOpen] = useState(false);
  const [selectedSecretToUnlock, setSelectedSecretToUnlock] =
    useState<SecretWithAuthor | null>(null);
  const [unlockQuestionModalOpen, setUnlockQuestionModalOpen] = useState(false);
  const [questionForUnlock, setQuestionForUnlock] =
    useState<QuestionPrompt | null>(null);
  const [isCustomQuestionModalOpen, setIsCustomQuestionModalOpen] =
    useState(false);
  const [collaborativeModalOpen, setCollaborativeModalOpen] = useState(false);
  const [selectedCollaborativeQuestion, setSelectedCollaborativeQuestion] =
    useState<QuestionPrompt | null>(null);

  // Update displayed questions
  const updateDisplayedQuestions = useCallback(() => {
    const availableQuestions = roomQuestions.filter(
      (q) =>
        !answeredQuestionIds.includes(q.id) &&
        !skippedQuestionIds.includes(q.id),
    );
    setDisplayedQuestions(availableQuestions.slice(0, 3));
  }, [roomQuestions, answeredQuestionIds, skippedQuestionIds]);

  useEffect(() => {
    if (roomQuestions.length > 0) {
      updateDisplayedQuestions();
    }
  }, [
    roomQuestions,
    answeredQuestionIds,
    skippedQuestionIds,
    updateDisplayedQuestions,
  ]);

  // Helper to reload secrets
  const reloadSecrets = useCallback(async () => {
    try {
      const data = await fetchRoomSecrets(roomId);
      setSecrets((data.secrets as SecretWithAuthor[]) || []);
    } catch (err) {
      console.error("Failed to reload secrets:", err);
    }
  }, [roomId, setSecrets]);

  const handleSkipQuestion = useCallback((questionId: string) => {
    setSkippedQuestionIds((prev) => [...prev, questionId]);
  }, []);

  const handleUnlock = useCallback(
    (secretId: string) => {
      const secret = secrets.find((s) => s.id === secretId);
      if (secret && secret.questionId) {
        const question = roomQuestions.find((q) => q.id === secret.questionId);
        if (question) {
          setSelectedSecretToUnlock(secret);
          setQuestionForUnlock(question);
          setUnlockQuestionModalOpen(true);
        } else {
          setSelectedSecretToUnlock(secret);
          setUnlockDrawerOpen(true);
        }
      } else if (secret) {
        setSelectedSecretToUnlock(secret);
        setUnlockDrawerOpen(true);
      }
    },
    [secrets, roomQuestions],
  );

  const handleUnlockQuestionSubmit = useCallback(
    async (answer: UnlockQuestionAnswer) => {
      if (!selectedSecretToUnlock) return;

      try {
        await unlockSecretWithQuestion(
          selectedSecretToUnlock.id,
          roomId,
          answer,
        );
        toast.success("Secret unlocked! Your answer has been shared.");

        setUnlockQuestionModalOpen(false);
        setQuestionForUnlock(null);
        setSelectedSecretToUnlock(null);

        if (!answeredQuestionIds.includes(answer.questionId)) {
          setAnsweredQuestionIds((prev) => [...prev, answer.questionId]);
        }

        await reloadSecrets();
      } catch (err) {
        console.error("Failed to unlock secret:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to unlock secret",
        );
      }
    },
    [roomId, selectedSecretToUnlock, answeredQuestionIds, reloadSecrets],
  );

  const handleUnlockSubmit = useCallback(
    async (unlockData: UnlockData) => {
      if (!selectedSecretToUnlock) return;

      try {
        const questionId =
          selectedSecretToUnlock.questionId || selectedSecretToUnlock.id;
        await unlockSecret(
          selectedSecretToUnlock.id,
          roomId,
          questionId,
          unlockData,
        );
        toast.success("Secret unlocked!");

        await reloadSecrets();

        setUnlockDrawerOpen(false);
        setSelectedSecretToUnlock(null);
      } catch (err) {
        console.error("Failed to unlock secret:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to unlock secret",
        );
        throw err;
      }
    },
    [roomId, selectedSecretToUnlock, reloadSecrets],
  );

  const handleRate = useCallback(
    async (secretId: string, rating: number) => {
      try {
        const avgRating = await rateSecret(secretId, rating);
        toast.success("Rating submitted!");

        setSecrets((prevSecrets) =>
          prevSecrets.map((s) => (s.id === secretId ? { ...s, avgRating } : s)),
        );
      } catch (err) {
        console.error("Failed to rate secret:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to submit rating",
        );
      }
    },
    [setSecrets],
  );

  const handleCreateCustomQuestion = useCallback(
    async (customQuestion: QuestionPrompt) => {
      try {
        const data = await createCustomQuestion(roomId, customQuestion);
        toast.success("Question added to room!");

        const newQuestion: QuestionPrompt = {
          id: data.question.id,
          question: data.question.question,
          category: data.question.category,
          suggestedLevel: data.question.suggestedLevel,
          difficulty: data.question.difficulty,
          tags: [
            {
              name: data.question.category.toLowerCase(),
              type: "category" as const,
            },
          ],
          archived: false,
          createdAt: data.question.createdAt,
          updatedAt: data.question.createdAt,
          questionType: data.question.questionType || "text",
          answerConfig: data.question.answerConfig,
          allowAnonymous: data.question.allowAnonymous || false,
          allowImageUpload: data.question.allowImageUpload || false,
        };

        setRoomQuestions((prev) => [newQuestion, ...prev]);
        setDisplayedQuestions((prev) => [newQuestion, ...prev].slice(0, 3));
        setIsCustomQuestionModalOpen(false);
      } catch (err) {
        console.error("Failed to add custom question:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to add custom question",
        );
      }
    },
    [roomId, setRoomQuestions],
  );

  const handleViewCollaborativeAnswers = useCallback(
    (question: QuestionPrompt) => {
      setSelectedCollaborativeQuestion(question);
      setCollaborativeModalOpen(true);
    },
    [],
  );

  return {
    displayedQuestions,
    answeredQuestionIds,
    skippedQuestionIds,
    setDisplayedQuestions,
    unlockDrawerOpen,
    setUnlockDrawerOpen,
    selectedSecretToUnlock,
    setSelectedSecretToUnlock,
    unlockQuestionModalOpen,
    setUnlockQuestionModalOpen,
    questionForUnlock,
    setQuestionForUnlock,
    isCustomQuestionModalOpen,
    setIsCustomQuestionModalOpen,
    collaborativeModalOpen,
    setCollaborativeModalOpen,
    selectedCollaborativeQuestion,
    setSelectedCollaborativeQuestion,
    handleSkipQuestion,
    handleUnlock,
    handleUnlockQuestionSubmit,
    handleUnlockSubmit,
    handleRate,
    handleCreateCustomQuestion,
    handleViewCollaborativeAnswers,
  };
}
