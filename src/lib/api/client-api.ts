// Client API functions

import { apiClient } from './client';

// Client API functions
export const clientAPI = {
  // Get client projects
  async getProjects(filters?: any): Promise<any> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return apiClient.get(`/clients/projects/my-projects${queryParams ? `?${queryParams}` : ''}`);
  },

  // Create new project
  async createProject(data: any): Promise<{ message: string; project: any }> {
    return apiClient.post('/clients/projects', data);
  },

  // Get project by ID
  async getProject(id: string): Promise<any> {
    return apiClient.get(`/clients/projects/${id}`);
  },

  // Update project
  async updateProject(id: string, data: any): Promise<{ message: string }> {
    return apiClient.put(`/clients/projects/${id}`, data);
  },

  // Delete project
  async deleteProject(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/clients/projects/${id}`);
  },

  // Get project proposals
  async getProjectProposals(projectId: string): Promise<any> {
    return apiClient.get(`/projects/${projectId}/proposals`);
  },

  // Accept proposal (creates contract automatically)
  async acceptProposal(projectId: string, proposalId: string, message: string): Promise<{ message: string; contract: any }> {
    return apiClient.post(`/clients/projects/${projectId}/proposals/${proposalId}/accept`, { message });
  },

  // Reject proposal
  async rejectProposal(projectId: string, proposalId: string, reason: string): Promise<{ message: string }> {
    return apiClient.post(`/clients/projects/${projectId}/proposals/${proposalId}/reject`, { reason });
  },

  // Update client profile
  async updateProfile(data: any): Promise<{ message: string }> {
    return apiClient.put('/users/client-profile', data);
  },

  // Get client dashboard
  async getDashboard(): Promise<any> {
    const response = apiClient.get('/clients/dashboard');
    console.log(response);
    return response;
  },

  // Get all client proposals
  async getProposals(filters?: any): Promise<any> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return apiClient.get(`/clients/proposals${queryParams ? `?${queryParams}` : ''}`);
  },
};
