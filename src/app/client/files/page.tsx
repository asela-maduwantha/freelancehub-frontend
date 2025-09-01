'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import EnhancedFileUpload from '@/components/ui/EnhancedFileUpload';
import { motion } from 'framer-motion';
import {
  Folder,
  FileText,
  Image,
  File,
  Search,
  Filter,
  Upload,
  Download,
  Share,
  Trash2,
  ArrowLeft,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Eye,
  MoreVertical,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { enhancedUploadAPI, FileMetadata } from '@/lib/api/enhanced-upload';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'size' | 'date' | 'type';
type SortOrder = 'asc' | 'desc';

interface FileFilters {
  folder?: string;
  entityType?: 'project' | 'proposal' | 'contract' | 'profile' | 'dispute';
  entityId?: string;
  search?: string;
  fileType?: string;
}

function FileManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FileFilters>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [files, searchQuery, filters, sortBy, sortOrder]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (currentFolder === 'all') {
        response = await enhancedUploadAPI.getUserFiles(1, 100);
      } else if (currentFolder.startsWith('entity-')) {
        const [_, entityType, entityId] = currentFolder.split('-');
        response = await enhancedUploadAPI.getFilesByEntity(
          entityType as any,
          entityId,
          1,
          100
        );
      } else {
        response = await enhancedUploadAPI.getFilesByFolder(currentFolder, 1, 100);
      }

      if (response.success) {
        setFiles(response.data);
      } else {
        throw new Error('Failed to load files');
      }
    } catch (err: any) {
      console.error('Failed to load files:', err);
      setError(err.message || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...files];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.filename.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply folder/entity filter
    if (filters.folder && filters.folder !== 'all') {
      filtered = filtered.filter(file => file.folder === filters.folder);
    }

    if (filters.entityType) {
      filtered = filtered.filter(file =>
        file.associatedEntity?.type === filters.entityType
      );
    }

    if (filters.fileType) {
      filtered = filtered.filter(file => file.mimeType.includes(filters.fileType!));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.originalName.toLowerCase();
          bValue = b.originalName.toLowerCase();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'date':
          aValue = new Date(a.uploadedAt).getTime();
          bValue = new Date(b.uploadedAt).getTime();
          break;
        case 'type':
          aValue = a.mimeType;
          bValue = b.mimeType;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredFiles(filtered);
  };

  const handleFilesUploaded = (uploadedFiles: FileMetadata[]) => {
    setFiles(prev => [...uploadedFiles, ...prev]);
    setShowUploadModal(false);
    setSuccess(`${uploadedFiles.length} file(s) uploaded successfully`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleFileRemoved = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;

    try {
      const deletePromises = Array.from(selectedFiles).map(fileId =>
        enhancedUploadAPI.deleteFile(fileId)
      );

      await Promise.all(deletePromises);

      setFiles(prev => prev.filter(file => !selectedFiles.has(file.id)));
      setSelectedFiles(new Set());
      setSuccess(`${selectedFiles.size} file(s) deleted successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to delete files:', err);
      setError('Failed to delete some files');
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedFiles.size === 0) return;

    try {
      const downloadPromises = Array.from(selectedFiles).map(async (fileId) => {
        const file = files.find(f => f.id === fileId);
        if (file) {
          const response = await enhancedUploadAPI.getFileDownloadUrl(fileId);
          // Create a temporary link to download the file
          const link = document.createElement('a');
          link.href = response.downloadUrl;
          link.download = file.originalName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });

      await Promise.all(downloadPromises);
    } catch (err: any) {
      console.error('Failed to download files:', err);
      setError('Failed to download some files');
    }
  };

  const handleFileClick = (file: FileMetadata) => {
    if (selectedFiles.has(file.id)) {
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    } else {
      setSelectedFiles(prev => new Set(prev).add(file.id));
    }
  };

  const getFileIcon = (file: FileMetadata) => {
    if (file.mimeType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (file.mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    if (file.mimeType.includes('word') || file.mimeType.includes('document')) return <FileText className="h-8 w-8 text-blue-600" />;
    if (file.mimeType.includes('zip') || file.mimeType.includes('compressed')) return <File className="h-8 w-8 text-yellow-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
    if (mimeType === 'text/plain') return 'Text';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'Archive';
    return 'File';
  };

  const folders = [
    { id: 'all', name: 'All Files', icon: <Folder className="h-5 w-5" /> },
    { id: 'projects', name: 'Projects', icon: <Folder className="h-5 w-5 text-blue-500" /> },
    { id: 'proposals', name: 'Proposals', icon: <Folder className="h-5 w-5 text-green-500" /> },
    { id: 'contracts', name: 'Contracts', icon: <Folder className="h-5 w-5 text-purple-500" /> },
    { id: 'disputes', name: 'Disputes', icon: <Folder className="h-5 w-5 text-red-500" /> },
    { id: 'profile', name: 'Profile', icon: <Folder className="h-5 w-5 text-yellow-500" /> },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/client/dashboard"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">File Management</h1>
                <p className="text-gray-600 font-inter">Manage and organize your uploaded files</p>
              </div>
            </div>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 hover:bg-green-700 font-poppins"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 font-poppins">Folders</h3>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setCurrentFolder(folder.id);
                      setFilters(prev => ({ ...prev, folder: folder.id === 'all' ? undefined : folder.id }));
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      currentFolder === folder.id
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {folder.icon}
                    <span className="ml-3 font-medium">{folder.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
                    />
                  </div>

                  {/* Sort */}
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-') as [SortBy, SortOrder];
                      setSortBy(newSortBy);
                      setSortOrder(newSortOrder);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="size-desc">Largest First</option>
                    <option value="size-asc">Smallest First</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedFiles.size > 0 && (
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    {selectedFiles.size} file(s) selected
                  </span>
                  <Button
                    onClick={handleDownloadSelected}
                    variant="outline"
                    size="sm"
                    className="font-inter"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={handleDeleteSelected}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50 font-inter"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Files Display */}
            {filteredFiles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No files found' : 'No files uploaded yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Upload your first file to get started'
                  }
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-green-600 hover:bg-green-700 font-poppins"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                )}
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
                      selectedFiles.has(file.id) ? 'ring-2 ring-green-500 border-green-500' : ''
                    }`}
                    onClick={() => handleFileClick(file)}
                  >
                    {viewMode === 'grid' ? (
                      // Grid View
                      <div className="p-6">
                        <div className="flex items-center justify-center mb-4">
                          {getFileIcon(file)}
                        </div>
                        <div className="text-center">
                          <h4 className="font-medium text-gray-900 mb-1 truncate" title={file.originalName}>
                            {file.originalName}
                          </h4>
                          <p className="text-sm text-gray-500 mb-2">
                            {enhancedUploadAPI.formatFileSize(file.size)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                          {file.associatedEntity && (
                            <p className="text-xs text-blue-600 mt-1">
                              {file.associatedEntity.type}: {file.associatedEntity.name}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div className="p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate" title={file.originalName}>
                              {file.originalName}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span>{getFileTypeLabel(file.mimeType)}</span>
                              <span>{enhancedUploadAPI.formatFileSize(file.size)}</span>
                              <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                              {file.associatedEntity && (
                                <span className="text-blue-600">
                                  {file.associatedEntity.type}: {file.associatedEntity.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle preview/download
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle download
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-poppins">Upload Files</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>

              <EnhancedFileUpload
                onFilesUploaded={handleFilesUploaded}
                folder={currentFolder === 'all' ? 'general' : currentFolder}
                maxFiles={10}
                maxSize={10}
                showPreview={true}
                showDownload={false}
                showDelete={false}
              />

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setShowUploadModal(false)}
                  variant="outline"
                  className="font-inter"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default function FileManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <FileManagementContent />
    </Suspense>
  );
}
