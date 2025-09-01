// Contract API functions

import { apiClient } from './client';

// Contract API functions
export const contractAPI = {
  // Get contracts
  async getContracts(filters?: any): Promise<any> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return apiClient.get(`/contracts${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get contract by ID
  async getContract(id: string): Promise<any> {
    return apiClient.get(`/contracts/${id}`);
  },

  // Create contract
  async createContract(data: any): Promise<{ message: string; contract: any }> {
    return apiClient.post('/contracts', data);
  },

  // Update contract
  async updateContract(id: string, data: any): Promise<{ message: string }> {
    return apiClient.put(`/contracts/${id}`, data);
  },

  // Complete contract
  async completeContract(id: string): Promise<{ message: string }> {
    return apiClient.post(`/contracts/${id}/complete`);
  },

  // Cancel contract
  async cancelContract(id: string, reason: string): Promise<{ message: string }> {
    return apiClient.post(`/contracts/${id}/cancel`, { reason });
  },

  // Approve milestone
  async approveMilestone(contractId: string, milestoneId: string, feedback?: string): Promise<{ message: string }> {
    return apiClient.post(`/contracts/${contractId}/milestones/${milestoneId}/approve`, { feedback });
  },

  // Reject milestone
  async rejectMilestone(contractId: string, milestoneId: string, feedback: string, revisionRequest: string): Promise<{ message: string }> {
    return apiClient.post(`/contracts/${contractId}/milestones/${milestoneId}/reject`, { feedback, revisionRequest });
  },
};
