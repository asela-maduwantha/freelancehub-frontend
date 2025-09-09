import { api } from '../api/api-client';

export const SavedProjectsService = {
  add: (projectId: string) => api.post<any>(`/saved-projects/${projectId}`),
  list: () => api.get<any>(`/saved-projects`),
  check: (projectId: string) => api.get<{ saved: boolean }>(`/saved-projects/check/${projectId}`),
  remove: (projectId: string) => api.delete<string>(`/saved-projects/${projectId}`),
  count: () => api.get<number>(`/saved-projects/stats/count`),
};
