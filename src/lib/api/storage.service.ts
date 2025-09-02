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
}

export const storageService = new StorageService();