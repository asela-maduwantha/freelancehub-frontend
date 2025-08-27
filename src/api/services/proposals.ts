// Proposal API services
import apiClient from '../axios-instance';
import { 
  ApiResponse, 
  PaginatedResponse,
  Proposal,
  ProposalWithProject,
  ProposalWithFreelancer,
  CreateProposalData,
  UpdateProposalData,
  ProposalFilters,
  ProposalStats,
  ProposalTemplate,
  CreateProposalTemplateData,
  BulkProposalAction
} from '../../types';

export const proposalApi = {
  // Submit proposal
  submitProposal: async (proposalData: CreateProposalData): Promise<ApiResponse<{ proposal: Proposal }>> => {
    const response = await apiClient.post(`/api/v1/projects/${proposalData.projectId}/proposals`, proposalData);
    return response.data as ApiResponse<{ proposal: Proposal }>;
  },

  // Get proposal by ID
  getProposal: async (proposalId: string): Promise<ApiResponse<Proposal>> => {
    const response = await apiClient.get(`/api/v1/proposals/${proposalId}`);
    return response.data as ApiResponse<Proposal>;
  },

  // Update proposal
  updateProposal: async (proposalId: string, updateData: UpdateProposalData): Promise<ApiResponse<{ proposal: Proposal }>> => {
    const response = await apiClient.put(`/api/v1/proposals/${proposalId}`, updateData);
    return response.data as ApiResponse<{ proposal: Proposal }>;
  },

  // Withdraw proposal
  withdrawProposal: async (proposalId: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/proposals/${proposalId}/withdraw`, { reason });
    return response.data as ApiResponse<any>;
  },

  // Delete proposal
  deleteProposal: async (proposalId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/proposals/${proposalId}`);
    return response.data as ApiResponse<any>;
  },

  // Accept proposal (client)
  acceptProposal: async (proposalId: string): Promise<ApiResponse<{ contract: any }>> => {
    const response = await apiClient.post(`/api/v1/projects/proposals/${proposalId}/accept`);
    return response.data as ApiResponse<{ contract: any }>;
  },

  // Reject proposal (client)
  rejectProposal: async (proposalId: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/projects/proposals/${proposalId}/reject`, { reason });
    return response.data as ApiResponse<any>;
  },

  // Shortlist proposal (client)
  shortlistProposal: async (proposalId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/projects/proposals/${proposalId}/shortlist`);
    return response.data as ApiResponse<any>;
  },

  // Remove from shortlist (client)
  removeFromShortlist: async (proposalId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/projects/proposals/${proposalId}/shortlist`);
    return response.data as ApiResponse<any>;
  }
};

// Freelancer-specific proposal APIs
export const freelancerProposalApi = {
  // Get freelancer's proposals
  getFreelancerProposals: async (filters?: ProposalFilters): Promise<PaginatedResponse<{ proposals: ProposalWithProject[] }>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get(`/api/v1/projects/freelancer/proposals?${params.toString()}`);
    return response.data as PaginatedResponse<{ proposals: ProposalWithProject[] }>;
  },

  // Get proposal statistics
  getProposalStats: async (): Promise<ApiResponse<ProposalStats>> => {
    const response = await apiClient.get('/api/v1/freelancer/proposals/stats');
    return response.data as ApiResponse<ProposalStats>;
  },

  // Get proposal analytics
  getProposalAnalytics: async (proposalId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/api/v1/proposals/${proposalId}/analytics`);
    return response.data as ApiResponse<any>;
  },

  // Get proposal templates
  getProposalTemplates: async (): Promise<ApiResponse<ProposalTemplate[]>> => {
    const response = await apiClient.get('/api/v1/freelancer/proposal-templates');
    return response.data as ApiResponse<ProposalTemplate[]>;
  },

  // Create proposal template
  createProposalTemplate: async (templateData: CreateProposalTemplateData): Promise<ApiResponse<ProposalTemplate>> => {
    const response = await apiClient.post('/api/v1/freelancer/proposal-templates', templateData);
    return response.data as ApiResponse<ProposalTemplate>;
  },

  // Update proposal template
  updateProposalTemplate: async (templateId: string, templateData: Partial<CreateProposalTemplateData>): Promise<ApiResponse<ProposalTemplate>> => {
    const response = await apiClient.put(`/api/v1/freelancer/proposal-templates/${templateId}`, templateData);
    return response.data as ApiResponse<ProposalTemplate>;
  },

  // Delete proposal template
  deleteProposalTemplate: async (templateId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/freelancer/proposal-templates/${templateId}`);
    return response.data as ApiResponse<any>;
  },

  // Use template for proposal
  useTemplate: async (templateId: string): Promise<ApiResponse<ProposalTemplate>> => {
    const response = await apiClient.get(`/api/v1/freelancer/proposal-templates/${templateId}/use`);
    return response.data as ApiResponse<ProposalTemplate>;
  },

  // Get draft proposals
  getDraftProposals: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/api/v1/freelancer/proposals/drafts');
    return response.data as ApiResponse<any[]>;
  },

  // Save proposal as draft
  saveDraft: async (draftData: Partial<CreateProposalData>): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/freelancer/proposals/drafts', draftData);
    return response.data as ApiResponse<any>;
  },

  // Update draft proposal
  updateDraft: async (draftId: string, draftData: Partial<CreateProposalData>): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/api/v1/freelancer/proposals/drafts/${draftId}`, draftData);
    return response.data as ApiResponse<any>;
  },

  // Delete draft proposal
  deleteDraft: async (draftId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/freelancer/proposals/drafts/${draftId}`);
    return response.data as ApiResponse<any>;
  }
};

// Client-specific proposal APIs
export const clientProposalApi = {
  // Get proposals for client's projects
  getReceivedProposals: async (filters?: ProposalFilters): Promise<PaginatedResponse<{ proposals: ProposalWithFreelancer[] }>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get(`/api/v1/client/proposals?${params.toString()}`);
    return response.data as PaginatedResponse<{ proposals: ProposalWithFreelancer[] }>;
  },

  // Get recent applications
  getRecentApplications: async (limit?: number): Promise<ApiResponse<any[]>> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/api/v1/client/recent-applications${params}`);
    return response.data as ApiResponse<any[]>;
  },

  // Compare proposals
  compareProposals: async (proposalIds: string[]): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/client/proposals/compare', { proposalIds });
    return response.data as ApiResponse<any>;
  },

  // Bulk actions on proposals
  bulkProposalAction: async (actionData: BulkProposalAction): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/client/proposals/bulk-action', actionData);
    return response.data as ApiResponse<any>;
  },

  // Add notes to proposal
  addProposalNotes: async (proposalId: string, notes: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/client/proposals/${proposalId}/notes`, { notes });
    return response.data as ApiResponse<any>;
  },

  // Rate proposal
  rateProposal: async (proposalId: string, rating: number, notes?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/client/proposals/${proposalId}/rate`, { rating, notes });
    return response.data as ApiResponse<any>;
  },

  // Request clarification
  requestClarification: async (proposalId: string, questions: string[]): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/client/proposals/${proposalId}/clarification`, { questions });
    return response.data as ApiResponse<any>;
  },

  // Mark proposal as viewed
  markAsViewed: async (proposalId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/client/proposals/${proposalId}/view`);
    return response.data as ApiResponse<any>;
  },

  // Get proposal recommendations
  getProposalRecommendations: async (projectId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/api/v1/client/projects/${projectId}/proposal-recommendations`);
    return response.data as ApiResponse<any[]>;
  }
};

// Helper functions for components
export const submitProposal = async (projectId: string, proposalData: any) => {
  try {
    const response = await proposalApi.submitProposal({
      projectId,
      ...proposalData
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export { proposalApi as default };
