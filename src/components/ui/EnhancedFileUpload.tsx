'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  FileText,
  Image,
  File,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { enhancedUploadAPI, FileMetadata } from '@/lib/api/enhanced-upload';

interface FileUploadProps {
  onFilesUploaded?: (files: FileMetadata[]) => void;
  onFileRemoved?: (fileId: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  folder?: string;
  associatedEntity?: {
    type: 'project' | 'proposal' | 'contract' | 'profile' | 'dispute';
    id: string;
    name: string;
  };
  entityType?: 'project' | 'proposal' | 'contract' | 'profile' | 'dispute';
  entityId?: string;
  showPreview?: boolean;
  showDownload?: boolean;
  showDelete?: boolean;
  className?: string;
  disabled?: boolean;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  uploadedFile?: FileMetadata;
}

export default function EnhancedFileUpload({
  onFilesUploaded,
  onFileRemoved,
  maxFiles = 5,
  maxSize = 10, // MB
  allowedTypes,
  folder = 'general',
  associatedEntity,
  entityType,
  entityId,
  showPreview = true,
  showDownload = true,
  showDelete = true,
  className = '',
  disabled = false
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    return enhancedUploadAPI.validateFile(file, {
      maxSize: maxSize * 1024 * 1024,
      allowedTypes
    });
  }, [maxSize, allowedTypes]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || disabled) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    // Check total file count
    if (uploadedFiles.length + validFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    if (validFiles.length === 0) return;

    setError(null);

    // Initialize upload progress
    const initialProgress: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...initialProgress]);

    try {
      // Determine associated entity
      const finalAssociatedEntity = associatedEntity || (entityType && entityId ? {
        type: entityType,
        id: entityId,
        name: `${entityType} ${entityId}`
      } : undefined);

      // Upload files
      const uploadResponse = await enhancedUploadAPI.uploadFiles(
        validFiles,
        folder,
        {
          associatedEntity: finalAssociatedEntity,
          description: 'Uploaded via enhanced file upload component'
        }
      );

      if (uploadResponse.success) {
        const newUploadedFiles = uploadResponse.data;
        setUploadedFiles(prev => [...prev, ...newUploadedFiles]);

        // Update progress to completed
        setUploadProgress(prev =>
          prev.map(progress => {
            const uploadedFile = newUploadedFiles.find(f => f.originalName === progress.file.name);
            return uploadedFile
              ? { ...progress, status: 'completed', progress: 100, uploadedFile }
              : progress;
          })
        );

        // Notify parent component
        onFilesUploaded?.(newUploadedFiles);
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
      setError(err.message || 'Failed to upload files');

      // Update progress to error
      setUploadProgress(prev =>
        prev.map(progress => ({ ...progress, status: 'error', error: err.message }))
      );
    }
  }, [disabled, validateFile, uploadedFiles.length, maxFiles, folder, associatedEntity, onFilesUploaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(async (fileId: string) => {
    try {
      await enhancedUploadAPI.deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      onFileRemoved?.(fileId);
    } catch (err: any) {
      console.error('Failed to delete file:', err);
      setError('Failed to delete file');
    }
  }, [onFileRemoved]);

  const handleDownloadFile = useCallback(async (file: FileMetadata) => {
    try {
      const response = await enhancedUploadAPI.getFileDownloadUrl(file.id);
      window.open(response.downloadUrl, '_blank');
    } catch (err: any) {
      console.error('Failed to get download URL:', err);
      setError('Failed to download file');
    }
  }, []);

  const handlePreviewFile = useCallback(async (file: FileMetadata) => {
    try {
      const response = await enhancedUploadAPI.getFilePreviewUrl(file.id);
      window.open(response.previewUrl, '_blank');
    } catch (err: any) {
      console.error('Failed to get preview URL:', err);
      setError('Failed to preview file');
    }
  }, []);

  const getFileIcon = (file: FileMetadata) => {
    if (file.mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (file.mimeType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    if (file.mimeType.includes('word') || file.mimeType.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (file.mimeType.includes('zip') || file.mimeType.includes('compressed')) return <File className="h-5 w-5 text-yellow-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const isUploading = uploadProgress.some(p => p.status === 'uploading');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          accept={allowedTypes?.join(',')}
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            {isUploading ? (
              <Loader className="h-12 w-12 text-blue-500 animate-spin" />
            ) : (
              <Upload className={`h-12 w-12 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
            )}
          </div>

          <div>
            <p className={`text-lg font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
              {isUploading ? 'Uploading files...' : 'Drop files here or click to upload'}
            </p>
            <p className={`text-sm mt-1 ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
              Maximum {maxFiles} files, up to {maxSize}MB each
            </p>
            {allowedTypes && (
              <p className={`text-xs mt-1 ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
                Supported: {allowedTypes.map(type => type.split('/')[1]).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div className="text-red-800 text-sm whitespace-pre-line">{error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploadProgress.map((progress, index) => (
              <motion.div
                key={`${progress.file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getFileIcon({ mimeType: progress.file.type } as FileMetadata)}
                    <span className="ml-2 font-medium text-gray-900">{progress.file.name}</span>
                  </div>
                  <div className="flex items-center">
                    {progress.status === 'uploading' && (
                      <Loader className="h-4 w-4 text-blue-500 animate-spin mr-2" />
                    )}
                    {progress.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    {progress.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="text-sm text-gray-500">
                      {progress.status === 'uploading' && `${progress.progress}%`}
                      {progress.status === 'completed' && 'Completed'}
                      {progress.status === 'error' && 'Failed'}
                    </span>
                  </div>
                </div>

                {progress.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {progress.error && (
                  <p className="text-red-600 text-sm mt-1">{progress.error}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h4>

            {uploadedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{file.originalName}</p>
                      <p className="text-sm text-gray-500">
                        {enhancedUploadAPI.formatFileSize(file.size)} •
                        Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {showPreview && file.mimeType.startsWith('image/') && (
                      <button
                        onClick={() => handlePreviewFile(file)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}

                    {showDownload && (
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}

                    {showDelete && (
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
