'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FileService } from '@/lib/services/file';
import { FileUploadProgress } from '@/lib/types/file';

interface FileUploadProps {
  onUpload: (urls: string[]) => void;
  multiple?: boolean;
  accept?: string;
  folder?: string;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

export default function FileUpload({
  onUpload,
  multiple = false,
  accept = 'image/*,.pdf,.doc,.docx',
  folder = 'general',
  maxFiles = 5,
  className = '',
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || disabled) return;

    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];

    // Validate each file
    fileArray.forEach(file => {
      const validation = FileService.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        // Show error for invalid files
        setUploadProgress(prev => [...prev, {
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: validation.error
        }]);
      }
    });

    if (multiple) {
      const totalFiles = files.length + validFiles.length;
      if (totalFiles > maxFiles) {
        const allowedFiles = validFiles.slice(0, maxFiles - files.length);
        setFiles(prev => [...prev, ...allowedFiles]);
      } else {
        setFiles(prev => [...prev, ...validFiles]);
      }
    } else {
      setFiles(validFiles.slice(0, 1));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadProgress(files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    })));

    try {
      const uploadPromises = files.map(async (file, index) => {
        try {
          const response = await FileService.uploadWithProgress(
            { file, folder },
            (progress) => {
              setUploadProgress(prev => 
                prev.map((item, i) => 
                  i === index ? { ...item, progress } : item
                )
              );
            }
          );

          setUploadProgress(prev => 
            prev.map((item, i) => 
              i === index ? { ...item, status: 'completed' as const, progress: 100 } : item
            )
          );

          return response.url;
        } catch (error) {
          setUploadProgress(prev => 
            prev.map((item, i) => 
              i === index ? { 
                ...item, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Upload failed' 
              } : item
            )
          );
          throw error;
        }
      });

      const urls = await Promise.all(uploadPromises);
      onUpload(urls.filter(Boolean));
      
      // Clear files after successful upload
      setFiles([]);
      setTimeout(() => setUploadProgress([]), 2000);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (FileService.isImage(file)) {
      return <Image className="w-6 h-6 text-blue-500" />;
    }
    return <File className="w-6 h-6 text-gray-500" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-green-500 bg-green-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-green-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
        />

        <div className="text-center">
          <Upload className={`w-12 h-12 mx-auto mb-4 ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          }`} />
          <p className={`text-lg font-medium mb-2 ${
            disabled ? 'text-gray-400' : 'text-gray-700'
          }`}>
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className={`text-sm mb-4 ${
            disabled ? 'text-gray-300' : 'text-gray-500'
          }`}>
            or click to browse your files
          </p>
          <p className={`text-xs ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          }`}>
            Supports: Images, PDF, DOC, DOCX (Max {FileService.formatFileSize(10 * 1024 * 1024)})
          </p>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => {
              const progress = uploadProgress[index];
              return (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {getFileIcon(file)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {FileService.formatFileSize(file.size)}
                    </p>
                    
                    {/* Progress Bar */}
                    {progress && progress.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {progress && progress.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1">{progress.error}</p>
                    )}
                  </div>
                  
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {progress?.status === 'uploading' && (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    {progress?.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {progress?.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    {!progress && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {files.length > 0 && !isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button
            onClick={uploadFiles}
            disabled={isUploading || files.length === 0}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
