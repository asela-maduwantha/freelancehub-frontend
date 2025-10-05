import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { UpdateProfileRequest } from '@/types/api';

export const userApi = {
  updateProfile: async (data: UpdateProfileRequest) => {
    return apiClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
  },

  getProfile: async () => {
    return apiClient.get(API_ENDPOINTS.USERS.PROFILE);
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.postFormData(API_ENDPOINTS.USERS.UPLOAD_AVATAR, formData);
  },
};