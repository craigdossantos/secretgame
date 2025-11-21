'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
}

export function LogoutButton({ variant = 'ghost' }: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <Button onClick={handleLogout} variant={variant} size="sm" className="gap-2">
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
