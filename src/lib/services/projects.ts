import { api } from '../api/api-client';
import type {
  ProjectListItem,
  ProjectListQuery,
  CreateProjectDto,
  ProjectDetail,
  ProposalListItem,
  SubmitProposalDto,
} from '../types/projects';

export const ProjectsService = {
  list: (query?: ProjectListQuery) =>
    api.get<{ projects: ProjectListItem[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
      '/projects',
      { params: query }
    ),

  create: (body: CreateProjectDto) => api.post<ProjectDetail>('/projects', body),

  getById: (id: string) => api.get<ProjectDetail>(`/projects/${id}`),

  update: (id: string, body: Partial<CreateProjectDto>) => api.put<ProjectDetail>(`/projects/${id}`, body),

  remove: (id: string) => api.delete<string>(`/projects/${id}`),

  assignedForFreelancer: () => api.get<{ projects: ProjectListItem[]; pagination: any }>(`/projects/assigned`),

  myProposals: () => api.get<{ proposals: ProposalListItem[]; total: number; page: number; limit: number }>(
    '/projects/my-proposals'
  ),

  submitProposal: (projectId: string, body: SubmitProposalDto) =>
    api.post<{ _id: string; projectId: string; status: string }>(`/projects/${projectId}/proposals`, body),

  listProposalsForProject: (projectId: string) => api.get<ProposalListItem[]>(`/projects/${projectId}/proposals`),
};

export const ProposalsService = {
  my: () => api.get<{ proposals: ProposalListItem[]; total: number; page: number; limit: number }>(`/proposals/my`),
};

export const ClientsProjectsService = {
  projects: () => api.get<any>(`/clients/projects`),
  projectById: (id: string) => api.get<any>(`/clients/projects/${id}`),
  proposals: () => api.get<any>(`/clients/proposals`),
  projectProposals: (projectId: string) => api.get<any>(`/clients/projects/${projectId}/proposals`),
  acceptProposal: (projectId: string, proposalId: string) =>
    api.post<any>(`/clients/projects/${projectId}/proposals/${proposalId}/accept`),
  dashboard: () => api.get<any>(`/clients/dashboard`),
  submittedMilestones: () => api.get<any>(`/clients/submitted-milestones`),
};
