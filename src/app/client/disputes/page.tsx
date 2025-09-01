'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Upload,
  FileText,
  AlertCircle,
  ArrowLeft,
  Calendar,
  User,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { disputeAPI, Dispute, CreateDisputeData } from '@/lib/api/dispute';
import { contractAPI } from '@/lib/api/contract';
import { uploadAPI } from '@/lib/api/upload';

interface Contract {
  id: string;
  project: {
    id: string;
    title: string;
  };
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: string;
}

function ClientDisputesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = searchParams.get('contract');

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create dispute form state
  const [disputeForm, setDisputeForm] = useState({
    contractId: '',
    reason: 'quality',
    description: '',
    priority: 'medium' as const,
    evidence: [] as File[]
  });

  useEffect(() => {
    fetchDisputes();
    fetchContracts();

    if (contractId) {
      // Pre-select contract if provided in URL
      setDisputeForm(prev => ({ ...prev, contractId }));
    }
  }, [contractId]);

  const fetchDisputes = async () => {
    try {
      const response = await disputeAPI.getUserDisputes();
      setDisputes(response);
    } catch (err: any) {
      console.error('Failed to fetch disputes:', err);
      setError('Failed to load disputes');
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await contractAPI.getContracts();
      // Filter for completed contracts that can have disputes
      const eligibleContracts = response.filter((contract: Contract) =>
        ['completed', 'in_progress', 'delivered'].includes(contract.status)
      );
      setContracts(eligibleContracts);

      // Auto-select contract if only one is available
      if (eligibleContracts.length === 1) {
        setSelectedContract(eligibleContracts[0]);
        setDisputeForm(prev => ({ ...prev, contractId: eligibleContracts[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to fetch contracts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!disputeForm.contractId || !disputeForm.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Upload evidence files if any
      let evidence = [];
      if (disputeForm.evidence.length > 0) {
        for (const file of disputeForm.evidence) {
          const uploadResponse = await uploadAPI.uploadFile(file, 'dispute-evidence');
          evidence.push({
            filename: file.name,
            url: uploadResponse.data.url,
            fileType: file.type,
            fileSize: file.size,
            description: `Evidence file: ${file.name}`
          });
        }
      }

      const disputeData: CreateDisputeData = {
        contractId: disputeForm.contractId,
        reason: disputeForm.reason,
        description: disputeForm.description,
        priority: disputeForm.priority,
        evidence
      };

      await disputeAPI.createDispute(disputeData);

      setSuccess('Dispute created successfully!');
      setShowCreateForm(false);
      setDisputeForm({
        contractId: '',
        reason: 'quality',
        description: '',
        priority: 'medium',
        evidence: []
      });

      // Refresh disputes list
      await fetchDisputes();

      // Redirect after success
      setTimeout(() => {
        router.push('/client/disputes');
      }, 2000);

    } catch (err: any) {
      console.error('Failed to create dispute:', err);
      setError(err.message || 'Failed to create dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDisputeForm(prev => ({
      ...prev,
      evidence: [...prev.evidence, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setDisputeForm(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'under_review': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/client/dashboard"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">Dispute Management</h1>
                <p className="text-gray-600 font-inter">Handle project disputes and issues</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-red-600 hover:bg-red-700 font-poppins"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Dispute
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Create Dispute Modal */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 font-poppins">Create New Dispute</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateDispute} className="space-y-6">
                  {/* Contract Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Contract *
                    </label>
                    <select
                      value={disputeForm.contractId}
                      onChange={(e) => {
                        const contract = contracts.find(c => c.id === e.target.value);
                        setSelectedContract(contract || null);
                        setDisputeForm(prev => ({ ...prev, contractId: e.target.value }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Choose a contract...</option>
                      {contracts.map((contract) => (
                        <option key={contract.id} value={contract.id}>
                          {contract.project.title} - {contract.freelancer.firstName} {contract.freelancer.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Dispute *
                    </label>
                    <select
                      value={disputeForm.reason}
                      onChange={(e) => setDisputeForm(prev => ({ ...prev, reason: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="quality">Quality Issues</option>
                      <option value="deadline">Missed Deadline</option>
                      <option value="communication">Communication Problems</option>
                      <option value="payment">Payment Issues</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={disputeForm.priority}
                      onChange={(e) => setDisputeForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={disputeForm.description}
                      onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Please provide detailed information about the dispute..."
                      required
                    />
                  </div>

                  {/* Evidence Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evidence Files (Optional)
                    </label>
                    <div className="space-y-3">
                      {disputeForm.evidence.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      ))}

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          onChange={handleFileChange}
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          className="hidden"
                          id="evidence-upload"
                        />
                        <label
                          htmlFor="evidence-upload"
                          className="cursor-pointer text-blue-600 hover:text-blue-800"
                        >
                          Add evidence files
                        </label>
                        <p className="text-gray-500 text-sm mt-1">
                          PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="font-inter"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700 font-poppins"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Dispute'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Disputes List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 font-poppins">Your Disputes</h2>
            <p className="text-gray-600 font-inter mt-1">Track and manage all your project disputes</p>
          </div>

          {disputes.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
              <p className="text-gray-500 mb-6">
                You haven't created any disputes yet. If you encounter issues with a project, you can create a dispute here.
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-red-600 hover:bg-red-700 font-poppins"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Dispute
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {disputes.map((dispute) => (
                <motion.div
                  key={dispute.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                          {dispute.projectTitle}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                          {getStatusIcon(dispute.status)}
                          <span className="ml-1 capitalize">{dispute.status.replace('_', ' ')}</span>
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                          {dispute.priority}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{dispute.freelancerName}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          <span className="capitalize">{dispute.reason}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{dispute.description}</p>

                      {dispute.resolution && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="font-medium text-green-800">Resolution</span>
                          </div>
                          <p className="text-green-700">{dispute.resolution.description}</p>
                          {dispute.resolution.amount && (
                            <p className="text-green-600 font-medium mt-1">
                              Refund Amount: ${dispute.resolution.amount}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-inter"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {dispute.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 font-inter"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Evidence
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientDisputesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <ClientDisputesPageContent />
    </Suspense>
  );
}
