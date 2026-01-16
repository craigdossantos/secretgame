"use client";

import { useParams } from "next/navigation";
import { useRoomData } from "@/hooks/use-room-data";
import { useRoomActions } from "@/hooks/use-room-actions";
import { RoomLoadingState } from "@/components/room-loading-state";
import { RoomErrorState } from "@/components/room-error-state";
import { RoomHeader } from "@/components/room-header";
import { RoomContent } from "@/components/room-content";
import { SetupModeView } from "@/components/setup-mode-view";
import { WelcomeModal } from "@/components/welcome-modal";
import { UnlockDrawer } from "@/components/unlock-drawer";
import { UnlockQuestionModal } from "@/components/unlock-question-modal";
import { CustomQuestionModal } from "@/components/custom-question-modal";
import { CollaborativeAnswersModal } from "@/components/collaborative-answers-modal";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  // Data fetching hook
  const {
    room,
    secrets,
    roomQuestions,
    currentUserId,
    loading,
    error,
    setSecrets,
    setRoomQuestions,
    setRoom,
  } = useRoomData(roomId);

  // Actions hook
  const {
    displayedQuestions,
    answeredQuestionIds,
    skippedQuestionIds,
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
    handleSkipQuestion,
    handleUnlock,
    handleUnlockQuestionSubmit,
    handleUnlockSubmit,
    handleRate,
    handleCreateCustomQuestion,
    handleViewCollaborativeAnswers,
  } = useRoomActions({
    roomId,
    secrets,
    roomQuestions,
    setSecrets,
    setRoomQuestions,
  });

  // Handle setup mode completion
  const handleSetupComplete = async () => {
    // Reload room data to get updated questions and exit setup mode
    try {
      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      if (roomResponse.ok) {
        const roomData = await roomResponse.json();
        setRoom(roomData.room);
        // Force reload to get questions and secrets
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to reload room after setup:", err);
    }
  };

  // Loading state
  if (loading) {
    return <RoomLoadingState />;
  }

  // Error state
  if (error) {
    return <RoomErrorState error={error} />;
  }

  // Setup mode view
  if (room?.setupMode) {
    return <SetupModeView roomId={roomId} onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-background art-deco-pattern">
      {/* Welcome Modal - Show if not logged in */}
      <WelcomeModal
        roomName={room?.name ?? undefined}
        memberCount={room?.memberCount}
        isOpen={!currentUserId}
      />

      {/* Header */}
      <RoomHeader room={room} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <RoomContent
          room={room}
          roomId={roomId}
          roomQuestions={roomQuestions}
          displayedQuestions={displayedQuestions}
          secrets={secrets}
          answeredQuestionIds={answeredQuestionIds}
          skippedQuestionIds={skippedQuestionIds}
          currentUserId={currentUserId}
          onSkipQuestion={handleSkipQuestion}
          onUnlock={handleUnlock}
          onRate={handleRate}
          onViewCollaborativeAnswers={handleViewCollaborativeAnswers}
          onOpenCustomQuestionModal={() => setIsCustomQuestionModalOpen(true)}
        />
      </div>

      {/* Unlock Question Modal - New question-based unlock */}
      {selectedSecretToUnlock && questionForUnlock && (
        <UnlockQuestionModal
          isOpen={unlockQuestionModalOpen}
          onClose={() => {
            setUnlockQuestionModalOpen(false);
            setQuestionForUnlock(null);
            setSelectedSecretToUnlock(null);
          }}
          question={questionForUnlock}
          requiredSpiciness={selectedSecretToUnlock.selfRating}
          targetSecretAuthor={selectedSecretToUnlock.authorName}
          onAnswerSubmit={handleUnlockQuestionSubmit}
        />
      )}

      {/* Unlock Drawer - Fallback for secrets without questionId */}
      {selectedSecretToUnlock && (
        <UnlockDrawer
          isOpen={unlockDrawerOpen}
          onOpenChange={setUnlockDrawerOpen}
          requiredRating={selectedSecretToUnlock.selfRating}
          onSubmit={handleUnlockSubmit}
        />
      )}

      {/* Custom Question Modal */}
      <CustomQuestionModal
        isOpen={isCustomQuestionModalOpen}
        onClose={() => setIsCustomQuestionModalOpen(false)}
        onCreateQuestion={handleCreateCustomQuestion}
      />

      {/* Collaborative Answers Modal */}
      {selectedCollaborativeQuestion && (
        <CollaborativeAnswersModal
          open={collaborativeModalOpen}
          onOpenChange={setCollaborativeModalOpen}
          questionId={selectedCollaborativeQuestion.id}
          questionText={selectedCollaborativeQuestion.question}
          question={selectedCollaborativeQuestion}
          roomId={roomId}
          onUnlock={handleUnlock}
        />
      )}
    </div>
  );
}
