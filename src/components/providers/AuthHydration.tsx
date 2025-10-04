'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { authActions } from '@/store/slices/auth/authSlice';
import { getStoredAuthData, hasValidStoredAuth } from '@/lib/utils/authStorage';

interface AuthHydrationProps {
  children: React.ReactNode;
}

/**
 * AuthHydration component that restores authentication state from localStorage
 * before rendering child components. This ensures that authentication state
 * is available immediately when the app starts.
 */
export default function AuthHydration({ children }: AuthHydrationProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        // Check if we have stored auth data
        if (hasValidStoredAuth()) {
          const { token, refreshToken } = getStoredAuthData();
          
          if (token && refreshToken) {
            console.log('🔄 Restoring authentication state from storage...');
            
            // Dispatch the rehydrate action to restore auth state
            dispatch(authActions.rehydrateAuth({ 
              token, 
              refreshToken 
            }));
          }
        } else {
          console.log('🔍 No stored authentication data found');
        }
      } catch (error) {
        console.error('❌ Error during auth hydration:', error);
        // If there's an error, clear any corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      }
    }

    // Mark hydration as complete
    setIsHydrated(true);
  }, [dispatch]);

  // Show loading or nothing until hydration is complete
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}