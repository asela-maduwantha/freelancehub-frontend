// Contract API functions

import { apiClient } from './client';

// Contract API functions
export const contractAPI = {
  // Get contracts
  async getContracts(filters?: any): Promise<any> {
    console.log('Contract API getContracts called with filters:', filters);
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = `/contracts${queryParams ? `?${queryParams}` : ''}`;
    console.log('Contract API calling URL:', url);
    return apiClient.get(url);
  },

  // Get contract by ID
  async getContract(id: string): Promise<any> {
    return apiClient.get(`/contracts/${id}`);
  },

  // Get contract for freelancer view (only after client approval)
  async getContractFreelancerView(id: string): Promise<any> {
    return apiClient.get(`/contracts/${id}/freelancer-view`);
  },

  // Create contract
  async createContract(data: any): Promise<{ message: string; contract: any }> {
    return apiClient.post('/contracts', data);
  },

  // Create contract from proposal (manual fallback)
  async createContractFromProposal(proposalId: string): Promise<{ message: string; contract: any }> {
    return apiClient.post(`/contracts/from-proposal/${proposalId}`);
  },

  // Client approve contract
  async approveContractAsClient(contractId: string): Promise<{ message: string; contract: any }> {
    return apiClient.post(`/contracts/${contractId}/approve/client`);
  },

  // Freelancer approve contract
  async approveContractAsFreelancer(contractId: string): Promise<{ message: string; contract: any }> {
    return apiClient.post(`/contracts/${contractId}/approve/freelancer`);
  },

  // Download contract PDF
  async downloadContractPDF(contractId: string): Promise<{ pdfUrl: string }> {
    return apiClient.get(`/contracts/${contractId}/download-pdf`);
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

  // Submit work for milestone
  async submitMilestone(contractId: string, milestoneId: string, data: {
    description: string;
    files?: string[];
    deliverables?: string;
  }): Promise<{ message: string }> {
    return apiClient.post(`/contracts/${contractId}/milestones/${milestoneId}/submit`, data);
  },
};
