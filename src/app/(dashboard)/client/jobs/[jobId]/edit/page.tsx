'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout';
import Input from '../../../../../../components/ui/Input/Input';
import Button from '../../../../../../components/ui/Button/Button';
import Loader from '../../../../../../components/ui/Feedback/Loader';
import { Alert } from '../../../../../../components/ui/Feedback';
import { jobService, CreateJobRequest, JobResponse, JobAttachment } from '../../../../../../lib/api/jobs';
import { fileService } from '../../../../../../lib/api/files';
import {
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  ArrowLeft,
  Plus,
  X,
  Upload,
  Save
} from 'lucide-react';

interface JobFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  projectType: 'fixed-price' | 'hourly';
  budget: {
    type: 'fixed' | 'hourly' | 'range';
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
  attachments: (File | JobAttachment)[];
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
  { value: 'fixed-price', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' }
];

const BUDGET_TYPES = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'range', label: 'Budget Range' },
  { value: 'hourly', label: 'Hourly Rate' }
];

const DURATION_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' }
];

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
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
      max: 0,
      currency: 'USD'
    },
    skills: [],
    experienceLevel: 'beginner',
    isUrgent: false,
    isFeatured: false,
    maxProposals: 50,
    attachments: [],
    expiresAt: '',
    budgetMin: '',
    budgetMax: '',
    durationValue: '',
    durationUnit: 'weeks',
    newSkill: ''
  });

  // Load job data on component mount
  useEffect(() => {
    const loadJobData = async () => {
      try {
        setIsLoadingJob(true);
        const jobData = await jobService.getJob(jobId);

        // Check if job is a draft
        if (jobData.status !== 'draft') {
          setError('Only draft jobs can be edited');
          return;
        }

        // Populate form with existing job data
        setFormData({
          title: jobData.title,
          description: jobData.description,
          category: jobData.category,
          subcategory: jobData.subcategory || '',
          projectType: jobData.projectType === 'fixed-price' ? 'fixed-price' : 'hourly',
          budget: {
            type: jobData.budget.type,
            min: jobData.budget.min,
            max: jobData.budget.max || 0,
            currency: jobData.budget.currency || 'USD'
          },
          duration: jobData.duration ? {
            value: jobData.duration.value,
            unit: jobData.duration.unit
          } : undefined,
          skills: jobData.skills,
          experienceLevel: jobData.experienceLevel || 'beginner',
          isUrgent: jobData.isUrgent,
          isFeatured: jobData.isFeatured,
          maxProposals: jobData.maxProposals || 50,
          attachments: jobData.attachments || [],
          expiresAt: jobData.expiresAt ? new Date(jobData.expiresAt).toISOString().split('T')[0] : '',
          budgetMin: jobData.budget.min.toString(),
          budgetMax: (jobData.budget.max || 0).toString(),
          durationValue: jobData.duration ? jobData.duration.value.toString() : '',
          durationUnit: jobData.duration ? jobData.duration.unit : 'weeks',
          newSkill: ''
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load job data');
      } finally {
        setIsLoadingJob(false);
      }
    };

    if (jobId) {
      loadJobData();
    }
  }, [jobId]);

  const handleInputChange = (field: keyof JobFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBudgetChange = (field: 'budgetMin' | 'budgetMax') => (
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

  const handleDurationChange = (field: string, value: any) => {
    if (field === 'durationValue') {
      setFormData(prev => ({
        ...prev,
        durationValue: value,
        duration: value ? {
          value: parseInt(value) || 0,
          unit: prev.durationUnit
        } : undefined
      }));
    } else if (field === 'durationUnit') {
      setFormData(prev => ({
        ...prev,
        durationUnit: value,
        duration: prev.durationValue ? {
          value: parseInt(prev.durationValue) || 0,
          unit: value
        } : undefined
      }));
    }
  };;

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
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploadingFiles(true);
    try {
      const fileArray = Array.from(files);
      
      // Upload files to the file service
      const uploadResults = await fileService.uploadMultipleDocuments(
        fileArray,
        fileArray.map(() => 'Job attachment') // Optional descriptions
      );
      
      // Convert upload results to JobAttachment format and add to form data
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadResults]
      }));
    } catch (err: any) {
      setError('Failed to upload files: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e?: React.FormEvent | any, action: 'save' | 'publish' = 'save') => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const submitData: Partial<CreateJobRequest> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        projectType: formData.projectType,
        budget: formData.budget,
        duration: formData.duration,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        isUrgent: formData.isUrgent,
        isFeatured: formData.isFeatured,
        maxProposals: formData.maxProposals,
        expiresAt: formData.expiresAt || undefined,
        attachments: formData.attachments.filter((attachment): attachment is JobAttachment => 
          'filename' in attachment && 'url' in attachment
        )
      };

      await jobService.updateJob(jobId, submitData);

      // If publishing, also update the status to 'open'
      if (action === 'publish') {
        await jobService.updateJob(jobId, { status: 'open' } as any);
      }

      setSuccessMessage(action === 'publish' ? 'Job published successfully!' : 'Job saved as draft successfully!');

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/client/jobs/${jobId}`);
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update job');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingJob) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center min-h-96">
          <Loader size="lg" className="text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !formData.title) {
    return (
      <DashboardLayout userRole="client">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Job</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/client/jobs/${jobId}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Job
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Job Draft</h1>
              <p className="text-gray-600 mt-2">Make changes to your job posting before publishing</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit(undefined, 'save')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit(undefined, 'publish')}
                disabled={isLoading}
                className="flex items-center gap-2 btn-accent"
              >
                <Briefcase className="w-4 h-4 " />
                Publish Job
              </Button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert type="success" message={successMessage} className="mb-6" />
        )}

        {error && (
          <Alert type="error" message={error} className="mb-6" />
        )}

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, 'save')} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
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
                </div>              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={handleInputChange('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  Subcategory (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. React Development"
                  value={formData.subcategory}
                  onChange={handleInputChange('subcategory')}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type
                </label>
                <div className="space-y-2">
                  {PROJECT_TYPES.map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        name="projectType"
                        value={type.value}
                        checked={formData.projectType === type.value}
                        onChange={handleInputChange('projectType')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                    </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                value={formData.description}
                onChange={handleInputChange('description')}
                rows={6}
                placeholder="Describe your project in detail. Include requirements, deliverables, and any specific instructions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                required
              />
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Budget & Timeline</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Type
                </label>
                <div className="space-y-2">
                  {BUDGET_TYPES.map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        name="budgetType"
                        value={type.value}
                        checked={formData.budget.type === type.value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          budget: { ...prev.budget, type: e.target.value as any }
                        }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.budgetMin}
                    onChange={handleBudgetChange('budgetMin')}
                    required
                    className="w-full"
                  />
                  {formData.budget.type === 'range' && (
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.budgetMax}
                      onChange={handleBudgetChange('budgetMax')}
                      required
                      className="w-full"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.budget.currency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget: { ...prev.budget, currency: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Optional)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 4"
                  value={formData.durationValue}
                  onChange={(e) => handleDurationChange('durationValue', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration Unit
                </label>
                <select
                  value={formData.durationUnit}
                  onChange={(e) => handleDurationChange('durationUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {DURATION_UNITS.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Proposals
                </label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.maxProposals.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxProposals: parseInt(e.target.value) || 50 }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Skills & Requirements</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add a skill..."
                    value={formData.newSkill}
                    onChange={(e) => setFormData(prev => ({ ...prev, newSkill: e.target.value }))}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    disabled={!formData.newSkill.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Additional Options</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Urgent Job</h3>
                  <p className="text-sm text-gray-600">Mark this job as urgent to attract more freelancers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={(e) => setFormData(prev => ({ ...prev, isUrgent: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Featured Job</h3>
                  <p className="text-sm text-gray-600">Feature this job to increase visibility</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Expiration Date (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Attachments (Optional)</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {isUploadingFiles && (
                  <p className="text-sm text-blue-600 mt-2">Uploading files...</p>
                )}
              </div>

              {formData.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h3>
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{'name' in file ? file.name : file.filename}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}