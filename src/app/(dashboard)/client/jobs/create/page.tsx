'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import Input from '../../../../../components/ui/Input/Input';
import Button from '../../../../../components/ui/Button/Button';
import Loader from '../../../../../components/ui/Feedback/Loader';
import { Alert } from '../../../../../components/ui/Feedback';
import { jobService, CreateJobRequest } from '../../../../../lib/api/jobs';
import { fileService } from '../../../../../lib/api/files';
import Breadcrumb from '../../../../../components/common/Breadcrumb';
import {
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  ArrowLeft,
  Plus,
  X,
  Upload
} from 'lucide-react';

interface JobFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  projectType: 'fixed-price';
  budget: {
    type: 'fixed' | 'range';
    min: number;
    max?: number;
    currency?: string;
  };
  duration?: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  skills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  isUrgent: boolean;
  isFeatured: boolean;
  maxProposals: number;
  attachments: File[];
  expiresAt: string;
  // Additional form fields for UI
  budgetMin: string;
  budgetMax: string;
  durationValue: string;
  durationUnit: 'days' | 'weeks' | 'months';
  newSkill: string;
}

const JOB_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Desktop Development',
  'Data Science & Analytics',
  'Design & Creative',
  'Writing & Translation',
  'Marketing & Sales',
  'Customer Service',
  'Consulting',
  'Other'
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' }
];

const PROJECT_TYPES = [
  { value: 'fixed-price', label: 'Fixed Price' }
];

const BUDGET_TYPES = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'range', label: 'Budget Range' }
];

const DURATION_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' }
];

