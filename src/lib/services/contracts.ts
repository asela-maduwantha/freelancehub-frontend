import apiClient, { api } from '../api/api-client';
import type {
  CreateContractDto,
  UpdateMilestoneDto,
  SubmitMilestoneDto,
  ApproveMilestoneDto,
  RejectMilestoneDto,
  DefaultPaymentMethodResult,
} from '../types/contracts';

export const ContractsService = {
  create: (body: CreateContractDto) => api.post<any>('/contracts', body),
  createFromProposal: (proposalId: string) => api.post<any>(`/contracts/from-proposal/${proposalId}`),
  list: () => api.get<any>('/contracts'),
  listByProject: (projectId: string) => api.get<any>(`/contracts/projects/${projectId}`),
  getById: (id: string) => api.get<any>(`/contracts/${id}`),
  updateMilestone: (id: string, milestoneId: string, body: UpdateMilestoneDto) =>
    api.put<{ message: string }>(`/contracts/${id}/milestones/${milestoneId}`, body),
  submitMilestone: (id: string, milestoneId: string, body: SubmitMilestoneDto) =>
    api.post<{ message: string }>(`/contracts/${id}/milestones/${milestoneId}/submit`, body),
  approveMilestone: (id: string, milestoneId: string, body: ApproveMilestoneDto) =>
    api.put<{ message: string }>(`/contracts/${id}/milestones/${milestoneId}/approve`, body),
  setupMilestonePayment: (id: string, milestoneId: string) =>
    api.get<
      | { hasSavedCards: true; paymentMethods: Array<{ id: string; type: string; last4: string; brand: string; isDefault?: boolean }>; requiresSetup: false }
      | { hasSavedCards: false; setupIntent: { clientSecret: string; id: string }; requiresSetup: true }
    >(`/contracts/${id}/milestones/${milestoneId}/setup-payment`),
  rejectMilestone: (id: string, milestoneId: string, body: RejectMilestoneDto) =>
    api.post<{ message: string }>(`/contracts/${id}/milestones/${milestoneId}/reject`, body),
  getDefaultPaymentMethod: () => api.get<DefaultPaymentMethodResult>(`/contracts/payment-methods/default`),
  complete: (id: string) => api.post<{ message: string }>(`/contracts/${id}/complete`),
  cancel: (id: string, reason?: string) => api.post<{ message: string }>(`/contracts/${id}/cancel`, { reason }),
  approveClient: (id: string) => api.post<{ message: string }>(`/contracts/${id}/approve/client`),
  approveFreelancer: (id: string) => api.post<{ message: string }>(`/contracts/${id}/approve/freelancer`),
  freelancerView: (id: string) => api.get<any>(`/contracts/${id}/freelancer-view`),
  downloadPdf: async (id: string) => {
    const res = await apiClient.get(`/contracts/${id}/download-pdf`, { responseType: 'blob' });
    return res.data as Blob;
  },
  signAsClient: (id: string) => api.post<{ message: string }>(`/contracts/${id}/sign/client`),
  signAsFreelancer: (id: string) => api.post<{ message: string }>(`/contracts/${id}/sign/freelancer`),
};
