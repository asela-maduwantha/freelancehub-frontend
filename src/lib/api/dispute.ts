// Dispute API functions

import { apiClient } from './client';

export interface Dispute {
  id: string;
  contractId: string;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  clientId: string;
  clientName: string;
  reason: 'quality' | 'deadline' | 'communication' | 'payment' | 'other';
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
    description: string;
  }>;
  resolution?: {
    decision: 'client_favored' | 'freelancer_favored' | 'partial_refund' | 'mediation';
    amount?: number;
    description: string;
    resolvedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeData {
  contractId: string;
  reason: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence?: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
    description: string;
  }>;
}

export interface DisputeResponse {
  id: string;
  message: string;
  dispute: Dispute;
}

export interface DisputeStats {
  total: number;
  open: number;
  underReview: number;
  resolved: number;
  closed: number;
}

// Dispute API functions
export const disputeAPI = {
  // Create a new dispute
  async createDispute(data: CreateDisputeData): Promise<DisputeResponse> {
    return apiClient.post('/disputes', data);
  },

  // Get all disputes for current user
  async getUserDisputes(): Promise<Dispute[]> {
    return apiClient.get('/disputes');
  },

  // Get dispute by ID
  async getDispute(disputeId: string): Promise<Dispute> {
    return apiClient.get(`/disputes/${disputeId}`);
  },

  // Update dispute status (admin only)
  async updateDisputeStatus(disputeId: string, status: string, resolution?: any): Promise<{ message: string }> {
    return apiClient.put(`/disputes/${disputeId}/status`, { status, resolution });
  },

  // Add evidence to dispute
  async addEvidence(disputeId: string, evidence: any): Promise<{ message: string }> {
    return apiClient.post(`/disputes/${disputeId}/evidence`, evidence);
  },

  // Get dispute statistics
  async getDisputeStats(): Promise<DisputeStats> {
    return apiClient.get('/disputes/stats');
  },

  // Escalate dispute
  async escalateDispute(disputeId: string, reason: string): Promise<{ message: string }> {
    return apiClient.post(`/disputes/${disputeId}/escalate`, { reason });
  },

  // Close dispute
  async closeDispute(disputeId: string): Promise<{ message: string }> {
    return apiClient.put(`/disputes/${disputeId}/close`);
  }
};
