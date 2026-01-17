"use client";

import { useState, useEffect, useCallback } from "react";

interface PendingAnswer {
  questionId: string;
  questionText: string;
  answer: string;
  isAnonymous: boolean;
  slug?: string;
  createdAt: number;
}

const STORAGE_KEY = "secretgame_pending_answer";
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export function usePendingAnswer() {
  const [pending, setPending] = useState<PendingAnswer | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PendingAnswer;
        // Check if expired
        if (Date.now() - parsed.createdAt < EXPIRY_MS) {
          setPending(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const savePending = useCallback(
    (answer: Omit<PendingAnswer, "createdAt">) => {
      const withTimestamp = { ...answer, createdAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
      setPending(withTimestamp);
    },
    [],
  );

  const clearPending = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPending(null);
  }, []);

  const getPending = useCallback((): PendingAnswer | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PendingAnswer;
        if (Date.now() - parsed.createdAt < EXPIRY_MS) {
          return parsed;
        }
      }
    } catch {
      // Ignore errors
    }
    return null;
  }, []);

  return { pending, savePending, clearPending, getPending };
}
