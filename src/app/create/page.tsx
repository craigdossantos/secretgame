'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Loader2 } from 'lucide-react';

export default function CreateRoomPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName || 'Secret Room',
          userName: userName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      setInviteUrl(data.inviteUrl);
      setRoomId(data.roomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const copyInviteUrl = () => {
    navigator.clipboard.writeText(inviteUrl);
  };

  const goToRoom = () => {
    router.push(`/rooms/${roomId}`);
  };

  if (inviteUrl) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Room Created! 🎉</h1>
            <p className="text-gray-600">Share this invite link with your friends</p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={inviteUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={copyInviteUrl}
                variant="outline"
                size="icon"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <Button onClick={goToRoom} className="w-full">
              Enter Room
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Save this link! You&apos;ll need it to invite friends.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <Card className="max-w-md w-full p-6">
        <h1 className="text-2xl font-bold mb-6">Create a Secret Room</h1>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Your Name</Label>
            <Input
              id="userName"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name (optional)</Label>
            <Input
              id="roomName"
              placeholder="e.g., Friends' Secrets"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isCreating || !userName.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Room'
            )}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Rooms can have up to 20 members
        </p>
      </Card>
    </div>
  );
}