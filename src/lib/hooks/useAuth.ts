'use client';

import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated, selectAuth, selectAuthLoading, selectAuthError } from '../selectors';
import { User } from '../../store/slices/auth/authSlice';

/**
 * Custom hook to access user authentication data from Redux state
 */
export const useAuth = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    // Derived properties for convenience
    userName: user?.fullName || 'User',
    userEmail: user?.email || '',
    userRole: user?.role || 'freelancer',
    userAvatar: user?.avatar,
    isEmailVerified: user?.isEmailVerified || false,
    isActive: user?.isActive || false,
  };
};

/**
 * Custom hook to get user display information
 */
export const useUserDisplay = () => {
  const { user, userName, userAvatar, userRole } = useAuth();
  
  return {
    displayName: userName,
    displayAvatar: userAvatar,
    displayRole: userRole,
    initials: userName.split(' ').map((name: string) => name.charAt(0).toUpperCase()).join(''),
    isVerified: user?.isEmailVerified || false,
  };
};

/**
 * Hook to check if user has specific role
 */
export const useUserRole = (role?: 'freelancer' | 'client' | 'admin') => {
  const { userRole, isAuthenticated } = useAuth();
  
  if (role) {
    return isAuthenticated && userRole === role;
  }
  
  return { userRole, isAuthenticated };
};