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
  CreditCard,
  Shield,
  X
} from 'lucide-react';
import Link from 'next/link';
import { contractsService } from '@/lib/api';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { CreatePaymentForm } from '@/components/payments';
import { useToast } from '@/components/ui/Toast';
import { IContract } from '@/lib/types';

interface Contract {
  _id: string;
  projectId: {
    _id: string;
    title: string;
    description: string;
    category: string;
  };
  freelancerId: {
    _id: string;
    name: string;
    avatar?: string;
    rating?: number;
  };
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  totalAmount: number;
  startDate: string;
  endDate?: string;
  milestones: Array<{
    _id: string;
    title: string;
    description: string;
    amount: number;
    deadline: string;
    status: 'pending' | 'in-progress' | 'approved' | 'rejected';
  }>;
}

export default function ClientContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const contractId = params.id as string;

  const [contract, setContract] = useState<IContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  useEffect(() => {
    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  const loadContract = async () => {
    try {
      setIsLoading(true);
      const response = await contractsService.getContractById(contractId);
      setContract(response);
    } catch (error) {
      console.error('Failed to load contract:', error);
      setError('Failed to load contract details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    try {
      await contractsService.approveMilestone(contractId, milestoneId);
      // Update local state
      setContract(prev => prev ? {
        ...prev,
        milestones: prev.milestones.map(milestone =>
          milestone._id === milestoneId
            ? { ...milestone, status: 'approved' as const }
            : milestone
        )
      } : null);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Milestone approved successfully'
      });
    } catch (error) {
      console.error('Failed to approve milestone:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to approve milestone. Please try again.'
      });
    }
  };

  const handleRejectMilestone = async (milestoneId: string) => {
    try {
      await contractsService.rejectMilestone(contractId, milestoneId, 'Work does not meet requirements');
      // Update local state
      setContract(prev => prev ? {
        ...prev,
        milestones: prev.milestones.map(milestone =>
          milestone._id === milestoneId
            ? { ...milestone, status: 'rejected' as const }
            : milestone
        )
      } : null);
      showToast({
        type: 'error',
        title: 'Milestone Rejected',
        message: 'Milestone has been rejected'
      });
    } catch (error) {
      console.error('Failed to reject milestone:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to reject milestone. Please try again.'
      });
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentForm(false);
    setSelectedMilestone(null);
    showToast({
      type: 'success',
      title: 'Payment Successful',
      message: 'Payment has been processed successfully'
    });
    // Reload contract to get updated payment status
    loadContract();
  };

  const handleDownloadContract = async () => {
    try {
      const pdfBlob = await contractsService.downloadContractPdf(contractId);

      // Create a blob URL for the PDF
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `contract-${contractId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Contract PDF downloaded successfully'
      });
    } catch (error) {
      console.error('Failed to download contract:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to download contract. Please try again.'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Contract</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadContract} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const approvedMilestones = contract.milestones.filter(m => m.status === 'approved');
  const totalApprovedAmount = approvedMilestones.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header backLink="/client/contracts" backText="Back to Contracts" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Contract Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">
                  {contract.projectId.title}
                </h1>
                <p className="text-gray-600 mb-4">{contract.projectId.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{contract.freelancerId.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span>4.9</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Started {formatDate(contract.startDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                contract.status === 'active' ? 'bg-green-100 text-green-800' :
                contract.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
              </div>
              <div className="text-2xl font-bold text-gray-900 font-poppins">
                ${contract.totalAmount}
              </div>
              <div className="text-sm text-gray-500">
                Total Budget
              </div>
            </div>
          </div>

          {/* Contract Actions */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/client/messages?contract=${contract._id}`}>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Freelancer
              </Button>
            </Link>
            <Button
              onClick={handleDownloadContract}
              variant="outline"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </motion.div>

        {/* Payment Summary for Approved Milestones */}
        {approvedMilestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 font-poppins">
                Payment Summary
              </h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${totalApprovedAmount}
                </div>
                <div className="text-sm text-gray-500">
                  Approved Amount
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    {approvedMilestones.length} milestone{approvedMilestones.length > 1 ? 's' : ''} approved and ready for payment
                  </span>
                </div>
                <Button
                  onClick={() => setShowPaymentForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 font-poppins">
              Milestones ({contract.milestones.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {contract.milestones.map((milestone, index) => (
              <div key={milestone._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.replace('_', ' ').slice(1)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{milestone.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold text-gray-900">${milestone.amount}</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Due Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(milestone.deadline)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  {milestone.status === 'pending' && contract.status === 'active' && (
                    <>
                      <Button
                        onClick={() => handleApproveMilestone(milestone._id)}
                        className="bg-green-600 hover:bg-green-700 px-6 py-2"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Milestone
                      </Button>
                      <Button
                        onClick={() => handleRejectMilestone(milestone._id)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 px-6 py-2"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {milestone.status === 'in-progress' && (
                    <div className="flex items-center text-blue-600 font-medium px-4 py-2 bg-blue-100 rounded-lg">
                      <Clock className="h-4 w-4 mr-2" />
                      In Progress
                    </div>
                  )}
                  {milestone.status === 'approved' && (
                    <div className="flex items-center text-green-600 font-medium px-4 py-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approved - Ready for Payment
                    </div>
                  )}
                  {milestone.status === 'rejected' && (
                    <div className="flex items-center text-red-600 font-medium px-4 py-2 bg-red-100 rounded-lg">
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Make Payment</h2>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <CreatePaymentForm
                projectId={contract._id}
                freelancerId={contract.freelancerId._id}
                amount={totalApprovedAmount}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
