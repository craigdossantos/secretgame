'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface LoginButtonProps {
  redirectTo?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function LoginButton({ redirectTo = '/', variant = 'default' }: LoginButtonProps) {
  const handleLogin = async () => {
    await signIn('google', { callbackUrl: redirectTo });
  };

  return (
    <Button onClick={handleLogin} variant={variant} className="gap-2">
      <LogIn className="h-4 w-4" />
      Sign in with Google
    </Button>
  );
}
