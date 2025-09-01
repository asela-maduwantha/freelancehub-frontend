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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { contractAPI } from '@/lib/api';
import Header from '@/components/ui/Header';

interface Contract {
  id: string;
  project: {
    id: string;
    title: string;
    description: string;
  };
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
  };
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  budget: {
    amount: number;
    currency: string;
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
  }>;
  totalPaid: number;
  remainingAmount: number;
}

export default function ClientContractsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

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
      const response = await contractAPI.getContracts();
      setContracts(response.data || []);
    } catch (error) {
      console.error('Failed to load contracts:', error);
      // Mock data for demonstration
      const mockContracts: Contract[] = [
        {
          id: '1',
          project: {
            id: '1',
            title: 'Build E-commerce Website',
            description: 'Full-stack e-commerce website with payment integration'
          },
          freelancer: {
            id: '1',
            firstName: 'John',
            lastName: 'Developer',
            rating: 4.9
          },
          status: 'active',
          budget: { amount: 2200, currency: 'USD' },
          startDate: '2024-01-20T00:00:00Z',
          milestones: [
            {
              id: '1',
              title: 'Setup and Planning',
              description: 'Project setup, requirements gathering, and planning phase',
              amount: 550,
              status: 'completed',
              dueDate: '2024-01-25T00:00:00Z'
            },
            {
              id: '2',
              title: 'Frontend Development',
              description: 'Build responsive frontend with React',
              amount: 1100,
              status: 'in_progress',
              dueDate: '2024-02-10T00:00:00Z'
            },
            {
              id: '3',
              title: 'Backend Development',
              description: 'Build REST API and database integration',
              amount: 550,
              status: 'pending',
              dueDate: '2024-02-20T00:00:00Z'
            }
          ],
          totalPaid: 550,
          remainingAmount: 1650
        },
        {
          id: '2',
          project: {
            id: '2',
            title: 'Mobile App UI Design',
            description: 'Design modern UI/UX for fitness tracking app'
          },
          freelancer: {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Designer',
            rating: 4.8
          },
          status: 'completed',
          budget: { amount: 1100, currency: 'USD' },
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-01-30T00:00:00Z',
          milestones: [
            {
              id: '4',
              title: 'Wireframes and Mockups',
              description: 'Create wireframes and high-fidelity mockups',
              amount: 550,
              status: 'completed',
              dueDate: '2024-01-22T00:00:00Z'
            },
            {
              id: '5',
              title: 'Interactive Prototype',
              description: 'Build interactive prototype with Figma',
              amount: 550,
              status: 'completed',
              dueDate: '2024-01-30T00:00:00Z'
            }
          ],
          totalPaid: 1100,
          remainingAmount: 0
        }
      ];
      setContracts(mockContracts);
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
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
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
      await contractAPI.approveMilestone(contractId, milestoneId);
      // Update local state
      setContracts(prev => prev.map(contract => {
        if (contract.id === contractId) {
          return {
            ...contract,
            milestones: contract.milestones.map(milestone =>
              milestone.id === milestoneId
                ? { ...milestone, status: 'completed' }
                : milestone
            ),
            totalPaid: contract.totalPaid + (contract.milestones.find(m => m.id === milestoneId)?.amount || 0),
            remainingAmount: contract.remainingAmount - (contract.milestones.find(m => m.id === milestoneId)?.amount || 0)
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
      await contractAPI.rejectMilestone(contractId, milestoneId, 'Work does not meet requirements', 'Please revise according to specifications');
      // Update local state
      setContracts(prev => prev.map(contract => {
        if (contract.id === contractId) {
          return {
            ...contract,
            milestones: contract.milestones.map(milestone =>
              milestone.id === milestoneId
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

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
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
                  ? 'bg-blue-100 text-blue-800'
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
                key={contract.id}
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
                          {contract.project.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{contract.project.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>{contract.freelancer.firstName} {contract.freelancer.lastName}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span>{contract.freelancer.rating}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Started {formatDate(contract.startDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(contract.status)}`}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 font-poppins">
                        ${contract.budget.amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${contract.totalPaid} paid • ${contract.remainingAmount} remaining
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">
                    Milestones
                  </h4>
                  <div className="space-y-4">
                    {contract.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                              {milestone.status.replace('_', ' ')}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>${milestone.amount}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Due {formatDate(milestone.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {milestone.status === 'pending' && contract.status === 'active' && (
                            <>
                              <Button
                                onClick={() => handleApproveMilestone(contract.id, milestone.id)}
                                variant="premium"
                                size="sm"
                                className="font-inter"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectMilestone(contract.id, milestone.id)}
                                variant="outline"
                                size="sm"
                                className="font-inter"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {milestone.status === 'in_progress' && (
                            <div className="text-sm text-blue-600 font-medium">
                              In Progress
                            </div>
                          )}
                          {milestone.status === 'completed' && (
                            <div className="text-sm text-green-600 font-medium">
                              Completed
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
                      <Link href={`/client/messages?contract=${contract.id}`}>
                        <Button variant="outline" size="sm" className="font-inter">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message Freelancer
                        </Button>
                      </Link>
                      <Link href={`/client/contracts/${contract.id}`}>
                        <Button variant="outline" size="sm" className="font-inter">
                          View Details
                        </Button>
                      </Link>
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
    </div>
  );
}
