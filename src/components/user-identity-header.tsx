'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { ProfileDrawer } from '@/components/profile-drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export function UserIdentityHeader() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
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

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setShowProfileDrawer(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/70 transition-colors h-auto"
      >
        <Avatar className="w-8 h-8 border-2 border-primary/20">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user.name}</span>
      </Button>

      <ProfileDrawer
        open={showProfileDrawer}
        onOpenChange={setShowProfileDrawer}
      />
    </>
  );
}
