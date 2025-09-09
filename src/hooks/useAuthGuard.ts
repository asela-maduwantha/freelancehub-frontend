'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AuthGuardOptions {
  redirectTo?: string;
  requiredRole?: 'freelancer' | 'client';
  allowUnauthenticated?: boolean;
}

export const useAuthGuard = (options: AuthGuardOptions = {}) => {
  const {
    redirectTo = '/login',
    requiredRole,
    allowUnauthenticated = false,
  } = options;

  const router = useRouter();
  const { 
    isAuthenticated, 
    user, 
    isLoading, 
    isInitialized 
  } = useAuthStore();

  useEffect(() => {
    // Don't do anything until auth is initialized
    if (!isInitialized || isLoading) {
      return;
    }

    // If authentication is required but user is not authenticated
    if (!allowUnauthenticated && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If specific role is required but user doesn't have it
    if (requiredRole && user?.role !== requiredRole) {
      // Redirect based on user's actual role or to role selection if no role
      if (user?.role === 'freelancer') {
        router.push('/freelancer');
      } else if (user?.role === 'client') {
        router.push('/client');
      } else {
        router.push('/role-selection');
      }
      return;
    }
  }, [
    isAuthenticated, 
    user, 
    isLoading, 
    isInitialized, 
    requiredRole, 
    allowUnauthenticated, 
    redirectTo, 
    router
  ]);

  return {
    isAuthenticated,
    user,
    isLoading: isLoading || !isInitialized,
    userRole: user?.role || null,
  };
};
