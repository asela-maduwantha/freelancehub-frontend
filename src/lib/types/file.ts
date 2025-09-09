// File upload related types

export interface FileUploadResponse {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export type MultipleFileUploadResponse = Array<FileUploadResponse>;

export interface FileUploadRequest {
  file: File;
  folder?: string;
}

export interface MultipleFileUploadRequest {
  files: File[];
  folder?: string;
}

// Supported file types and limits
export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_UPLOAD = 5;

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// File upload progress
export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}
