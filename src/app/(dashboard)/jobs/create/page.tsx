'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Input from '../../../../components/ui/Input/Input';
import Button from '../../../../components/ui/Button/Button';
import Loader from '../../../../components/ui/Feedback/Loader';
import { Alert } from '../../../../components/ui/Feedback';
import { jobService, CreateJobRequest } from '../../../../lib/api/jobs';
import {
  Briefcase,
  DollarSign,
  Clock,
  MapPin,
  FileText,
  ArrowLeft,
  Plus,
  X,
  Upload
} from 'lucide-react';

interface JobFormData extends CreateJobRequest {
  // Additional form fields for UI
  budgetMin: string;
  budgetMax: string;
  estimatedHours: string;
  countries: string[];
  newSkill: string;
  newCountry: string;
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

const DURATION_TYPES = [
  { value: 'less-than-1-month', label: 'Less than 1 month' },
  { value: '1-3-months', label: '1-3 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: 'more-than-6-months', label: 'More than 6 months' }
];

const LOCATION_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' }
];

export default function CreateJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      type: '1-3-months'
    },
    skills: [],
    experienceLevel: 'intermediate',
    isUrgent: false,
    isFeatured: false,
    location: {
      type: 'remote'
    },
    maxProposals: 50,
    // Form-specific fields
    budgetMin: '',
    budgetMax: '',
    estimatedHours: '',
    countries: [],
    newSkill: '',
    newCountry: ''
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
        type: type as 'fixed' | 'hourly' | 'range'
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

  const handleDurationHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      estimatedHours: value,
      duration: {
        ...prev.duration!,
        estimatedHours: parseInt(value) || undefined
      }
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
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addCountry = () => {
    if (formData.newCountry.trim() && !formData.countries.includes(formData.newCountry.trim())) {
      setFormData(prev => ({
        ...prev,
        countries: [...prev.countries, prev.newCountry.trim()],
        newCountry: '',
        location: {
          ...prev.location!,
          countries: [...prev.countries, prev.newCountry.trim()]
        }
      }));
    }
  };

  const removeCountry = (countryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.filter(country => country !== countryToRemove),
      location: {
        ...prev.location!,
        countries: prev.countries.filter(country => country !== countryToRemove)
      }
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
          type: formData.duration.type,
          estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined
        } : undefined,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        isUrgent: formData.isUrgent,
        isFeatured: formData.isFeatured,
        location: formData.location,
        maxProposals: formData.maxProposals
      };

      const response = await jobService.createJob(jobData);

      setSuccessMessage('Job created successfully! Redirecting to job details...');

      // Redirect to job details page after successful creation
      setTimeout(() => {
        router.push(`/jobs/${response.id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="client" userName="Client Name">
      <div className="flex-1">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/dashboard/client">
              <button className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-3 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Create New Job</h1>
                <p className="text-gray-600">Post a job and find the perfect freelancer for your project.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Basic Information
              </h2>

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
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none resize-vertical"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Budget & Duration */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Budget & Duration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type *
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={handleInputChange('projectType')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
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
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Duration
                  </label>
                  <select
                    value={formData.duration?.type || '1-3-months'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      duration: {
                        ...prev.duration!,
                        type: e.target.value as any
                      }
                    }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {DURATION_TYPES.map(duration => (
                      <option key={duration.value} value={duration.value}>{duration.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    placeholder="160"
                    value={formData.estimatedHours}
                    onChange={handleDurationHoursChange}
                    min="1"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Skills & Experience */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Skills & Experience
              </h2>

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
                      className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
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
                    {formData.skills.map(skill => (
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
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location & Preferences */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Location & Preferences
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Location
                  </label>
                  <select
                    value={formData.location?.type || 'remote'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: {
                        ...prev.location!,
                        type: e.target.value as 'remote' | 'onsite' | 'hybrid'
                      }
                    }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {LOCATION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {(formData.location?.type === 'onsite' || formData.location?.type === 'hybrid') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Countries
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Add a country"
                        value={formData.newCountry}
                        onChange={handleInputChange('newCountry')}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCountry();
                          }
                        }}
                        className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                      />
                      <Button
                        type="button"
                        onClick={addCountry}
                        variant="secondary"
                        size="md"
                        disabled={!formData.newCountry.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.countries.map(country => (
                        <span
                          key={country}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                        >
                          {country}
                          <button
                            type="button"
                            onClick={() => removeCountry(country)}
                            className="ml-2 text-orange-600 hover:text-orange-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
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
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-end space-x-4">
                <Link href="/dashboard/client">
                  <Button type="button" variant="outline" size="lg">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader size="sm" className="mr-2" />
                      Creating Job...
                    </div>
                  ) : (
                    'Create Job'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}