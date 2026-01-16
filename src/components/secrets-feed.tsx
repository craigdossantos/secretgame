"use client";

import { SecretCard } from "@/components/secret-card";
import type { SecretWithAuthor } from "@/types/models";
import { QuestionPrompt } from "@/lib/questions";

interface SecretsFeedProps {
  secrets: SecretWithAuthor[];
  onUnlock: (secretId: string) => void;
  onRate: (secretId: string, rating: number) => void;
  displayedQuestions: QuestionPrompt[];
  roomQuestionsCount: number;
}

export function SecretsFeed({
  secrets,
  onUnlock,
  onRate,
  displayedQuestions,
  roomQuestionsCount,
}: SecretsFeedProps) {
  // Secrets Feed - when there are secrets
  if (secrets.length > 0) {
    return (
      <div>
        <div className="art-deco-divider my-8">
          <span>&#9670; &#9670; &#9670;</span>
        </div>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-serif text-foreground art-deco-text art-deco-shadow">
            Secrets ({secrets.length})
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Your secrets appear unlocked. Unlock others&apos; by sharing secrets
            of equal or higher spiciness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {secrets.map((secret) => (
            <SecretCard
              key={secret.id}
              secret={secret}
              onUnlock={onUnlock}
              onRate={onRate}
            />
          ))}
        </div>
      </div>
    );
  }

  // No Secrets Yet State - Show Example
  if (roomQuestionsCount > 0) {
    return (
      <div>
        <div className="art-deco-divider my-8">
          <span>&#9670; &#9670; &#9670;</span>
        </div>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-serif text-foreground art-deco-text art-deco-shadow">
            Secrets (0)
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Example of how secrets will appear - answer a question to share
            yours!
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SecretCard
            secret={{
              id: "example-secret",
              roomId: "example",
              authorId: "example",
              body: "This is an example of a locked secret. The actual content is hidden until you unlock it by sharing a secret of equal or higher spiciness level. Secrets keep the conversation interesting and build trust in your group!",
              selfRating: 3,
              importance: 4,
              avgRating: null,
              buyersCount: 0,
              isHidden: false,
              authorName: "Example User",
              createdAt: new Date().toISOString(),
              isUnlocked: false,
              questionText:
                displayedQuestions[0]?.question ||
                "What's something you've never told anyone?",
            }}
            onUnlock={() => {}}
            onRate={() => {}}
          />
        </div>
      </div>
    );
  }

  return null;
}
