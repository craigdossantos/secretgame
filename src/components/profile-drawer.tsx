'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: Date | string;
}

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCurrentUser();
    }
  }, [open]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/me');
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        setEditedName(data.user.name);
        setEditedEmail(data.user.email);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      // For now, just show a toast since we're cookie-based
      // In a real app, this would update the user via API
      toast.info('Profile editing will be available in a future update');

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="art-deco-border bg-card/95 backdrop-blur-sm">
        <SheetHeader>
          <SheetTitle className="text-2xl font-serif art-deco-text art-deco-shadow">
            Your Profile
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            View and edit your profile information
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          <div className="mt-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b border-border/30">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                Avatar customization coming soon
              </p>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4 text-primary" />
                  Display Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  className="bg-secondary/30 border-border"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-secondary/30 border-border"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Email changes will be available in a future update
                </p>
              </div>

              {/* Created Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="w-4 h-4 text-primary" />
                  Member Since
                </Label>
                <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <p className="text-sm text-foreground">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* User ID (for debugging) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  User ID
                </Label>
                <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {user.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Art Deco Divider */}
            <div className="art-deco-divider my-6">
              <span>◆</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1 bg-secondary border-border hover:bg-secondary/80"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !editedName.trim()}
                className="flex-1 art-deco-border bg-primary text-primary-foreground hover:bg-primary/90 art-deco-glow"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Failed to load profile</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
