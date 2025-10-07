'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout';
import { Input, TextArea } from '../../../../../../components/ui/Input';
import Button from '../../../../../../components/ui/Button';
import { Alert } from '../../../../../../components/ui/Feedback';
import Loader from '../../../../../../components/ui/Feedback/Loader';
import { proposalService, CreateProposalRequest } from '../../../../../../lib/api/proposals';
import { jobService } from '../../../../../../lib/api/jobs';
import { fileService, FileUploadResponse } from '../../../../../../lib/api/files';
import Breadcrumb from '../../../../../../components/common/Breadcrumb';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  ArrowLeft,
  Calendar,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Send
} from 'lucide-react';interface JobDetails {
  id: string;
  title: string;
  description: string;
  budget: {
    type: 'fixed' | 'range';
    min: number;
    max?: number;
    currency?: string;
  };
  duration?: {
    type: string;
    estimatedHours?: number;
  };
  skills: string[];
  client: {
    name: string;
    location: string;
    rating: number;
  };
  deadline?: string;
}

interface ProposedMilestone {
  title: string;
  description: string;
  amount: string;
  durationDays: string;
}

interface UploadedAttachment {
  filename: string;
  url: string;
  size: number;
  type: string;
}

interface ProposalFormData {
  coverLetter: string;
  proposedRate: {
    amount: string;
    type: 'fixed';
    currency: string;
  };
  estimatedDuration: {
    value: string;
    unit: 'days' | 'weeks' | 'months';
  };
  proposedMilestones: ProposedMilestone[];
  attachments: UploadedAttachment[];
}

