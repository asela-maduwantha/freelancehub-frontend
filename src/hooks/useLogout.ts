'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/lib/services/auth';
import { useProfileStore } from '@/store/profileStore';

export const useLogout = () => {
  const router = useRouter();
  const { logout: logoutStore, setLoading } = useAuthStore();
  const { clear: clearProfile } = useProfileStore();

  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      // Call backend logout (this will also clear tokens via TokenManager)
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side logout even if server request fails
    } finally {
  // Clear stores
      logoutStore();
  clearProfile();
      setLoading(false);
      
      // Redirect to login page
      router.push('/login');
    }
  }, [logoutStore, setLoading, router, clearProfile]);

  return { logout };
};
