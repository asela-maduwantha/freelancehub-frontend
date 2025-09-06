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
          // Map ProfileResponse to IUser format
          const user: IUser = {
            _id: profile.id,
            email: profile.email,
            emailVerified: profile.emailVerified,
            role: [profile.role],
            activeRole: profile.role,
            firstName: profile.name.split(' ')[0] || '',
            lastName: profile.name.split(' ').slice(1).join(' ') || '',
            profilePicture: profile.profilePicture,
            phone: undefined,
            location: undefined,
            languages: undefined,
            freelancerProfile: undefined,
            clientProfile: undefined,
            isActive: profile.isActive,
            lastLoginAt: profile.lastLoginAt,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
          };
          setUser(user);
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
    // Map AuthUser to IUser format
    const user: IUser = {
      _id: response.user.id,
      email: response.user.email,
      emailVerified: false, // Default value
      role: [response.user.role],
      activeRole: response.user.role,
      firstName: response.user.name.split(' ')[0] || '',
      lastName: response.user.name.split(' ').slice(1).join(' ') || '',
      profilePicture: undefined,
      phone: undefined,
      location: undefined,
      languages: undefined,
      freelancerProfile: undefined,
      clientProfile: undefined,
      isActive: true, // Default value
      lastLoginAt: new Date().toISOString(), // Default value
      createdAt: new Date().toISOString(), // Default value
      updatedAt: new Date().toISOString() // Default value
    };
    setUser(user);
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
      // Map ProfileResponse to IUser format
      const user: IUser = {
        _id: profile.id,
        email: profile.email,
        emailVerified: profile.emailVerified,
        role: [profile.role],
        activeRole: profile.role,
        firstName: profile.name.split(' ')[0] || '',
        lastName: profile.name.split(' ').slice(1).join(' ') || '',
        profilePicture: profile.profilePicture,
        phone: undefined,
        location: undefined,
        languages: undefined,
        freelancerProfile: undefined,
        clientProfile: undefined,
        isActive: profile.isActive,
        lastLoginAt: profile.lastLoginAt,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };
      setUser(user);
      return user;
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