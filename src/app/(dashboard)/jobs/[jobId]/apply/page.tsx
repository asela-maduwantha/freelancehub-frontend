'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import Button from '../../../../../components/ui/Button/Button';
import Loader from '../../../../../components/ui/Feedback/Loader';
import { Alert } from '../../../../../components/ui/Feedback';
import { jobService, JobResponse } from '../../../../../lib/api/jobs';
import { proposalService, CreateProposalRequest, ProposalMilestone } from '../../../../../lib/api/proposals';
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  DollarSign,
  Clock,
  FileText,
  Briefcase,
  MapPin,
  User
} from 'lucide-react';

interface MilestoneFormData extends ProposalMilestone {
  id: string;
}

interface ProposalFormData {
  coverLetter: string;
  proposedRateAmount: string;
  proposedRateType: 'fixed' | 'hourly';
  estimatedDurationValue: string;
  estimatedDurationUnit: 'days' | 'weeks' | 'months';
  milestones: MilestoneFormData[];
}

const ApplyJobPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProposalFormData>({
    coverLetter: '',
    proposedRateAmount: '',
    proposedRateType: 'fixed',
    estimatedDurationValue: '',
    estimatedDurationUnit: 'days',
    milestones: []
  });

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;

      try {
        setIsLoading(true);
        setError(null);
        const jobData = await jobService.getJob(jobId);
        setJob(jobData);
        
        // Pre-fill rate type based on job project type
        setFormData(prev => ({
          ...prev,
          proposedRateType: jobData.projectType === 'fixed-price' ? 'fixed' : 'hourly'
        }));
      } catch (err: any) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleInputChange = (field: keyof ProposalFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const addMilestone = () => {
    const newMilestone: MilestoneFormData = {
      id: Date.now().toString(),
      title: '',
      description: '',
      amount: 0,
      durationDays: 1
    };
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
  };

  const updateMilestone = (id: string, field: keyof MilestoneFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map(milestone =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const removeMilestone = (id: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(milestone => milestone.id !== id)
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.coverLetter.trim()) return 'Cover letter is required';
    if (!formData.proposedRateAmount || parseFloat(formData.proposedRateAmount) <= 0) {
      return 'Valid proposed rate is required';
    }
    if (!formData.estimatedDurationValue || parseInt(formData.estimatedDurationValue) <= 0) {
      return 'Valid estimated duration is required';
    }

    // Validate milestones if any
    for (const milestone of formData.milestones) {
      if (!milestone.title.trim()) return 'All milestone titles are required';
      if (!milestone.description.trim()) return 'All milestone descriptions are required';
      if (milestone.amount <= 0) return 'All milestone amounts must be greater than 0';
      if (milestone.durationDays <= 0) return 'All milestone durations must be greater than 0';
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

    setIsSubmitting(true);

    try {
      const proposalData: CreateProposalRequest = {
        jobId,
        coverLetter: formData.coverLetter.trim(),
        proposedRate: {
          amount: parseFloat(formData.proposedRateAmount),
          type: formData.proposedRateType,
          currency: 'USD'
        },
        estimatedDuration: {
          value: parseInt(formData.estimatedDurationValue),
          unit: formData.estimatedDurationUnit
        }
      };

      // Add milestones if any
      if (formData.milestones.length > 0) {
        proposalData.proposedMilestones = formData.milestones.map(({ id, ...milestone }) => milestone);
      }

      await proposalService.createProposal(proposalData);

      setSuccessMessage('Proposal submitted successfully! Redirecting to your proposals...');

      // Redirect to proposals page after successful submission
      setTimeout(() => {
        router.push('/dashboard/freelancer/proposals');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = (budget: JobResponse['budget']) => {
    const { type, min, max, currency = 'USD' } = budget;
    
    if (type === 'range' && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
    }
    return `$${min.toLocaleString()} ${currency}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="freelancer" userName="Freelancer Name">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !job) {
    return (
      <DashboardLayout userRole="freelancer" userName="Freelancer Name">
        <div className="max-w-4xl mx-auto p-6">
          <Alert type="error" message={error} />
          <div className="mt-4">
            <Link href="/browse-projects">
              <Button variant="outline">Back to Browse Projects</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout userRole="freelancer" userName="Freelancer Name">
        <div className="max-w-4xl mx-auto p-6">
          <Alert type="error" message="Job not found" />
          <div className="mt-4">
            <Link href="/browse-projects">
              <Button variant="outline">Back to Browse Projects</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer" userName="Freelancer Name">
      <div className="flex-1">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/browse-projects">
              <button className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-3 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Browse Projects
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Submit Proposal</h1>
              <p className="text-gray-600">Apply for this project with your proposal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert type="error" message={error} />
                )}

                {/* Success Alert */}
                {successMessage && (
                  <Alert type="success" message={successMessage} />
                )}

                {/* Cover Letter */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Cover Letter
                  </h2>
                  <textarea
                    value={formData.coverLetter}
                    onChange={handleInputChange('coverLetter')}
                    rows={8}
                    placeholder="Write a compelling cover letter explaining why you're the perfect fit for this project. Include your relevant experience, approach to the project, and what makes you stand out..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none resize-vertical"
                    required
                  />
                </div>

                {/* Proposed Rate & Duration */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Proposed Rate & Duration
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Type
                      </label>
                      <select
                        value={formData.proposedRateType}
                        onChange={handleInputChange('proposedRateType')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Rate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.proposedRateType === 'fixed' ? 'Total Amount' : 'Hourly Rate'} (USD)
                      </label>
                      <input
                        type="number"
                        value={formData.proposedRateAmount}
                        onChange={handleInputChange('proposedRateAmount')}
                        placeholder="1500"
                        min="1"
                        step="0.01"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Duration
                      </label>
                      <input
                        type="number"
                        value={formData.estimatedDurationValue}
                        onChange={handleInputChange('estimatedDurationValue')}
                        placeholder="30"
                        min="1"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration Unit
                      </label>
                      <select
                        value={formData.estimatedDurationUnit}
                        onChange={handleInputChange('estimatedDurationUnit')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Project Milestones (Optional)
                    </h2>
                    <Button
                      type="button"
                      onClick={addMilestone}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Milestone
                    </Button>
                  </div>

                  {formData.milestones.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Break down your project into milestones to help the client understand your approach and timeline.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {formData.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Milestone {index + 1}</h4>
                            <Button
                              type="button"
                              onClick={() => removeMilestone(milestone.id)}
                              variant="outline"
                              size="sm"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                              </label>
                              <input
                                type="text"
                                value={milestone.title}
                                onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                                placeholder="Milestone title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                value={milestone.description}
                                onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                                rows={2}
                                placeholder="Describe what will be delivered in this milestone"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-vertical"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (USD)
                              </label>
                              <input
                                type="number"
                                value={milestone.amount}
                                onChange={(e) => updateMilestone(milestone.id, 'amount', parseFloat(e.target.value) || 0)}
                                placeholder="500"
                                min="1"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (Days)
                              </label>
                              <input
                                type="number"
                                value={milestone.durationDays}
                                onChange={(e) => updateMilestone(milestone.id, 'durationDays', parseInt(e.target.value) || 1)}
                                placeholder="7"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <Link href="/browse-projects">
                      <Button type="button" variant="outline" size="lg">
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <Loader size="sm" className="mr-2" />
                          Submitting...
                        </div>
                      ) : (
                        'Submit Proposal'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Job Summary Sidebar */}
            <div className="space-y-6">
              {/* Job Overview */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Overview</h3>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{job.title}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{job.description}</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Budget
                      </span>
                      <span className="font-medium text-gray-900">{formatBudget(job.budget)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Location
                      </span>
                      <span className="font-medium text-gray-900 capitalize">{job.location?.type || 'Remote'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Project Type
                      </span>
                      <span className="font-medium text-gray-900 capitalize">{job.projectType.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Required */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                <div className="flex items-center space-x-3">
                  {job.client.avatar ? (
                    <img
                      src={job.client.avatar}
                      alt={job.client.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{job.client.fullName}</p>
                    <p className="text-sm text-gray-600">{job.client.email}</p>
                  </div>
                </div>
              </div>

              {/* Job Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Proposals</span>
                    <span className="font-medium text-gray-900">{job.proposalCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-medium text-gray-900">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {job.isUrgent && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Priority</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Urgent
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplyJobPage;