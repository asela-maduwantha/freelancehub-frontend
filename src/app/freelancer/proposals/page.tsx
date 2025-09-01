'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  DollarSign,
  Clock,
  Calendar,
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertCircle,
  Filter,
  Search,
  FileText,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { freelancerAPI } from '@/lib/api';
import { contractAPI } from '@/lib/api';

interface Proposal {
  _id: string;
  coverLetter: string;
  proposedBudget: number;
  proposedDuration: {
    value: number;
    unit: string;
  };
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    deliveryDate: string;
  }>;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'contract_created';
  clientViewed: boolean;
  createdAt: string;
  updatedAt: string;
  contractId?: string; // Add contract ID reference
  projectId: {
    _id: string;
    title: string;
    description: string;
    category: string;
    subcategory: string;
    status: string;
    budget: number;
    budgetType: string;
    deadline: string;
    workType: string[];
    experienceLevel: string;
    requiredSkills: Array<{
      skill: string;
      level: string;
    }>;
    clientId: {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture: string;
      phone: string;
      location: {
        country: string;
        city: string;
        timezone: string;
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

interface ProposalFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProposalFilters>({
    page: 1,
    limit: 10
  });
  const [totalProposals, setTotalProposals] = useState(0);
  const [contracts, setContracts] = useState<{[key: string]: any}>({});
  const [loadingContracts, setLoadingContracts] = useState<{[key: string]: boolean}>({});
  const [creatingContract, setCreatingContract] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, [filters]);

  useEffect(() => {
    // Fetch contract details for proposals that have contracts or are accepted
    proposals.forEach(proposal => {
      console.log('Checking proposal:', proposal._id, 'Status:', proposal.status, 'ContractId:', proposal.contractId);
      if ((proposal.status === 'accepted' && !loadingContracts[proposal._id])) {
        if (proposal.contractId) {
          console.log('Fetching contract details for contractId:', proposal.contractId);
          fetchContractDetails(proposal.contractId);
        } else {
          // For accepted proposals without contractId, try to find contract by proposal
          console.log('Fetching contract by proposal for proposalId:', proposal._id);
          fetchContractByProposal(proposal._id);
        }
      }
    });
  }, [proposals]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await freelancerAPI.getProposals(filters);
      setProposals(response.proposals || []);
      setTotalProposals(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err: any) {
      console.error('Failed to fetch proposals:', err);
      setError(err.message || 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ProposalFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleCreateContract = async (proposalId: string) => {
    try {
      setCreatingContract(proposalId);
      const response = await contractAPI.createContractFromProposal(proposalId);
      
      // Update the proposal status to show contract is created
      setProposals(prev => prev.map(p => 
        p._id === proposalId 
          ? { ...p, status: 'contract_created' as any, contractId: response.contract._id } 
          : p
      ));
      
      alert('Contract created successfully! You can now view it in your contracts section.');
    } catch (error: any) {
      console.error('Failed to create contract:', error);
      alert('Failed to create contract. Please try again.');
    } finally {
      setCreatingContract(null);
    }
  };

  const fetchContractDetails = async (contractId: string) => {
    if (contracts[contractId] || loadingContracts[contractId]) return;
    
    try {
      setLoadingContracts(prev => ({ ...prev, [contractId]: true }));
      const response = await contractAPI.getContract(contractId);
      setContracts(prev => ({ ...prev, [contractId]: response.contract || response.data }));
    } catch (error) {
      console.error('Failed to fetch contract details:', error);
    } finally {
      setLoadingContracts(prev => ({ ...prev, [contractId]: false }));
    }
  };

  const fetchContractByProposal = async (proposalId: string) => {
    if (loadingContracts[proposalId]) return;

    console.log('fetchContractByProposal called for proposalId:', proposalId);

    try {
      setLoadingContracts(prev => ({ ...prev, [proposalId]: true }));

      // Get all contracts for the current user and find the one matching this proposal
      console.log('Getting all contracts to find match for proposalId:', proposalId);
      const response = await contractAPI.getContracts();
      console.log('All contracts response:', response);

      if (response.contracts && response.contracts.length > 0) {
        // Find contract that matches this proposal
        const matchingContract = response.contracts.find((contract: any) => contract.proposalId === proposalId);
        console.log('Matching contract found:', matchingContract);

        if (matchingContract) {
          console.log('Found contract for proposal:', matchingContract);
          setContracts(prev => ({ ...prev, [matchingContract._id]: matchingContract }));
          // Update proposal to include contractId
          setProposals(prev => prev.map(p =>
            p._id === proposalId
              ? { ...p, contractId: matchingContract._id, status: 'contract_created' as any }
              : p
          ));
        } else {
          console.log('No matching contract found for proposalId:', proposalId);
          // As a fallback, let's also check if there are any contracts for this freelancer
          // that might not have the proposalId set correctly
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            const freelancerContracts = response.contracts.filter((contract: any) =>
              contract.freelancerId === user.id || contract.freelancerId?._id === user.id
            );
            console.log('Freelancer contracts found:', freelancerContracts);

            // Try to match by project ID if proposalId doesn't match
            const proposal = proposals.find(p => p._id === proposalId);
            if (proposal) {
              const projectMatchingContract = freelancerContracts.find((contract: any) =>
                contract.projectId === proposal.projectId._id || contract.projectId?._id === proposal.projectId._id
              );
              if (projectMatchingContract) {
                console.log('Found contract by project match:', projectMatchingContract);
                setContracts(prev => ({ ...prev, [projectMatchingContract._id]: projectMatchingContract }));
                setProposals(prev => prev.map(p =>
                  p._id === proposalId
                    ? { ...p, contractId: projectMatchingContract._id, status: 'contract_created' as any }
                    : p
                ));
              }
            }
          }
        }
      } else {
        console.log('No contracts found at all');
      }
    } catch (error) {
      console.error('Failed to fetch contract by proposal:', error);
    } finally {
      setLoadingContracts(prev => ({ ...prev, [proposalId]: false }));
    }
  };  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'contract_created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'contract_created':
        return <FileText className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'withdrawn':
        return <XCircle className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatBudget = (budget: number, budgetType: string) => {
    if (budgetType === 'fixed') {
      return `$${budget.toLocaleString()}`;
    }
    return `$${budget.toLocaleString()}/hr`;
  };

  const formatDuration = (duration: { value: number; unit: string }) => {
    return `${duration.value} ${duration.unit}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'technology': '💻',
      'design': '🎨',
      'writing': '✍️',
      'marketing': '📢',
      'business': '💼',
      'consulting': '🤝'
    };
    return icons[category] || '📋';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
              <p className="mt-2 text-gray-600">
                Track the status of your submitted proposals
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link
                href="/freelancer/projects"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Find More Projects
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search proposals by project title..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="contract_created">Contract Created</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${totalProposals} proposals found`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                console.log('Manual contract test triggered');
                try {
                  const response = await contractAPI.getContracts();
                  console.log('Manual contract test response:', response);
                  alert(`Found ${response.contracts?.length || 0} contracts`);
                } catch (error) {
                  console.error('Manual contract test error:', error);
                  alert('Error fetching contracts: ' + error);
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Test Contracts API
            </button>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </div>
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : proposals.length > 0 ? (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <motion.div
                key={proposal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(proposal.projectId.category)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {proposal.projectId.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Client: {proposal.projectId.clientId.firstName} {proposal.projectId.clientId.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(proposal.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(proposal.status)}
                          <span className="capitalize">
                            {proposal.status === 'contract_created' ? 'Contract Created' : proposal.status}
                          </span>
                        </div>
                      </span>
                    </div>
                  </div>

                  {/* Proposal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Your Bid: {formatBudget(proposal.proposedBudget, proposal.projectId.budgetType)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Duration: {formatDuration(proposal.proposedDuration)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Submitted: {formatTimeAgo(proposal.createdAt)}</span>
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {proposal.coverLetter}
                    </p>
                  </div>

                  {/* Milestones */}
                  {proposal.milestones.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Milestones</h4>
                      <div className="space-y-2">
                        {proposal.milestones.slice(0, 2).map((milestone: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{milestone.title}</span>
                            <span className="font-medium">${milestone.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        {proposal.milestones.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{proposal.milestones.length - 2} more milestones
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contract Details */}
                  {(() => {
                    const contractId = proposal.contractId;
                    const contract = contractId ? contracts[contractId] : null;
                    const hasContract = contract || Object.values(contracts).some(c => c?.proposalId === proposal._id);
                    
                    if ((proposal.status === 'contract_created' || (proposal.status === 'accepted' && hasContract)) && hasContract) {
                      const actualContractId = contractId || Object.keys(contracts).find(id => contracts[id]?.proposalId === proposal._id);
                      const actualContract = contract || contracts[actualContractId!];
                      
                      return (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Contract Details
                          </h4>
                          {actualContract ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  actualContract.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {actualContract.status}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Budget:</span>
                                <span className="font-medium">${actualContract.terms?.budget?.toLocaleString() || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Start Date:</span>
                                <span className="font-medium">
                                  {actualContract.terms?.startDate 
                                    ? new Date(actualContract.terms.startDate).toLocaleDateString() 
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center py-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-sm text-blue-600">Loading contract details...</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <Link
                        href={`/freelancer/projects/${proposal.projectId._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Project
                      </Link>
                      {proposal.status === 'pending' && (
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Withdraw Proposal
                        </button>
                      )}
                      {proposal.status === 'accepted' && (
                        <>
                          {(() => {
                            // Check if we have a contract for this proposal
                            const contractId = proposal.contractId;
                            const contract = contractId ? contracts[contractId] : null;
                            const hasContract = contract || Object.values(contracts).some(c => c?.proposalId === proposal._id);
                            
                            if (hasContract) {
                              const actualContractId = contractId || Object.keys(contracts).find(id => contracts[id]?.proposalId === proposal._id);
                              return (
                                <Link
                                  href={`/freelancer/contracts/${actualContractId}`}
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Contract
                                </Link>
                              );
                            } else {
                              return (
                                <button
                                  onClick={() => handleCreateContract(proposal._id)}
                                  disabled={creatingContract === proposal._id}
                                  className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {creatingContract === proposal._id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Creating...
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Create Contract
                                    </>
                                  )}
                                </button>
                              );
                            }
                          })()}
                        </>
                      )}
                      {proposal.status === 'contract_created' && (
                        <Link
                          href="/freelancer/contracts"
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Contract
                        </Link>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(() => {
                        if (proposal.status === 'accepted') {
                          const contractId = proposal.contractId;
                          const contract = contractId ? contracts[contractId] : null;
                          const hasContract = contract || Object.values(contracts).some(c => c?.proposalId === proposal._id);
                          
                          if (hasContract) {
                            return <span className="text-green-600 font-medium">🎉 Proposal Accepted! Contract is ready to view.</span>;
                          } else {
                            return <span className="text-green-600 font-medium">🎉 Proposal Accepted! Create contract to start working.</span>;
                          }
                        }
                        if (proposal.status === 'contract_created') {
                          return <span className="text-blue-600 font-medium">📄 Contract created successfully!</span>;
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any proposals yet. Start by finding projects that match your skills.
            </p>
            <Link
              href="/freelancer/projects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Projects
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                disabled={filters.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                const isCurrent = page === filters.page;
                
                return (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, (filters.page || 1) + 1))}
                disabled={filters.page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
