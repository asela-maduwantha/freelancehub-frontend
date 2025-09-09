'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/lib/services/auth';
import { tokenManager } from '@/lib/services/tokenManager';

export const useAuthInit = () => {
  const { 
    setUser, 
    setLoading, 
    logout, 
    setInitialized, 
    isInitialized,
    hasValidToken 
  } = useAuthStore();

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized) return;

    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Get a valid access token (will refresh if only refresh token exists)
        const token = await tokenManager.getValidAccessToken();
        if (!token) {
          logout();
          return;
        }

        // Validate by fetching current user
        const user = await AuthService.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, [setUser, setLoading, logout, setInitialized, isInitialized, hasValidToken]);
};
