"use client";
import { useState, useRef, useCallback } from 'react';
import { Upload, X, Eye, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
  error?: string;
}

interface ImageUploaderProps {
  value: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxSizeKB?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

const ImageUploader = ({
  value,
  onChange,
  maxImages = 10,
  maxSizeKB = 5000, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  disabled = false,
  className
}: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Please upload only image files (JPEG, PNG, WebP)';
    }
    
    if (file.size > maxSizeKB * 1024) {
      return `File size must be less than ${Math.round(maxSizeKB / 1024)}MB`;
    }
    
    return null;
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - value.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);
    
    const newImages: ImageFile[] = [];
    
    filesToProcess.forEach((file) => {
      const error = validateFile(file);
      const id = generateId();
      
      if (error) {
        newImages.push({
          id,
          file,
          preview: '',
          error
        });
      } else {
        const preview = URL.createObjectURL(file);
        newImages.push({
          id,
          file,
          preview
        });
      }
    });
    
    onChange([...value, ...newImages]);
  }, [value, maxImages, maxSizeKB, acceptedTypes, onChange]);

  const removeImage = (id: string) => {
    const imageToRemove = value.find(img => img.id === id);
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onChange(value.filter(img => img.id !== id));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || value.length >= maxImages) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  }, [disabled, value.length, maxImages, processFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const openFileDialog = () => {
    if (!disabled && value.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  const canUploadMore = value.length < maxImages && !disabled;

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={clsx(
            'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            {
              'border-blue-500 bg-blue-50': dragActive,
              'border-gray-300 hover:border-gray-400': !dragActive && !disabled,
              'border-gray-200 bg-gray-50 cursor-not-allowed': disabled,
            }
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="space-y-2">
            <Upload className={clsx(
              'mx-auto h-8 w-8',
              dragActive ? 'text-blue-500' : 'text-gray-400'
            )} />
            
            <div>
              <p className="text-sm font-medium text-gray-900">
                {dragActive ? 'Drop images here' : 'Upload images'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to browse
              </p>
            </div>
            
            <p className="text-xs text-gray-400">
              {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} • 
              Max {Math.round(maxSizeKB / 1024)}MB each • 
              {maxImages - value.length} remaining
            </p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {image.error ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-red-500 p-2">
                    <AlertCircle className="w-6 h-6 mb-1" />
                    <p className="text-xs text-center">{image.error}</p>
                  </div>
                ) : (
                  <>
                    <img
                      src={image.preview || image.url}
                      alt={`Upload ${image.id}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open preview modal or larger view
                          }}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
                          }}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Upload Status */}
              {image.uploaded && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {value.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {value.length} of {maxImages} images selected
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
