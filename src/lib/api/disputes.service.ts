import { apiClient } from './client';
import { CreateDisputeRequest, IApiResponse } from '../types';

export interface Dispute {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'under-review' | 'resolved' | 'closed';
  contractId: string;
  initiatorId: string;
  respondentId: string;
  createdAt: Date;
}

export interface DisputeMessage {
  id: string;
  message: string;
  senderId: string;
  createdAt: Date;
}

export interface DisputeEvidence {
  id: string;
  description: string;
  fileUrl: string;
  submittedBy: string;
  createdAt: Date;
}

export interface DisputeDetails extends Dispute {
  contract: any;
  initiator: any;
  respondent: any;
  messages: DisputeMessage[];
  evidence: DisputeEvidence[];
}

export class DisputesService {
  /**
   * Create a new dispute
   */
  async createDispute(data: CreateDisputeRequest): Promise<Dispute> {
    return apiClient.post('/disputes', data);
  }

  /**
   * Get current user disputes
   */
  async getDisputes(): Promise<Dispute[]> {
    return apiClient.get('/disputes');
  }

  /**
   * Get dispute by ID
   */
  async getDisputeById(id: string): Promise<DisputeDetails> {
    return apiClient.get(`/disputes/${id}`);
  }

  /**
   * Submit evidence for dispute
   */
  async submitEvidence(id: string, data: { description: string; fileUrl: string }): Promise<IApiResponse> {
    return apiClient.post(`/disputes/${id}/evidence`, data);
  }

  /**
   * Add message to dispute
   */
  async addMessage(id: string, message: string): Promise<IApiResponse> {
    return apiClient.post(`/disputes/${id}/messages`, { message });
  }

  /**
   * Update dispute status
   */
  async updateDisputeStatus(
    id: string, 
    status: string, 
    resolution?: string
  ): Promise<IApiResponse> {
    return apiClient.put(`/disputes/${id}/status`, { status, resolution });
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(
    id: string, 
    resolution: string, 
    refundAmount?: number
  ): Promise<IApiResponse> {
    return apiClient.post(`/disputes/${id}/resolve`, { resolution, refundAmount });
  }

  /**
   * Get all open disputes (admin only)
   */
  async getOpenDisputes(): Promise<Dispute[]> {
    return apiClient.get('/disputes/admin/open');
  }
}

export const disputesService = new DisputesService();