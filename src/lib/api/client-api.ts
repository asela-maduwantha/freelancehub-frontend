// Client API functions

import { apiClient } from './client';

// Client API functions
export const clientAPI = {
  // Get client projects
  async getProjects(filters?: any): Promise<any> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return apiClient.get(`/clients/projects${queryParams ? `?${queryParams}` : ''}`);
  },

  // Create new project
  async createProject(data: any): Promise<{ message: string; project: any }> {
    return apiClient.post('/clients/projects', data);
  },

  // Update client profile
  async updateProfile(data: any): Promise<{ message: string }> {
    return apiClient.put('/users/client-profile', data);
  },

  // Get client dashboard
  async getDashboard(): Promise<any> {
    return apiClient.get('/clients/dashboard');
  },
};
