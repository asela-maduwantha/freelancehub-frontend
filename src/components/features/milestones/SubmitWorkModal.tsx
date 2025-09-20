import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../../ui/Card';
import Button from '../../ui/Button';
import { milestoneApi, Deliverable } from '../../../lib/api/milestones';

interface SubmitWorkModalProps {
  milestoneId: string;
  milestoneTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const SubmitWorkModal: React.FC<SubmitWorkModalProps> = ({
  milestoneId,
  milestoneTitle,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedDeliverables, setUploadedDeliverables] = useState<Deliverable[]>([]);
  const [submissionNote, setSubmissionNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedFile = (index: number) => {
    setUploadedDeliverables(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(file => 
        milestoneApi.uploadFile(file, `Milestone deliverable: ${file.name}`)
      );
      const uploadResults = await Promise.all(uploadPromises);
      
      setUploadedDeliverables(prev => [...prev, ...uploadResults]);
      setFiles([]); // Clear selected files after upload
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (uploadedDeliverables.length === 0) {
      setError('At least one deliverable is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await milestoneApi.submitWork(milestoneId, {
        deliverables: uploadedDeliverables,
        submissionNote: submissionNote.trim() || 'Work completed'
      });
      
      onSubmit();
      onClose();
      
      // Reset form
      setFiles([]);
      setUploadedDeliverables([]);
      setSubmissionNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit work');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card variant="default">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Submit Work</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mt-2">Milestone: {milestoneTitle}</p>
          </CardHeader>

          <CardBody>
            <div className="space-y-6">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Deliverables *
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Click to select files or drag and drop
                    </span>
                  </label>
                </div>

                {/* Selected Files */}
                {files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={uploadFiles}
                      disabled={uploading}
                      className="mt-2"
                    >
                      {uploading ? 'Uploading...' : 'Upload Files'}
                    </Button>
                  </div>
                )}

                {/* Uploaded Files */}
                {uploadedDeliverables.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Deliverables:</h4>
                    <div className="space-y-2">
                      {uploadedDeliverables.map((deliverable, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-700">{deliverable.filename}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{formatFileSize(deliverable.size)}</span>
                            <button
                              onClick={() => removeUploadedFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submission Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Note
                </label>
                <textarea
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="Describe your work and any additional notes..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>

          <CardFooter>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting || uploadedDeliverables.length === 0}
              >
                {submitting ? 'Submitting...' : 'Submit Work'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SubmitWorkModal;