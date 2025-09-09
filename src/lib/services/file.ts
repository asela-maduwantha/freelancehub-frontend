import apiClient from '../api/api-client';
import { 
  FileUploadResponse, 
  MultipleFileUploadResponse,
  FileUploadRequest,
  MultipleFileUploadRequest,
  FileValidationResult,
  SUPPORTED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD
} from '../types/file';

export class FileService {
  
  // Validate a single file
  static validateFile(file: File): FileValidationResult {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (file.size === 0) {
      return { isValid: false, error: 'Empty file not allowed' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    }

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Supported types: JPEG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP, RAR' };
    }

    return { isValid: true };
  }

  // Validate multiple files
  static validateFiles(files: File[]): FileValidationResult {
    if (!files || files.length === 0) {
      return { isValid: false, error: 'No files provided' };
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      return { isValid: false, error: `Maximum ${MAX_FILES_PER_UPLOAD} files allowed` };
    }

    for (const file of files) {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { isValid: false, error: `${file.name}: ${validation.error}` };
      }
    }

    return { isValid: true };
  }

  // Upload a single file
  static async uploadSingle({ file, folder = 'general' }: FileUploadRequest): Promise<FileUploadResponse> {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

  const response = await apiClient.post('/files/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  return response.data.data;
  }

  // Upload multiple files
  static async uploadMultiple({ files, folder = 'general' }: MultipleFileUploadRequest): Promise<MultipleFileUploadResponse> {
    const validation = this.validateFiles(files);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

  const response = await apiClient.post('/files/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  return response.data.data;
  }

  // Upload file with progress tracking
  static async uploadWithProgress(
    { file, folder = 'general' }: FileUploadRequest,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

  const response = await apiClient.post('/files/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(progress);
        }
      },
    });
  return response.data.data;
  }

  // Get file extension from filename
  static getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Check if file is image
  static isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Create preview URL for images
  static createPreviewUrl(file: File): string {
    if (this.isImage(file)) {
      return URL.createObjectURL(file);
    }
    return '';
  }
}
