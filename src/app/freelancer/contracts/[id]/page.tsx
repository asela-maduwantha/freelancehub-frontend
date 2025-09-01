'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  Calendar,
  MessageSquare,
  Star,
  AlertCircle,
  Eye,
  Upload,
  Download,
  ExternalLink,
  Send,
  Paperclip,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';
import { contractAPI, authAPI } from '@/lib/api';
import Header from '@/components/ui/Header';

interface Contract {
  id: string;
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    requirements?: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
    email?: string;
  };
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  budget: {
    amount: number;
    currency: string;
  };
  terms: {
    scope: string;
    deadline: string;
    deliverables: string[];
    paymentTerms: string;
  };
  startDate: string;
  endDate?: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    dueDate: string;
    submittedAt?: string;
    completedAt?: string;
    submission?: {
      description: string;
      files: Array<{
        filename: string;
        url: string;
        fileType: string;
      }>;
      submittedAt: string;
    };
    feedback?: string;
  }>;
  progress: number;
}

export default function ContractDetail() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState({
    description: '',
    files: [] as File[],
    deliverables: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    loadContract();
  }, [contractId, router]);

  const loadContract = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await contractAPI.getContract(contractId);
      setContract(response.contract || response.data);
    } catch (error) {
      console.error('Failed to load contract:', error);
      setError('Failed to load contract details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitMilestone = async (milestoneId: string) => {
    if (!submissionData.description.trim()) {
      alert('Please provide a description of your work.');
      return;
    }

    try {
      await contractAPI.submitMilestone(contractId, milestoneId, {
        description: submissionData.description,
        files: submissionData.files.map(f => f.name), // In real implementation, upload files first
        deliverables: submissionData.deliverables
      });

      alert('Milestone submitted successfully!');
      setSelectedMilestone(null);
      setSubmissionData({ description: '', files: [], deliverables: '' });
      loadContract(); // Refresh contract data
    } catch (error) {
      console.error('Failed to submit milestone:', error);
      alert('Failed to submit milestone. Please try again.');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'disputed': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error || 'Contract not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/freelancer/contracts"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Contracts
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{contract.project.title}</h1>
              <p className="text-gray-600 mb-4">{contract.project.description}</p>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(contract.budget.amount, contract.budget.currency)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{contract.client.firstName} {contract.client.lastName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600">{contract.client.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Scope of Work</h3>
                  <p className="text-gray-600">{contract.terms.scope}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Requirements</h3>
                  <p className="text-gray-600">{contract.project.requirements || 'No specific requirements listed'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Deliverables</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {contract.terms.deliverables.map((deliverable, index) => (
                      <li key={index}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Start Date</h3>
                    <p className="text-gray-600">{formatDate(contract.startDate)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Deadline</h3>
                    <p className="text-gray-600">{formatDate(contract.terms.deadline)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Milestones</h2>
              <div className="space-y-4">
                {contract.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                            {milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{milestone.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Due: {formatDate(milestone.dueDate)}</span>
                          <span>{formatCurrency(milestone.amount, contract.budget.currency)}</span>
                        </div>
                      </div>
                      {contract.status === 'active' && milestone.status === 'in_progress' && (
                        <button
                          onClick={() => setSelectedMilestone(selectedMilestone === milestone.id ? null : milestone.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          <Upload className="h-4 w-4" />
                          Submit Work
                        </button>
                      )}
                    </div>

                    {/* Submission Form */}
                    {selectedMilestone === milestone.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t pt-4 mt-4"
                      >
                        <h4 className="font-medium text-gray-900 mb-3">Submit Your Work</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description of Work Completed
                            </label>
                            <textarea
                              value={submissionData.description}
                              onChange={(e) => setSubmissionData(prev => ({ ...prev, description: e.target.value }))}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Describe what you've completed for this milestone..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Deliverables
                            </label>
                            <textarea
                              value={submissionData.deliverables}
                              onChange={(e) => setSubmissionData(prev => ({ ...prev, deliverables: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="List the specific deliverables you're submitting..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Attach Files
                            </label>
                            <input
                              type="file"
                              multiple
                              onChange={(e) => setSubmissionData(prev => ({
                                ...prev,
                                files: Array.from(e.target.files || [])
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSubmitMilestone(milestone.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                              <Send className="h-4 w-4" />
                              Submit Milestone
                            </button>
                            <button
                              onClick={() => setSelectedMilestone(null)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Submission Details */}
                    {milestone.submission && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
                        <p className="text-gray-600 mb-2">{milestone.submission.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Clock className="h-4 w-4" />
                          <span>Submitted on {formatDate(milestone.submission.submittedAt)}</span>
                        </div>
                        {milestone.submission.files.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Attached Files</h5>
                            <div className="space-y-1">
                              {milestone.submission.files.map((file, fileIndex) => (
                                <div key={fileIndex} className="flex items-center gap-2 text-sm">
                                  <Paperclip className="h-4 w-4 text-gray-500" />
                                  <span>{file.filename}</span>
                                  <button className="text-blue-500 hover:text-blue-700">
                                    <Download className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback */}
                    {milestone.feedback && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Client Feedback</h4>
                        <p className="text-gray-600">{milestone.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{contract.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${contract.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {contract.milestones.filter(m => m.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {contract.milestones.filter(m => m.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Client Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {contract.client.avatar ? (
                    <img src={contract.client.avatar} alt="Client" className="w-12 h-12 rounded-full" />
                  ) : (
                    <User className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {contract.client.firstName} {contract.client.lastName}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{contract.client.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  <span>Message Client</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>View Project Details</span>
                </div>
              </div>
            </motion.div>

            {/* Payment Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
              <p className="text-gray-600 text-sm">{contract.terms.paymentTerms}</p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total Amount</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(contract.budget.amount, contract.budget.currency)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
