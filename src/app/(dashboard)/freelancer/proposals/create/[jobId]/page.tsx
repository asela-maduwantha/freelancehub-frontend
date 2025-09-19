'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout';
import { Input, TextArea } from '../../../../../../components/ui/Input';
import Button from '../../../../../../components/ui/Button';
import { Alert } from '../../../../../../components/ui/Feedback';
import Loader from '../../../../../../components/ui/Feedback/Loader';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  FileText, 
  ArrowLeft,
  Upload,
  X,
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
    currency: string;
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
  proposedBudget: string;
  timeline: string;
  milestones: Array<{
    title: string;
    description: string;
    amount: string;
    dueDate: string;
  }>;
  attachments: File[];
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
    proposedBudget: '',
    timeline: '',
    milestones: [
      {
        title: '',
        description: '',
        amount: '',
        dueDate: ''
      }
    ],
    attachments: []
  });

  useEffect(() => {
    // Simulate fetching job details
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch from API
        // const job = await jobService.getJobById(jobId);
        
        // Mock data for now
        const mockJob: JobDetails = {
          id: jobId,
          title: 'Full-Stack Web Developer for E-commerce Platform',
          description: 'We are looking for an experienced full-stack developer to build a modern e-commerce platform...',
          budget: {
            type: 'range',
            min: 3000,
            max: 5000,
            currency: 'USD'
          },
          duration: {
            type: '1-3-months',
            estimatedHours: 120
          },
          skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
          client: {
            name: 'TechCorp Inc.',
            location: 'New York, USA',
            rating: 4.8
          },
          deadline: '2025-12-15'
        };
        
        setJobDetails(mockJob);
      } catch (err) {
        setError('Failed to load job details');
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

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          title: '',
          description: '',
          amount: '',
          dueDate: ''
        }
      ]
    }));
  };

  const removeMilestone = (index: number) => {
    if (formData.milestones.length > 1) {
      setFormData(prev => ({
        ...prev,
        milestones: prev.milestones.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
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
    if (!formData.proposedBudget.trim()) {
      setError('Proposed budget is required');
      return;
    }
    if (!formData.timeline.trim()) {
      setError('Timeline is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, submit to API
      // await proposalService.createProposal(jobId, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      router.push('/freelancer/proposals?status=submitted');
    } catch (err) {
      setError('Failed to submit proposal. Please try again.');
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
            <TextArea
              label="Tell the client why you're the best fit for this project"
              placeholder="Describe your relevant experience, approach to the project, and why you should be hired..."
              value={formData.coverLetter}
              onChange={handleInputChange('coverLetter')}
              rows={6}
              required
            />
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
              <Input
                label="Proposed Budget (USD)"
                type="number"
                placeholder="Enter your proposed budget"
                value={formData.proposedBudget}
                onChange={handleInputChange('proposedBudget')}
                required
                icon={DollarSign}
              />
              <Input
                label="Estimated Timeline"
                placeholder="e.g., 2-3 weeks"
                value={formData.timeline}
                onChange={handleInputChange('timeline')}
                required
                icon={Calendar}
              />
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Project Milestones
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Milestone {index + 1}
                    </h4>
                    {formData.milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Milestone Title"
                      placeholder="e.g., Project Setup & Planning"
                      value={milestone.title}
                      onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                    />
                    <Input
                      label="Amount (USD)"
                      type="number"
                      placeholder="0"
                      value={milestone.amount}
                      onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <TextArea
                      label="Description"
                      placeholder="Describe what will be delivered in this milestone..."
                      value={milestone.description}
                      onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Input
                      label="Due Date"
                      type="date"
                      value={milestone.dueDate}
                      onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attachments (Optional)
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                </span>
              </label>
            </div>

            {/* Uploaded Files */}
            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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