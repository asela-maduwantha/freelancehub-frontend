import { apiClient } from './client';
import { UploadResponse, UploadMultipleResponse } from '../types';

export class StorageService {
  /**
   * Upload a single file
   */
  async uploadSingleFile(file: File, folder?: string): Promise<UploadResponse> {
    return apiClient.uploadFile('/files/upload/single', file, folder);
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[], folder?: string): Promise<UploadMultipleResponse> {
    return apiClient.uploadFiles('/files/upload/multiple', files, folder);
  }

  /**
   * Download a file
   */
  async downloadFile(fileId: string): Promise<Blob> {
    return apiClient.downloadFile(`/files/download/${fileId}`);
  }

  /**
   * Get file preview URL
   */
  async getFilePreview(fileId: string): Promise<string> {
    const response = await apiClient.get<{ previewUrl: string }>(`/files/preview/${fileId}`);
    return response.previewUrl;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<any> {
    return apiClient.get(`/files/metadata/${fileId}`);
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    return apiClient.delete(`/files/${fileId}`);
  }
}

export const storageService = new StorageService();