export default function CreateJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    projectType: 'fixed-price',
    budget: {
      type: 'fixed',
      min: 0,
      currency: 'USD'
    },
    duration: {
      value: 1,
      unit: 'months'
    },
    skills: [],
    experienceLevel: 'intermediate',
    isUrgent: false,
    isFeatured: false,
    maxProposals: 50,
    attachments: [],
    expiresAt: '',
    // Form-specific fields
    budgetMin: '',
    budgetMax: '',
    durationValue: '1',
    durationUnit: 'months',
    newSkill: ''
  });

  const handleInputChange = (field: keyof JobFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const handleCheckboxChange = (field: keyof JobFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.checked
    }));
  };

  const handleBudgetTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        type: type as 'fixed' | 'range'
      }
    }));
  };

  const handleBudgetValueChange = (field: 'budgetMin' | 'budgetMax') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
      budget: {
        ...prev.budget,
        [field === 'budgetMin' ? 'min' : 'max']: parseFloat(value) || 0
      }
    }));
  };

  const handleDurationValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      durationValue: value,
      duration: {
        value: parseInt(value) || 1,
        unit: prev.durationUnit
      }
    }));
  };

  const handleDurationUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value as 'days' | 'weeks' | 'months';
    setFormData(prev => ({
      ...prev,
      durationUnit: unit,
      duration: {
        value: parseInt(prev.durationValue) || 1,
        unit: unit
      }
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate files before adding
    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const validationError = fileService.validateFile(file);
      if (validationError) {
        invalidFiles.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid files:\n${invalidFiles.join('\n')}`);
      return;
    }

    // Check total file count
    if (formData.attachments.length + validFiles.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));

    // Clear any previous errors
    if (error) setError(null);
  };

  const removeFile = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== indexToRemove)
    }));
  };

  const addSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((skill: string) => skill !== skillToRemove)
    }));
  };



  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Job title is required';
    if (!formData.description.trim()) return 'Job description is required';
    if (!formData.category) return 'Job category is required';
    if (formData.skills.length === 0) return 'At least one skill is required';
    if (!formData.budgetMin || parseFloat(formData.budgetMin) <= 0) return 'Valid budget amount is required';

    if (formData.budget.type === 'range' && (!formData.budgetMax || parseFloat(formData.budgetMax) <= parseFloat(formData.budgetMin))) {
      return 'Maximum budget must be greater than minimum budget';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Upload files to storage service if attachments exist
      let attachmentUrls: { filename: string; url: string; size: number; type: string; }[] = [];

      if (formData.attachments.length > 0) {
        setIsUploadingFiles(true);
        try {
          const uploadResults = await fileService.uploadMultipleDocuments(
            formData.attachments,
            formData.attachments.map(() => 'Job attachment') // Optional descriptions
          );
          attachmentUrls = uploadResults;
        } catch (uploadError: any) {
          console.error('File upload error:', uploadError);
          setError(`Failed to upload files: ${uploadError.message}`);
          setIsUploadingFiles(false);
          return;
        } finally {
          setIsUploadingFiles(false);
        }
      }

      const jobData: CreateJobRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        projectType: formData.projectType,
        budget: {
          type: formData.budget.type,
          min: parseFloat(formData.budgetMin),
          max: formData.budget.type === 'range' ? parseFloat(formData.budgetMax) : undefined,
          currency: formData.budget.currency
        },
        duration: formData.duration ? {
          value: formData.duration.value,
          unit: formData.duration.unit
        } : undefined,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        isUrgent: formData.isUrgent,
        isFeatured: formData.isFeatured,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined,
        maxProposals: formData.maxProposals,
        expiresAt: formData.expiresAt || undefined
      };

      const response = await jobService.createJob(jobData);

      setSuccessMessage('Job created successfully! Redirecting to job details...');

      // Redirect to job details page after successful creation
      setTimeout(() => {
        router.push(`/client/jobs`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/client/dashboard' },
            { label: 'My Jobs', href: '/client/jobs', icon: <Briefcase size={16} /> },
            { label: 'Post a Job', icon: <Plus size={16} /> }
          ]}
        />

        {/* Page Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Post a New Job</h1>
              <p className="text-gray-600">Find the perfect freelancer for your project by providing clear requirements and expectations.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-600">Tell us about your project</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., React Developer for E-commerce Platform"
                    value={formData.title}
                    onChange={handleInputChange('title')}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={handleInputChange('category')}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  >
                    <option value="">Select a category</option>
                    {JOB_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Frontend Development"
                    value={formData.subcategory}
                    onChange={handleInputChange('subcategory')}
                    className="w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    rows={6}
                    placeholder="Describe your project in detail. Include requirements, deliverables, and any specific technologies or skills needed..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none resize-vertical transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Budget & Duration */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Budget & Timeline</h2>
                  <p className="text-sm text-gray-600">Set your project budget and expected duration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type *
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={handleInputChange('projectType')}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    {PROJECT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Type *
                  </label>
                  <select
                    value={formData.budget.type}
                    onChange={(e) => handleBudgetTypeChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    {BUDGET_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.budget.type === 'range' ? 'Minimum Budget' : 'Budget Amount'} (USD) *
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={formData.budgetMin}
                    onChange={handleBudgetValueChange('budgetMin')}
                    min="1"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                {formData.budget.type === 'range' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Budget (USD) *
                    </label>
                    <input
                      type="number"
                      placeholder="2000"
                      value={formData.budgetMax}
                      onChange={handleBudgetValueChange('budgetMax')}
                      min={parseFloat(formData.budgetMin) + 1}
                      step="0.01"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="3"
                      value={formData.durationValue}
                      onChange={handleDurationValueChange}
                      min="1"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                    <select
                      value={formData.durationUnit}
                      onChange={handleDurationUnitChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    >
                      {DURATION_UNITS.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Experience */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Skills & Experience</h2>
                  <p className="text-sm text-gray-600">Specify required skills and experience level</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills *
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Add a skill (e.g., React, Python)"
                      value={formData.newSkill}
                      onChange={handleInputChange('newSkill')}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      variant="secondary"
                      size="md"
                      disabled={!formData.newSkill.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-orange-600 hover:text-orange-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={handleInputChange('experienceLevel')}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Attachments & Settings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <Upload className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Attachments & Settings</h2>
                  <p className="text-sm text-gray-600">Add files and configure job settings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Files (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploadingFiles}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpeg,.jpg,.png,.gif"
                  />
                  <p className="text-sm text-gray-500 mt-1">Max 10MB per file. Supported: PDF, DOC, DOCX, TXT, ZIP, JPEG, PNG, GIF</p>
                  
                  {formData.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({(file.size / 1024 / 1024).toFixed(1)}MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            disabled={isUploadingFiles}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {isUploadingFiles && (
                        <div className="flex items-center p-2 bg-blue-50 rounded">
                          <Loader size="sm" className="mr-2" />
                          <span className="text-sm text-blue-700">Uploading files...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={handleInputChange('expiresAt')}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <p className="text-sm text-gray-500 mt-1">When should this job posting expire?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Proposals
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={formData.maxProposals?.toString() || '50'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      maxProposals: parseInt(e.target.value) || 50
                    }))}
                    min="1"
                    max="1000"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center">
                  <input
                    id="urgent"
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={handleCheckboxChange('isUrgent')}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="urgent" className="ml-2 text-sm text-gray-700">
                    Mark as urgent (higher visibility)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={handleCheckboxChange('isFeatured')}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured job (premium visibility)
                  </label>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert type="error" message={error} />
            )}

            {/* Success Alert */}
            {successMessage && (
              <Alert type="success" message={successMessage} />
            )}

            {/* Submit Button */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <Link href="/client/dashboard">
                  <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading || isUploadingFiles}
                  className="w-full sm:w-auto"
                >
                  {isUploadingFiles ? (
                    <div className="flex items-center justify-center">
                      <Loader size="sm" className="mr-2" />
                      Uploading Files...
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader size="sm" className="mr-2" />
                      Creating Job...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Post Job
                    </div>
                  )}
                </Button>
              </div>
            </div>
        </form>
      </div>
    </DashboardLayout>
  );
}