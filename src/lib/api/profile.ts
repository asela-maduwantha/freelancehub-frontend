// Profile API service
import { apiClient } from './client';
import {
  CompleteUserProfile,
  UpdateGeneralProfileRequest,
  UpdateFreelancerProfileRequest,
  AddSkillsRequest,
  AddPortfolioItemRequest,
  UpdatePortfolioItemRequest,
  AddEducationRequest,
  UpdateEducationRequest,
  AddCertificationRequest,
  UpdateCertificationRequest,
  UserSettings,
  UpdateUserSettingsRequest,
  ApiSuccessResponse,
  UploadAvatarResponse,
} from '../../types/profile';

export const profileApi = {
  // Get current user profile
  getCurrentProfile: async (): Promise<CompleteUserProfile> => {
    return await apiClient.get('/users/me');
  },

  // Update general profile
  updateGeneralProfile: async (data: UpdateGeneralProfileRequest): Promise<CompleteUserProfile> => {
    return await apiClient.put('/users/me', data);
  },

  // Update freelancer-specific profile
  updateFreelancerProfile: async (data: UpdateFreelancerProfileRequest): Promise<CompleteUserProfile> => {
    return await apiClient.put('/users/freelancer/profile', data);
  },

  // Skills
  addSkills: async (data: AddSkillsRequest): Promise<ApiSuccessResponse> => {
    return await apiClient.post('/users/freelancer/skills', data);
  },

  removeSkill: async (skill: string): Promise<ApiSuccessResponse> => {
    return await apiClient.delete(`/users/freelancer/skills/${encodeURIComponent(skill)}`);
  },

  // Portfolio
  addPortfolioItem: async (data: AddPortfolioItemRequest): Promise<ApiSuccessResponse> => {
    return await apiClient.post('/users/freelancer/portfolio', data);
  },

  updatePortfolioItem: async (id: string, data: UpdatePortfolioItemRequest): Promise<ApiSuccessResponse> => {
    return await apiClient.put(`/users/freelancer/portfolio/${id}`, data);
  },

  deletePortfolioItem: async (id: string): Promise<ApiSuccessResponse> => {
    return await apiClient.delete(`/users/freelancer/portfolio/${id}`);
  },

  // Education
  addEducation: async (data: AddEducationRequest): Promise<ApiSuccessResponse> => {
    return await apiClient.post('/users/freelancer/education', data);
  },

  updateEducation: async (id: string, data: UpdateEducationRequest): Promise<ApiSuccessResponse> => {
    return await apiClient.put(`/users/freelancer/education/${id}`, data);
  },

  deleteEducation: async (id: string): Promise<ApiSuccessResponse> => {
    return await apiClient.delete(`/users/freelancer/education/${id}`);
  },

  // Certifications
  addCertification: async (data: AddCertificationRequest): Promise<ApiSuccessResponse> => {
    return await apiClient.post('/users/freelancer/certification', data);
  },

  updateCertification: async (id: string, data: UpdateCertificationRequest): Promise<ApiSuccessResponse> => {
    return await apiClient.put(`/users/freelancer/certification/${id}`, data);
  },

  deleteCertification: async (id: string): Promise<ApiSuccessResponse> => {
    return await apiClient.delete(`/users/freelancer/certification/${id}`);
  },

  // User settings
  getUserSettings: async (): Promise<UserSettings> => {
    return await apiClient.get('/users/settings');
  },

  updateUserSettings: async (data: UpdateUserSettingsRequest): Promise<ApiSuccessResponse> => {
    return await apiClient.put('/users/settings', data);
  },

  // Avatar upload
  uploadAvatar: async (file: File): Promise<UploadAvatarResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await apiClient.postFormData('/users/upload-avatar', formData);
  },
};
