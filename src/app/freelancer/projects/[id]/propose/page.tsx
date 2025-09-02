'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Upload,
  X,
  FileText,
  DollarSign,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Save,
  Send,
  Plus,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { projectsService, freelancerAPI, uploadAPI, authService } from '@/lib/api';
import EnhancedFileUpload from '@/components/ui/FileUpload';
import { storageService } from '@/lib/api/storage.service';
import { FileData, IProject } from '@/lib/types';

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  requiredSkills: string[];
  budgetType: 'fixed' | 'hourly';
  budget: number;
  duration: string;
  experienceLevel: string;
  workType: string[];
  status: string;
  visibility: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  postedAt: string;
  analytics: {
    views: number;
    applications: number;
    saves: number;
  };
  attachments: any[];
  disputes: any[];
  messages: any[];
  milestones: any[];
  payments: any[];
  proposals: any[];
  reviews: any[];
  tags: any[];
}

interface ProposalData {
  coverLetter: string;
  pricing: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
    estimatedHours?: number;
    breakdown: string;
  };
  timeline: {
    deliveryTime: number;
    startDate: string;
    milestones: Array<{
      title: string;
      description: string;
      deliveryDate: string;
      amount: number;
    }>;
  };
  estimatedDuration: number;
  portfolioLinks: string[];
  attachments: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
    description: string;
  }>;
  additionalInfo: string;
}

interface Milestone {
  title: string;
  description: string;
  deliveryDate: string;
  amount: number;
}

