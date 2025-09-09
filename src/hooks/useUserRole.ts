'use client';

import { useAuthStore } from '@/store/authStore';

export const useUserRole = () => {
  const { getUserRole, user, isAuthenticated } = useAuthStore();
  
  const userRole = getUserRole();
  
  return {
    userRole,
    isFreelancer: userRole === 'freelancer',
    isClient: userRole === 'client',
    hasRole: !!userRole,
    user,
    isAuthenticated
  };
};
