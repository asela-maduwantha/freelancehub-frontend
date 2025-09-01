// Contract API functions

import { apiClient } from './client';

// Contract API functions
export const contractAPI = {
  // Get contracts
  async getContracts(filters?: any): Promise<any> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return apiClient.get(`/contracts${queryParams ? `?${queryParams}` : ''}`);
  },

  // Create contract
  async createContract(data: any): Promise<{ message: string; contract: any }> {
    return apiClient.post('/contracts', data);
  },

  // Update contract
  async updateContract(id: string, data: any): Promise<{ message: string }> {
    return apiClient.put(`/contracts/${id}`, data);
  },
};
