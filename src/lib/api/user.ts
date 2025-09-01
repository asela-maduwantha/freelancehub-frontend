// User Profile API functions

import { apiClient } from './client';
import type { UserProfileData, FreelancerProfileData, ClientProfileData } from './types';

// User Profile API functions
export const userAPI = {
  // Update general user profile
  async updateProfile(data: UserProfileData): Promise<{ message: string; user: any }> {
    return apiClient.put('/users/profile', data);
  },

  // Update freelancer-specific profile
  async updateFreelancerProfile(data: FreelancerProfileData): Promise<{ message: string }> {
    return apiClient.put('/users/freelancer-profile', data);
  },

  // Update client-specific profile
  async updateClientProfile(data: ClientProfileData): Promise<{ message: string }> {
    return apiClient.put('/users/client-profile', data);
  },

  // Get current user profile
  async getProfile(): Promise<any> {
    return apiClient.get('/users/profile');
  },
};
