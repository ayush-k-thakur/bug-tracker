'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { getCurrentUser, logout } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const signOut = () => {
    logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    setUser,
  };
}