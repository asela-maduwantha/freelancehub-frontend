import { api } from '../api/api-client';
import type { BaseUser, UpdateBaseProfileDto, ClientProfileDto, ClientProfile } from '../types/user';

export const UsersService = {
  getMyProfile: () => api.get<BaseUser>('/auth/profile'),
  updateMyBaseProfile: (body: UpdateBaseProfileDto) => api.put<Partial<BaseUser>>('/users/profile', body),
  createClientProfile: (body: ClientProfileDto) => api.post<{ success: true; data: ClientProfile; message: string }>(
    '/users/client-profile',
    body
  ),
  updateClientProfile: (body: Partial<ClientProfileDto>) => api.put<Partial<ClientProfile>>('/users/client-profile', body),
  upsertFreelancerProfile: (body: unknown) => api.put<any>('/users/freelancer-profile', body),
};
