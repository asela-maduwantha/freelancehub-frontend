// File API services
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

// Types for file operations
export interface FileUploadResponse {
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface SupportedTypesResponse {
  supportedTypes: string[];
  maxFileSize: number;
  maxFileSizeMB: number;
}

export interface UploadFileRequest {
  file: File;
  description?: string;
}

class FileService {
  /**
   * Upload a document file
   * @param request - The file upload request containing file and optional description
   * @returns Promise<FileUploadResponse> - The uploaded file details
   */
  async uploadDocument(request: UploadFileRequest): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', request.file);

    if (request.description) {
      formData.append('description', request.description);
    }

    return apiClient.postFormData(API_ENDPOINTS.FILES.UPLOAD_DOCUMENT, formData);
  }

  /**
   * Get supported file types and size limits
   * @returns Promise<SupportedTypesResponse> - Supported file types and limits
   */
  async getSupportedTypes(): Promise<SupportedTypesResponse> {
    return apiClient.get(API_ENDPOINTS.FILES.SUPPORTED_TYPES);
  }

  /**
   * Validate file before upload
   * @param file - The file to validate
   * @returns string | null - Error message if invalid, null if valid
   */
  validateFile(file: File): string | null {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size exceeds the maximum limit of 10MB';
    }

    // Check file type
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];

    if (!supportedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Supported types: PDF, DOC, DOCX, TXT, ZIP, JPEG, PNG, GIF`;
    }

    return null;
  }

  /**
   * Upload multiple files
   * @param files - Array of files to upload
   * @param descriptions - Optional array of descriptions for each file
   * @returns Promise<FileUploadResponse[]> - Array of uploaded file details
   */
  async uploadMultipleDocuments(
    files: File[],
    descriptions?: string[]
  ): Promise<FileUploadResponse[]> {
    const uploadPromises = files.map((file, index) => {
      const validationError = this.validateFile(file);
      if (validationError) {
        throw new Error(`File "${file.name}": ${validationError}`);
      }

      return this.uploadDocument({
        file,
        description: descriptions?.[index]
      });
    });

    return Promise.all(uploadPromises);
  }
}

export const fileService = new FileService();
export default fileService;
