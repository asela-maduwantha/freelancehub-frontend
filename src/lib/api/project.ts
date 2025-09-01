// Project API functions

import { apiClient } from './client';

// Project API functions
export const projectAPI = {
  // Get all projects
  async getProjects(filters?: any): Promise<any> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return apiClient.get(`/projects${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get public projects (for freelancers to browse)
  async getPublicProjects(filters?: any): Promise<any> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return apiClient.getPublic(`/projects/public${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get project by ID
  async getProject(id: string): Promise<any> {
    return apiClient.get(`/projects/${id}`);
  },

  // Update project
  async updateProject(id: string, data: any): Promise<{ message: string }> {
    return apiClient.put(`/projects/${id}`, data);
  },
};
