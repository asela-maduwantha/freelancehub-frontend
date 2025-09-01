// Freelancer API functions

import { apiClient } from './client';

// Freelancer API functions
export const freelancerAPI = {
  // Get freelancer proposals
  async getProposals(filters?: any): Promise<any> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return apiClient.get(`/freelancers/proposals${queryParams ? `?${queryParams}` : ''}`);
  },

  // Submit proposal
  async submitProposal(projectId: string, data: any): Promise<{ message: string }> {
    return apiClient.post(`/freelancers/projects/${projectId}/proposals`, data);
  },

  // Update freelancer profile
  async updateProfile(data: any): Promise<{ message: string }> {
    return apiClient.put('/users/freelancer-profile', data);
  },

  // Get freelancer dashboard
  async getDashboard(): Promise<any> {
    return apiClient.get('/freelancers/dashboard');
  },
};
