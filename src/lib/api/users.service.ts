import { apiClient } from './client';
import {
  UpdateProfileRequest,
  IUser,
  IApiResponse,
  PaginatedApiResponse,
  UserFilters,
  IPaginationOptions
} from '../types';

export interface FreelancerProfile {
  title?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  experience?: string;
  availability?: string;
}

export interface ClientProfile {
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  description?: string;
}

export class UsersService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<IUser> {
    return apiClient.get('/auth/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<IApiResponse<{ user: IUser }>> {
    return apiClient.put('/users/profile', data);
  }

  /**
   * Update freelancer profile
   */
  async updateFreelancerProfile(data: FreelancerProfile): Promise<IApiResponse> {
    return apiClient.put('/users/freelancer-profile', data);
  }

  /**
   * Update client profile
   */
  async updateClientProfile(data: ClientProfile): Promise<IApiResponse> {
    return apiClient.put('/users/client-profile', data);
  }

  /**
   * Get freelancers with filtering
   */
  async getFreelancers(
    filters?: UserFilters & IPaginationOptions & {
      minRate?: number;
      maxRate?: number;
    }
  ): Promise<PaginatedApiResponse<IUser>> {
    const params = new URLSearchParams();
    
    if (filters?.skills?.length) {
      params.append('skills', filters.skills.join(','));
    }
    if (filters?.experienceLevel?.length) {
      params.append('experience', filters.experienceLevel.join(','));
    }
    if (filters?.location) {
      params.append('location', filters.location);
    }
    if (filters?.minRate) {
      params.append('minRate', filters.minRate.toString());
    }
    if (filters?.maxRate) {
      params.append('maxRate', filters.maxRate.toString());
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    return apiClient.getPublic(`/users/freelancers?${params.toString()}`);
  }

  /**
   * Get clients
   */
  async getClients(pagination?: IPaginationOptions): Promise<PaginatedApiResponse<IUser>> {
    return apiClient.getPublic('/users/clients', pagination);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IUser> {
    return apiClient.get(`/users/${id}`);
  }

  /**
   * Follow a user
   */
  async followUser(id: string): Promise<IApiResponse> {
    return apiClient.post(`/users/${id}/follow`);
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(id: string): Promise<IApiResponse> {
    return apiClient.delete(`/users/${id}/follow`);
  }

  /**
   * Get user followers
   */
  async getUserFollowers(id: string): Promise<IUser[]> {
    return apiClient.getPublic(`/users/${id}/followers`);
  }

  /**
   * Get users followed by user
   */
  async getUserFollowing(id: string): Promise<IUser[]> {
    return apiClient.getPublic(`/users/${id}/following`);
  }

  /**
   * Get freelancer dashboard
   */
  async getDashboard(): Promise<{
    activeProjects: number;
    totalEarnings: number;
    completedProjects: number;
    averageRating: number;
  }> {
    return apiClient.get('/users/dashboard');
  }
}

export const usersService = new UsersService();