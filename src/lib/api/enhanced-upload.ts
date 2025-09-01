// Enhanced File Upload API functions

import { apiClient } from './client';

export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    url: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    folder: string;
    uploadedBy: string;
    uploadedAt: string;
  };
}

export interface MultipleFileUploadResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    url: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    folder: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
}

export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  folder: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  associatedEntity?: {
    type: 'project' | 'proposal' | 'contract' | 'profile' | 'dispute';
    id: string;
    name: string;
  };
}

export interface FileListResponse {
  success: boolean;
  data: FileMetadata[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Enhanced File Upload API functions
export const enhancedUploadAPI = {
  // Upload single file with metadata
  async uploadFile(
    file: File,
    folder: string = 'general',
    metadata?: {
      associatedEntity?: {
        type: 'project' | 'proposal' | 'contract' | 'profile' | 'dispute';
        id: string;
        name: string;
      };
      description?: string;
      tags?: string[];
    }
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    if (metadata) {
      if (metadata.associatedEntity) {
        formData.append('associatedEntityType', metadata.associatedEntity.type);
        formData.append('associatedEntityId', metadata.associatedEntity.id);
        formData.append('associatedEntityName', metadata.associatedEntity.name);
      }
      if (metadata.description) {
        formData.append('description', metadata.description);
      }
      if (metadata.tags && metadata.tags.length > 0) {
        formData.append('tags', JSON.stringify(metadata.tags));
      }
    }

    return apiClient.upload('/files/upload/single', formData);
  },

  // Upload multiple files with metadata
  async uploadFiles(
    files: File[],
    folder: string = 'general',
    metadata?: {
      associatedEntity?: {
        type: 'project' | 'proposal' | 'contract' | 'profile' | 'dispute';
        id: string;
        name: string;
      };
      description?: string;
      tags?: string[];
    }
  ): Promise<MultipleFileUploadResponse> {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append('files', file);
    });

    formData.append('folder', folder);

    if (metadata) {
      if (metadata.associatedEntity) {
        formData.append('associatedEntityType', metadata.associatedEntity.type);
        formData.append('associatedEntityId', metadata.associatedEntity.id);
        formData.append('associatedEntityName', metadata.associatedEntity.name);
      }
      if (metadata.description) {
        formData.append('description', metadata.description);
      }
      if (metadata.tags && metadata.tags.length > 0) {
        formData.append('tags', JSON.stringify(metadata.tags));
      }
    }

    return apiClient.upload('/files/upload/multiple', formData);
  },

  // Get files by folder
  async getFilesByFolder(
    folder: string,
    page: number = 1,
    limit: number = 20
  ): Promise<FileListResponse> {
    return apiClient.get(`/files/folder/${folder}?page=${page}&limit=${limit}`);
  },

  // Get files by associated entity
  async getFilesByEntity(
    entityType: 'project' | 'proposal' | 'contract' | 'profile' | 'dispute',
    entityId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<FileListResponse> {
    return apiClient.get(`/files/entity/${entityType}/${entityId}?page=${page}&limit=${limit}`);
  },

  // Get user's uploaded files
  async getUserFiles(
    page: number = 1,
    limit: number = 20,
    folder?: string
  ): Promise<FileListResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (folder) {
      queryParams.append('folder', folder);
    }

    return apiClient.get(`/files/user?${queryParams.toString()}`);
  },

  // Delete file
  async deleteFile(fileId: string): Promise<{ message: string }> {
    return apiClient.delete(`/files/${fileId}`);
  },

  // Update file metadata
  async updateFileMetadata(
    fileId: string,
    metadata: {
      description?: string;
      tags?: string[];
      associatedEntity?: {
        type: 'project' | 'proposal' | 'contract' | 'profile' | 'dispute';
        id: string;
        name: string;
      };
    }
  ): Promise<{ message: string }> {
    return apiClient.put(`/files/${fileId}/metadata`, metadata);
  },

  // Get file download URL
  async getFileDownloadUrl(fileId: string): Promise<{ downloadUrl: string }> {
    return apiClient.get(`/files/${fileId}/download`);
  },

  // Get file preview URL (for images/documents)
  async getFilePreviewUrl(fileId: string): Promise<{ previewUrl: string }> {
    return apiClient.get(`/files/${fileId}/preview`);
  },

  // Validate file before upload
  validateFile(file: File, options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxFiles?: number;
  }): { valid: boolean; error?: string } {
    const defaultOptions = {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/zip',
        'application/x-zip-compressed'
      ],
      maxFiles: 10
    };

    const config = {
      ...defaultOptions,
      ...(options?.maxSize !== undefined && { maxSize: options.maxSize }),
      ...(options?.allowedTypes !== undefined && { allowedTypes: options.allowedTypes }),
      ...(options?.maxFiles !== undefined && { maxFiles: options.maxFiles })
    };

    // Check file size
    if (file.size > config.maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(config.maxSize / 1024 / 1024)}MB`
      };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Please upload PDF, DOC, DOCX, TXT, images, or ZIP files.'
      };
    }

    return { valid: true };
  },

  // Get file icon based on mime type
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType === 'text/plain') return '📄';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
    return '📎';
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