export default function CreateProposalPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProposalFormData>({
    coverLetter: '',
    proposedRate: {
      amount: '',
      type: 'fixed', // Will be updated based on job budget type
      currency: 'USD'
    },
    estimatedDuration: {
      value: '',
      unit: 'days'
    },
    proposedMilestones: [],
    attachments: []
  });

  useEffect(() => {
    // Simulate fetching job details
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        const job = await jobService.getJob(jobId);

        // Map API response to our JobDetails interface
        const mappedJob: JobDetails = {
          id: job.id,
          title: job.title,
          description: job.description,
          budget: job.budget,
          duration: job.duration ? {
            type: job.duration.unit,
            estimatedHours: job.duration.unit === 'days' ? job.duration.value * 8 :
                           job.duration.unit === 'weeks' ? job.duration.value * 40 :
                           job.duration.value * 160 // months
          } : undefined,
          skills: job.skills,
          client: {
            name: job.client.fullName,
            location: 'Unknown', // Add location if available in API
            rating: 4.5 // Add rating if available in API
          },
          deadline: job.expiresAt
        };

        setJobDetails(mappedJob);

        // Set the proposed rate type based on job budget type
        const budgetType = mappedJob.budget.type === 'range' ? 'fixed' : mappedJob.budget.type;
        setFormData(prev => ({
          ...prev,
          proposedRate: {
            ...prev.proposedRate,
            type: budgetType
          }
        }));
      } catch (err) {
        setError('Failed to load job details');
        console.error('Error fetching job:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleInputChange = (field: keyof Omit<ProposalFormData, 'proposedMilestones' | 'attachments'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleProposedRateChange = (field: 'amount' | 'currency') => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      proposedRate: {
        ...prev.proposedRate,
        [field]: e.target.value
      }
    }));
  };

  const handleDurationChange = (field: 'value' | 'unit') => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      estimatedDuration: {
        ...prev.estimatedDuration,
        [field]: e.target.value
      }
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      proposedMilestones: [
        ...prev.proposedMilestones,
        {
          title: '',
          description: '',
          amount: '',
          durationDays: ''
        }
      ]
    }));
  };

  const updateMilestone = (index: number, field: keyof ProposedMilestone, value: string) => {
    setFormData(prev => ({
      ...prev,
      proposedMilestones: prev.proposedMilestones.map((milestone, i) =>
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      proposedMilestones: prev.proposedMilestones.filter((_, i) => i !== index)
    }));
  };

  const moveMilestone = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const milestones = [...prev.proposedMilestones];
      const [moved] = milestones.splice(fromIndex, 1);
      milestones.splice(toIndex, 0, moved);
      return {
        ...prev,
        proposedMilestones: milestones
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      // Validate files before upload
      for (const file of files) {
        const validationError = fileService.validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }
      }

      // Upload files
      const uploadResults = await fileService.uploadMultipleDocuments(files);

      // Add uploaded files to form data
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadResults]
      }));

    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getTotalMilestoneAmount = () => {
    return formData.proposedMilestones.reduce((total, milestone) => {
      return total + (parseFloat(milestone.amount) || 0);
    }, 0);
  };

  const validateForm = () => {
    if (!formData.coverLetter.trim()) {
      return 'Cover letter is required';
    }
    if (!formData.proposedRate.amount.trim()) {
      return 'Proposed budget is required';
    }
    if (!formData.estimatedDuration.value.trim()) {
      return 'Estimated duration is required';
    }

    // Validate milestones if any exist
    for (let i = 0; i < formData.proposedMilestones.length; i++) {
      const milestone = formData.proposedMilestones[i];
      if (!milestone.title.trim() || !milestone.description.trim() ||
          !milestone.amount.trim() || !milestone.durationDays.trim()) {
        return `Milestone ${i + 1} is incomplete. All fields are required.`;
      }
      if (parseFloat(milestone.amount) <= 0) {
        return `Milestone ${i + 1} amount must be greater than 0.`;
      }
      if (parseInt(milestone.durationDays) <= 0) {
        return `Milestone ${i + 1} duration must be greater than 0 days.`;
      }
    }

    // For fixed-price jobs, check if milestone total matches proposed rate (if milestones exist)
    if (formData.proposedMilestones.length > 0) {
      const milestoneTotal = getTotalMilestoneAmount();
      const proposedTotal = parseFloat(formData.proposedRate.amount);
      if (Math.abs(milestoneTotal - proposedTotal) > 0.01) {
        return `Total milestone amounts ($${milestoneTotal.toFixed(2)}) must equal your proposed rate ($${proposedTotal.toFixed(2)})`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the request data matching backend API
      const requestData: CreateProposalRequest = {
        jobId,
        coverLetter: formData.coverLetter,
        proposedRate: {
          amount: parseFloat(formData.proposedRate.amount),
          type: formData.proposedRate.type,
          currency: formData.proposedRate.currency
        },
        estimatedDuration: {
          value: parseInt(formData.estimatedDuration.value),
          unit: formData.estimatedDuration.unit
        }
      };

      // Add milestones if any exist
      if (formData.proposedMilestones.length > 0) {
        (requestData as any).proposedMilestones = formData.proposedMilestones.map(milestone => ({
          title: milestone.title,
          description: milestone.description,
          amount: parseFloat(milestone.amount),
          durationDays: parseInt(milestone.durationDays)
        }));
      }

      // Add attachments if any exist
      if (formData.attachments.length > 0) {
        (requestData as any).attachments = formData.attachments;
      }

      const result = await proposalService.createProposal(requestData);

      router.push('/freelancer/proposals?status=submitted');
    } catch (err: any) {
      setError(err.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!jobDetails) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="max-w-4xl mx-auto">
          <Alert type="error" message="Job not found" />
          <div className="text-center mt-4">
            <Link href="/freelancer/jobs" className="text-orange-600 hover:text-orange-700">
              Browse available jobs
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const milestoneTotal = getTotalMilestoneAmount();
  const proposedTotal = parseFloat(formData.proposedRate.amount) || 0;
  const isMilestoneTotalValid = formData.proposedMilestones.length === 0 ||
    Math.abs(milestoneTotal - proposedTotal) <= 0.01;

  return (
    <DashboardLayout userRole="freelancer">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/freelancer/dashboard' },
            { label: 'Browse Jobs', href: '/freelancer/jobs', icon: <Search size={16} /> },
            { label: jobDetails?.title || 'Job', href: `/freelancer/jobs/${jobId}` },
            { label: 'Submit Proposal', icon: <Send size={16} /> }
          ]}
        />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Submit Proposal
              </h1>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {jobDetails.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {jobDetails.budget.type === 'range'
                    ? `$${jobDetails.budget.min} - $${jobDetails.budget.max}`
                    : `$${jobDetails.budget.min}`
                  }
                </div>
                {jobDetails.duration && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {jobDetails.duration.estimatedHours}hrs
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Skills */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {jobDetails.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Proposal Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Letter */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">1</span>
              </span>
              Cover Letter
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell the client why you're the best fit for this project *
              </label>
              <TextArea
                placeholder="Describe your relevant experience, approach to the project, and why you should be hired..."
                value={formData.coverLetter}
                onChange={handleInputChange('coverLetter')}
                rows={6}
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Tip: Be specific about your experience and include relevant examples from your portfolio.
            </p>
          </div>

          {/* Budget and Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">2</span>
              </span>
              Budget & Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Proposed Budget (USD) *
                </label>
                <Input
                  type="number"
                  placeholder="Enter fixed price amount"
                  value={formData.proposedRate.amount}
                  onChange={handleProposedRateChange('amount')}
                  required
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Fixed price for the entire project</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Estimated Duration *
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Duration"
                    value={formData.estimatedDuration.value}
                    onChange={handleDurationChange('value')}
                    required
                    className="flex-1"
                  />
                  <select
                    value={formData.estimatedDuration.unit}
                    onChange={handleDurationChange('unit')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">3</span>
                </span>
                Project Milestones
                <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Milestone
              </Button>
            </div>

            {formData.proposedMilestones.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-500 mb-4">
                  <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No milestones added yet</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMilestone}
                >
                  Add Your First Milestone
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.proposedMilestones.map((milestone, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        <span className="text-sm font-medium text-gray-700">
                          Milestone {index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Milestone title"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <TextArea
                          placeholder="Describe what will be delivered in this milestone"
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                          rows={2}
                          required
                        />
                      </div>
                      <Input
                        type="number"
                        placeholder="Amount ($)"
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Duration (days)"
                        value={milestone.durationDays}
                        onChange={(e) => updateMilestone(index, 'durationDays', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}

                {formData.proposedMilestones.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">
                        Milestone Total:
                      </span>
                      <span className={`font-semibold ${
                        isMilestoneTotalValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${milestoneTotal.toFixed(2)}
                        {!isMilestoneTotalValid && proposedTotal > 0 && (
                          <span className="text-sm text-red-500 ml-2">
                            (Should equal ${proposedTotal.toFixed(2)})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-yellow-600">4</span>
              </span>
              Attachments
              <span className="text-sm font-normal text-gray-500">(Optional)</span>
            </h3>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-sm text-gray-600 mb-2">
                    Drag and drop files here, or click to browse
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Supported formats: PDF, DOC, DOCX, TXT, ZIP, JPEG, PNG, GIF (Max 10MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                    ref={(input) => {
                      // Store reference to input for programmatic triggering
                      if (input) (input as any)._fileInput = input;
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className={`mt-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isUploading}
                    onClick={() => {
                      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                      if (fileInput && !isUploading) {
                        fileInput.click();
                      }
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Uploading...
                      </>
                    ) : (
                      'Choose Files'
                    )}
                  </Button>
                </div>
              </div>

              {uploadError && (
                <Alert type="error" message={uploadError} />
              )}

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert type="error" message={error} />
          )}

          {/* Submit Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <Link
                href="/freelancer/jobs"
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Link>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Save as draft functionality (would need backend support)
                    alert('Draft saving not implemented yet');
                  }}
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isMilestoneTotalValid}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Submit Proposal
                    </>
                  )}
                </Button>
              </div>
            </div>

            {!isMilestoneTotalValid && formData.proposedRate.type === 'fixed' && formData.proposedMilestones.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Please ensure milestone amounts total equals your proposed budget before submitting.
                  </span>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}