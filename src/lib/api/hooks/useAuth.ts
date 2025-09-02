import { useState, useEffect, useCallback } from 'react';
import { authService } from '../auth.service';
import { IUser, LoginRequest, RegisterRequest } from '../../types';

export function useAuth() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const profile = await authService.getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    return authService.register(data);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (authService.isAuthenticated()) {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    }
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    isAuthenticated: authService.isAuthenticated(),
  };
}