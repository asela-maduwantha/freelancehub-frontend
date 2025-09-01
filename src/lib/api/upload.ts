// Upload API functions

import { apiClient } from './client';

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
  };
}

interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: Array<{
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
  }>;
}

// Upload API functions
export const uploadAPI = {
  // Upload single file
  async uploadFile(file: File, folder?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    return apiClient.upload('/storage/upload/single', formData);
  },

  // Upload multiple files
  async uploadFiles(files: File[], folder?: string): Promise<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }
    return apiClient.upload('/storage/upload/multiple', formData);
  },
};
