// Upload API functions

import { apiClient } from './client';

// Upload API functions
export const uploadAPI = {
  // Upload file
  async uploadFile(file: File, type?: string): Promise<{ message: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (type) {
      formData.append('type', type);
    }
    return apiClient.upload('/upload', formData);
  },

  // Upload multiple files
  async uploadFiles(files: File[], type?: string): Promise<{ message: string; urls: string[] }> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    if (type) {
      formData.append('type', type);
    }
    return apiClient.upload('/upload/multiple', formData);
  },
};
