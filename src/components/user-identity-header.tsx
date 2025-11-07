'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export function UserIdentityHeader() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/me');
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditName = () => {
    setEditedName(user?.name || '');
    setShowEditDialog(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (editedName.trim() === user?.name) {
      setShowEditDialog(false);
      return;
    }

    // For now, just show a toast since we're cookie-based
    // In a real app, this would update the user via API
    toast.info('Name editing will be available in a future update');
    setShowEditDialog(false);
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
        <span className="text-sm font-medium">{user.name}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-1"
          onClick={handleEditName}
          aria-label="Edit name"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Your Name</DialogTitle>
            <DialogDescription>
              Change how others see you in the game
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveName}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
