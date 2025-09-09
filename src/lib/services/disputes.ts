import { api } from '../api/api-client';
import type { CreateDisputeDto, DisputeItem } from '../types/disputes';

export const DisputesService = {
  create: (body: CreateDisputeDto) => api.post<DisputeItem>('/disputes', body),
  list: () => api.get<DisputeItem[]>('/disputes'),
  getById: (id: string) => api.get<DisputeItem>(`/disputes/${id}`),
  addEvidence: (id: string, body: { description?: string; files?: string[] }) =>
    api.post<any>(`/disputes/${id}/evidence`, body),
  addMessage: (id: string, body: { message: string }) => api.post<any>(`/disputes/${id}/messages`, body),
  updateStatus: (id: string, body: { status: string }) => api.put<any>(`/disputes/${id}/status`, body),
  resolve: (id: string, body?: { resolution?: string }) => api.post<any>(`/disputes/${id}/resolve`, body),
  listAdminOpen: () => api.get<any>(`/disputes/admin/open`),
};