export default function SubmitProposalPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  const [proposalData, setProposalData] = useState<ProposalData>({
    coverLetter: '',
    pricing: {
      amount: 0,
      currency: 'USD',
      type: 'fixed',
      estimatedHours: 0,
      breakdown: ''
    },
    timeline: {
      deliveryTime: 0,
      startDate: '',
      milestones: []
    },
    estimatedDuration: 0,
    portfolioLinks: [''],
    attachments: [],
    additionalInfo: ''
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      title: '',
      description: '',
      deliveryDate: '',
      amount: 0
    }
  ]);

  useEffect(() => {
    fetchProject();
    fetchUser();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectsService.getProjectById(projectId);
      setProject(response as unknown as Project);
      
      // Pre-fill pricing based on project budget
      setProposalData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          amount: response.budget || 0,
          currency: 'USD', // Default currency since it's not in response
          type: 'fixed' // Default to fixed since IProject doesn't have budgetType
        },
        timeline: {
          ...prev.timeline,
          deliveryTime: 0 // Default since duration is a string "short-term"
        },
        estimatedDuration: 0 // Default since duration is a string "short-term"
      }));
    } catch (err: any) {
      console.error('Failed to fetch project:', err);
      setError(err.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProposalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePricingChange = (field: string, value: any) => {
    setProposalData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }));
  };

  const handleTimelineChange = (field: string, value: any) => {
    setProposalData(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        [field]: value
      }
    }));
  };

  const handlePortfolioLinkChange = (index: number, value: string) => {
    setProposalData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.map((link, i) => 
        i === index ? value : link
      )
    }));
  };

  const addPortfolioLink = () => {
    setProposalData(prev => ({
      ...prev,
      portfolioLinks: [...prev.portfolioLinks, '']
    }));
  };

  const removePortfolioLink = (index: number) => {
    setProposalData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index)
    }));
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: any) => {
    setMilestones(prev => 
      prev.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const addMilestone = () => {
    setMilestones(prev => [
      ...prev,
      {
        title: '',
        description: '',
        deliveryDate: '',
        amount: 0
      }
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const handleFilesUploaded = (files: FileData[]) => {
    setUploadedFiles(files);
    setProposalData(prev => ({
      ...prev,
      attachments: files.map(file => ({
        filename: file.fileName,
        url: file.url,
        fileType: file.mimeType,
        fileSize: file.size,
        description: ''
      }))
    }));
  };

  const handleFileRemoved = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setProposalData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.filename !== uploadedFiles.find(f => f.id === fileId)?.fileName)
    }));
  };

  const validateProposal = (): boolean => {
    // Validate cover letter
    if (!proposalData.coverLetter.trim()) {
      setError('Cover letter is required');
      return false;
    }

    // Validate pricing
    if (proposalData.pricing.amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (!proposalData.pricing.currency.trim()) {
      setError('Please select a currency');
      return false;
    }

    if (!proposalData.pricing.type) {
      setError('Please select pricing type (fixed or hourly)');
      return false;
    }

    if (proposalData.pricing.type === 'hourly' && (!proposalData.pricing.estimatedHours || proposalData.pricing.estimatedHours <= 0)) {
      setError('Please enter a valid estimated hours for hourly pricing');
      return false;
    }

    // Validate timeline
    if (proposalData.timeline.deliveryTime <= 0) {
      setError('Please enter a valid delivery time');
      return false;
    }

    if (!proposalData.timeline.startDate) {
      setError('Please select a start date');
      return false;
    }

    // Validate estimated duration
    if (proposalData.estimatedDuration <= 0) {
      setError('Please enter a valid estimated duration');
      return false;
    }

    // Validate milestones
    if (milestones.length === 0) {
      setError('Please add at least one milestone');
      return false;
    }

    for (const milestone of milestones) {
      if (!milestone.title.trim()) {
        setError('Milestone title is required');
        return false;
      }
      if (!milestone.description.trim()) {
        setError('Milestone description is required');
        return false;
      }
      if (!milestone.deliveryDate) {
        setError('Milestone delivery date is required');
        return false;
      }
      if (milestone.amount <= 0) {
        setError('Milestone amount must be greater than 0');
        return false;
      }
    }

    // Validate portfolio links (optional but should be valid URLs if provided)
    for (const link of proposalData.portfolioLinks) {
      if (link.trim() && !link.match(/^https?:\/\/.+/)) {
        setError('Portfolio links must be valid URLs starting with http:// or https://');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProposal()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // TODO: Implement proposal submission API
      // const finalProposalData: ICreateProposalRequest = {
      //   proposedBudget: proposalData.pricing.amount,
      //   proposedDuration: {
      //     value: proposalData.estimatedDuration,
      //     unit: 'days' as const
      //   },
      //   coverLetter: proposalData.coverLetter,
      //   milestones: milestones.map(m => ({
      //     title: m.title,
      //     description: m.description,
      //     amount: m.amount
      //   }))
      // };
      
      // await freelancerAPI.createProposal(projectId, finalProposalData);
      
      // For now, just show success
      setSuccess('Proposal submitted successfully! (This is a placeholder)');
      
      // Redirect to proposals page after a short delay
      setTimeout(() => {
        router.push('/freelancer/proposals');
      }, 2000);
      
    } catch (err: any) {
      console.error('Failed to submit proposal:', err);
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const formatBudget = (budget: number, budgetType: string) => {
    if (budgetType === 'fixed') {
      return `$${budget.toLocaleString()}`;
    } else {
      return `$${budget}/hr`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/freelancer/projects"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/freelancer/projects/${projectId}`}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Submit Proposal</h1>
              <p className="text-gray-600">{project?.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-5 w-5 mr-2" />
              <span>Budget: {formatBudget(project!.budget, project!.budgetType)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2" />
              <span>Duration: {project!.duration}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Posted: {new Date(project!.postedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

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

        {/* Proposal Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Letter */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
            <textarea
              value={proposalData.coverLetter}
              onChange={(e) => handleInputChange('coverLetter', e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Introduce yourself and explain why you're the best fit for this project..."
              required
            />
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={proposalData.pricing.amount}
                  onChange={(e) => handlePricingChange('amount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={proposalData.pricing.currency}
                  onChange={(e) => handlePricingChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={proposalData.pricing.type}
                  onChange={(e) => handlePricingChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>
            </div>
            
            {proposalData.pricing.type === 'hourly' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={proposalData.pricing.estimatedHours || ''}
                  onChange={(e) => handlePricingChange('estimatedHours', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  required
                />
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Breakdown <span className="text-red-500">*</span>
              </label>
              <textarea
                value={proposalData.pricing.breakdown}
                onChange={(e) => handlePricingChange('breakdown', e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide a detailed breakdown of your costs..."
                required
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time (days)
                </label>
                <input
                  type="number"
                  value={proposalData.timeline.deliveryTime}
                  onChange={(e) => handleTimelineChange('deliveryTime', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (days)
                </label>
                <input
                  type="number"
                  value={proposalData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={proposalData.timeline.startDate}
                  onChange={(e) => handleTimelineChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </button>
            </div>
            
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Milestone {index + 1}</h4>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Milestone title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={milestone.amount}
                        onChange={(e) => handleMilestoneChange(index, 'amount', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={milestone.description}
                      onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                      className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what will be delivered in this milestone..."
                      required
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={milestone.deliveryDate}
                      onChange={(e) => handleMilestoneChange(index, 'deliveryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Links */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Portfolio Links</h3>
              <button
                type="button"
                onClick={addPortfolioLink}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Link
              </button>
            </div>
            
            <div className="space-y-3">
              {proposalData.portfolioLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handlePortfolioLinkChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                  {proposalData.portfolioLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePortfolioLink(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>

            {fileUploadError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-800 text-sm">{fileUploadError}</span>
                </div>
              </div>
            )}

            <EnhancedFileUpload
              onFilesUploaded={handleFilesUploaded}
              folder="proposals"
              maxFiles={5}
              maxSize={10}
              showPreview={true}
              showDownload={false}
              showDelete={true}
              onFileRemoved={handleFileRemoved}
            />

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{file.fileName}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileRemoved(file.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <textarea
              value={proposalData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional information you'd like to share..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href={`/freelancer/projects/${projectId}`}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Proposal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
