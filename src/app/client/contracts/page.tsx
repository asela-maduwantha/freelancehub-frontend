'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
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
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { contractsService } from '@/lib/api';
import Header from '@/components/ui/Header';
import ContractApprovalModal from '@/components/ui/ContractApprovalModal';
import { IContract } from '@/lib/types';

export default function ClientContractsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contracts, setContracts] = useState<IContract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<IContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<IContract | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadContracts();
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [contracts, statusFilter]);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      const response = await contractsService.getContracts(user.id);
      setContracts(response || []);
    } catch (error) {
      console.error('Failed to load contracts:', error);
      setError('Failed to load contracts. Please try again.');
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = contracts;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    setFilteredContracts(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApproveMilestone = async (contractId: string, milestoneId: string) => {
    try {
      await contractsService.approveMilestone(contractId, milestoneId);
      // Update local state
      setContracts(prev => prev.map(contract => {
        if (contract._id === contractId) {
          return {
            ...contract,
            milestones: contract.milestones.map(milestone =>
              milestone._id === milestoneId
                ? { ...milestone, status: 'approved' as const }
                : milestone
            ),
            totalPaid: (contract as any).totalPaid || 0 + (contract.milestones.find(m => m._id === milestoneId)?.amount || 0),
            remainingAmount: (contract as any).remainingAmount || contract.terms.budget - (contract.milestones.find(m => m._id === milestoneId)?.amount || 0)
          };
        }
        return contract;
      }));
    } catch (error) {
      console.error('Failed to approve milestone:', error);
      alert('Failed to approve milestone. Please try again.');
    }
  };

  const handleRejectMilestone = async (contractId: string, milestoneId: string) => {
    try {
      await contractsService.rejectMilestone(contractId, milestoneId, 'Work does not meet requirements');
      // Update local state
      setContracts(prev => prev.map(contract => {
        if (contract._id === contractId) {
          return {
            ...contract,
            milestones: contract.milestones.map(milestone =>
              milestone._id === milestoneId
                ? { ...milestone, status: 'rejected' }
                : milestone
            )
          };
        }
        return contract;
      }));
    } catch (error) {
      console.error('Failed to reject milestone:', error);
      alert('Failed to reject milestone. Please try again.');
    }
  };

  const handleApprovalSuccess = (updatedContract: IContract) => {
    setContracts(prev => prev.map(contract =>
      contract._id === updatedContract._id ? updatedContract : contract
    ));
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Contracts</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadContracts} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header backLink="/client/dashboard" backText="Back to Dashboard" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
              My Contracts
            </h1>
            <p className="text-gray-600 font-inter">
              Manage your active contracts and track project progress
            </p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Contracts ({contracts.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({contracts.filter(c => c.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({contracts.filter(c => c.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Contracts List */}
        <div className="space-y-6">
          {filteredContracts.length > 0 ? (
            filteredContracts.map((contract) => (
              <motion.div
                key={contract._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Contract Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1 font-poppins">
                          {contract.projectId.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{contract.projectId.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>{contract.freelancerId.firstName} {contract.freelancerId.lastName}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span>4.9</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Started {formatDate(contract.terms.startDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(contract.status)}`}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 font-poppins">
                        ${contract.terms.budget}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Budget
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 font-poppins">
                      Milestones ({contract.milestones.length})
                    </h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>{contract.milestones.filter(m => m.status === 'approved').length} Approved</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{contract.milestones.filter(m => m.status === 'in-progress').length} In Progress</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {contract.milestones.map((milestone, index) => (
                      <div key={milestone._id} className={`p-5 border-2 rounded-xl transition-all ${
                        milestone.status === 'approved' ? 'border-green-200 bg-green-50' :
                        milestone.status === 'in-progress' ? 'border-green-200 bg-green-50' :
                        milestone.status === 'pending' ? 'border-gray-200 bg-white' :
                        'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="text-lg font-semibold text-gray-900">{milestone.title}</h5>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                milestone.status === 'approved' ? 'bg-green-100 text-green-800' :
                                milestone.status === 'in-progress' ? 'bg-green-100 text-green-800' :
                                milestone.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.replace('_', ' ').slice(1)}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">{milestone.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                                <div>
                                  <p className="text-sm text-gray-600">Amount</p>
                                  <p className="font-semibold text-gray-900">${milestone.amount}</p>
                                </div>
                              </div>
                              <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                                <div>
                                  <p className="text-sm text-gray-600">Due Date</p>
                                  <p className="font-semibold text-gray-900">{formatDate(milestone.dueDate)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                          {milestone.status === 'pending' && contract.status === 'active' && (
                            <>
                              <Button
                                onClick={() => handleApproveMilestone(contract._id, milestone._id)}
                                className="bg-green-600 hover:bg-green-700 px-6 py-2 font-semibold"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Milestone
                              </Button>
                              <Button
                                onClick={() => handleRejectMilestone(contract._id, milestone._id)}
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 px-6 py-2"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          {milestone.status === 'in-progress' && (
                            <div className="flex items-center text-green-600 font-medium px-4 py-2 bg-green-100 rounded-lg">
                              <Clock className="h-4 w-4 mr-2" />
                              In Progress
                            </div>
                          )}
                          {milestone.status === 'approved' && (
                            <div className="flex items-center text-green-600 font-medium px-4 py-2 bg-green-100 rounded-lg">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approved
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
                </div>

                {/* Contract Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <Link href={`/client/messages?contract=${contract._id}`}>
                        <Button variant="outline" size="sm" className="font-inter">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message Freelancer
                        </Button>
                      </Link>
                      <Link href={`/client/contracts/${contract._id}`}>
                        <Button variant="outline" size="sm" className="font-inter">
                          View Details
                        </Button>
                      </Link>
                      {!contract.approvalWorkflow.clientApproved && (
                        <Button
                          onClick={() => {
                            setSelectedContract(contract);
                            setShowApprovalModal(true);
                          }}
                          variant="premium"
                          size="sm"
                          className="font-inter"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve Contract
                        </Button>
                      )}
                      {contract.approvalWorkflow.clientApproved && !contract.approvalWorkflow.freelancerApproved && (
                        <div className="text-sm text-green-600 font-medium">
                          Waiting for freelancer approval
                        </div>
                      )}
                    </div>
                    {contract.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 font-inter"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Report Issue
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
              <p className="text-gray-500 mb-6">
                {statusFilter === 'all'
                  ? 'Contracts will appear here once you accept proposals from freelancers'
                  : `No ${statusFilter} contracts found`
                }
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/client/projects">
                  <Button variant="premium" className="font-poppins">
                    View Projects
                  </Button>
                </Link>
                <Link href="/client/freelancers">
                  <Button variant="outline" className="font-inter">
                    Find Freelancers
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contract Approval Modal */}
      {selectedContract && (
        <ContractApprovalModal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedContract(null);
          }}
          contract={selectedContract}
          userRole="client"
          onApprovalSuccess={handleApprovalSuccess}
        />
      )}
    </div>
  );
}
