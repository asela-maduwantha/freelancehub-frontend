import { api } from '../api/api-client';

export const FreelancersService = {
  createProfileAlt: (body: any) => api.post<any>('/freelancers/profile', body),
  dashboard: () => api.get<{ totalProjects: number; activeProjects: number; completedProjects: number; totalEarned: number }>(
    '/freelancers/dashboard'
  ),
};
