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
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  ArrowLeft,
  Calendar
} from 'lucide-react';

interface JobDetails {
  id: string;
  title: string;
  description: string;
  budget: {
    type: 'fixed' | 'hourly' | 'range';
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

interface ProposalFormData {
  coverLetter: string;
  proposedRate: {
    amount: string;
    type: 'fixed' | 'hourly';
    currency: string;
  };
  estimatedDuration: {
    value: string;
    unit: 'days' | 'weeks' | 'months';
  };
}

export default function CreateProposalPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);

  const [formData, setFormData] = useState<ProposalFormData>({
    coverLetter: '',
    proposedRate: {
      amount: '',
      type: 'fixed',
      currency: 'USD'
    },
    estimatedDuration: {
      value: '',
      unit: 'days'
    }
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
          duration: job.duration,
          skills: job.skills,
          client: {
            name: job.client.fullName,
            location: 'Unknown', // Add location if available in API
            rating: 4.5 // Add rating if available in API
          },
          deadline: job.expiresAt
        };
        
        setJobDetails(mappedJob);
      } catch (err) {
        setError('Failed to load job details');
        console.error('Error fetching job:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleInputChange = (field: keyof ProposalFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleProposedRateChange = (field: 'amount' | 'type' | 'currency') => (
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.coverLetter.trim()) {
      setError('Cover letter is required');
      return;
    }
    if (!formData.proposedRate.amount.trim()) {
      setError('Proposed budget is required');
      return;
    }
    if (!formData.estimatedDuration.value.trim()) {
      setError('Estimated duration is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the request data
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

  return (
    <DashboardLayout userRole="freelancer">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/freelancer/jobs"
              className="inline-flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to jobs
            </Link>
          </div>
          
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cover Letter
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell the client why you're the best fit for this project
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Budget & Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Proposed Budget (USD)
                </label>
                <Input
                  type="number"
                  placeholder="Enter your proposed budget"
                  value={formData.proposedRate.amount}
                  onChange={handleProposedRateChange('amount')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Estimated Duration
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
                    // Save as draft functionality
                    alert('Proposal saved as draft');
                  }}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Proposal'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}