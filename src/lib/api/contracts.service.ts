import { apiClient } from './client';
import {
  CreateContractRequest,
  IContract,
  IApiResponse
} from '../types';

export interface MilestoneSubmission {
  files: string[];
  description: string;
}

export interface MilestoneUpdate {
  title?: string;
  description?: string;
  dueDate?: string;
}

export class ContractsService {
  /**
   * Create a new contract
   */
  async createContract(data: CreateContractRequest): Promise<IContract> {
    return apiClient.post('/contracts', data);
  }

  /**
   * Create contract from accepted proposal
   */
  async createFromProposal(proposalId: string): Promise<IApiResponse<{ contract: IContract }>> {
    return apiClient.post(`/contracts/from-proposal/${proposalId}`);
  }

  /**
   * Get current user contracts
   */
  async getContracts(): Promise<IContract[]> {
    return apiClient.get('/contracts');
  }

  /**
   * Get contracts by project ID
   */
  async getContractsByProject(projectId: string): Promise<IContract[]> {
    return apiClient.get(`/contracts/project/${projectId}`);
  }

  /**
   * Get contract by ID
   */
  async getContractById(id: string): Promise<IContract> {
    return apiClient.get(`/contracts/${id}`);
  }

  /**
   * Update milestone
   */
  async updateMilestone(
    contractId: string, 
    milestoneId: string, 
    data: MilestoneUpdate
  ): Promise<IApiResponse> {
    return apiClient.put(`/contracts/${contractId}/milestones/${milestoneId}`, data);
  }

  /**
   * Submit work for milestone
   */
  async submitMilestone(
    contractId: string, 
    milestoneId: string, 
    data: MilestoneSubmission
  ): Promise<IApiResponse> {
    return apiClient.post(`/contracts/${contractId}/milestones/${milestoneId}/submit`, data);
  }

  /**
   * Approve milestone work
   */
  async approveMilestone(
    contractId: string, 
    milestoneId: string, 
    feedback?: string
  ): Promise<IApiResponse> {
    return apiClient.post(`/contracts/${contractId}/milestones/${milestoneId}/approve`, { feedback });
  }

  /**
   * Reject milestone work
   */
  async rejectMilestone(
    contractId: string, 
    milestoneId: string, 
    feedback: string
  ): Promise<IApiResponse> {
    return apiClient.post(`/contracts/${contractId}/milestones/${milestoneId}/reject`, { feedback });
  }

  /**
   * Complete contract
   */
  async completeContract(contractId: string): Promise<IApiResponse> {
    return apiClient.post(`/contracts/${contractId}/complete`);
  }

  /**
   * Cancel contract
   */
  async cancelContract(contractId: string, reason: string): Promise<IApiResponse> {
    return apiClient.post(`/contracts/${contractId}/cancel`, { reason });
  }

  /**
   * Client approves contract
   */
  async clientApproveContract(contractId: string): Promise<IApiResponse<{ contract: IContract }>> {
    return apiClient.post(`/contracts/${contractId}/approve/client`);
  }

  /**
   * Freelancer approves contract
   */
  async freelancerApproveContract(contractId: string): Promise<IApiResponse<{ contract: IContract }>> {
    return apiClient.post(`/contracts/${contractId}/approve/freelancer`);
  }

  /**
   * Get contract for freelancer view
   */
  async getFreelancerContract(contractId: string): Promise<IContract> {
    return apiClient.get(`/contracts/${contractId}/freelancer-view`);
  }

  /**
   * Download contract PDF
   */
  async downloadContractPdf(contractId: string): Promise<Blob> {
    return apiClient.downloadFile(`/contracts/${contractId}/download-pdf`);
  }
}

export const contractsService = new ContractsService();