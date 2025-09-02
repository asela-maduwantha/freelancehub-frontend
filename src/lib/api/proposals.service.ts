
// lib/api/services/proposals.service.ts
import { apiClient } from './client';
import { IApiResponse } from '../types';

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  proposedBudget: number;
  proposedDuration: { value: number; unit: string };
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Date;
}

export class ProposalsService {
  /**
   * Get current user's proposals
   */
  async getMyProposals(): Promise<Proposal[]> {
    return apiClient.get('/proposals/my');
  }
}

export const proposalsService = new ProposalsService();