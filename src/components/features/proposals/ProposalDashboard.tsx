'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Clock, DollarSign, User, Star, MessageCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { proposalApi, type Proposal, type ProposalFilters } from '@/lib/api/proposals';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import Image from 'next/image';

interface ProposalDashboardProps {
  userRole: 'freelancer' | 'client';
  userId?: string;
  projectId?: string;
}

export default function ProposalDashboard({ userRole, userId, projectId }: ProposalDashboardProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    fetchProposals();
  }, [searchTerm, selectedStatus, sortBy, currentPage]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const filters: ProposalFilters = {
        page: currentPage,
        limit: 12,
        sortBy: sortBy as any,
        sortOrder: 'desc'
      };

      if (selectedStatus) filters.status = selectedStatus;
      if (projectId) filters.projectId = projectId;

      let response;
      if (userRole === 'freelancer') {
        response = await proposalApi.getMyProposals(filters);
      } else {
        response = await proposalApi.getReceivedProposals(filters);
      }

      // Handle case where response might be undefined
      const proposals = response?.proposals || [];
      const totalPages = response?.totalPages || 1;
      const total = response?.total || 0;

      setProposals(proposals);
      setTotalPages(totalPages);
      
      // Calculate stats
      const statusCounts = proposals.reduce((acc, proposal) => {
        acc[proposal.status] = (acc[proposal.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        total,
        pending: statusCounts.pending || 0,
        accepted: statusCounts.accepted || 0,
        rejected: statusCounts.rejected || 0
      });

    } catch (err) {
      setError('Failed to fetch proposals');
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await proposalApi.acceptProposal(proposalId);
      fetchProposals(); // Refresh the list
    } catch (err) {
      console.error('Error accepting proposal:', err);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await proposalApi.rejectProposal(proposalId, 'Not selected');
      fetchProposals(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting proposal:', err);
    }
  };

  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const color = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    return (
      <Badge className={color}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const ProposalCard = ({ proposal }: { proposal: Proposal }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Link href={`/proposals/${proposal._id}`}>
                <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
                  {proposal.project?.title || 'Project Title'}
                </h3>
              </Link>
              {getStatusBadge(proposal.status)}
            </div>
          </div>

          {/* Freelancer/Client Info */}
          <div className="flex items-center space-x-3">
            {userRole === 'client' && proposal.freelancer ? (
              <>
                {proposal.freelancer.profilePicture ? (
                  <Image
                    src={proposal.freelancer.profilePicture}
                    alt={`${proposal.freelancer.firstName} ${proposal.freelancer.lastName}`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {proposal.freelancer.firstName} {proposal.freelancer.lastName}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{proposal.freelancer.rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>{proposal.freelancer.completedProjects} projects</span>
                  </div>
                </div>
              </>
            ) : proposal.client ? (
              <>
                {proposal.client.profilePicture ? (
                  <Image
                    src={proposal.client.profilePicture}
                    alt={`${proposal.client.firstName} ${proposal.client.lastName}`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {proposal.client.firstName} {proposal.client.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Client</p>
                </div>
              </>
            ) : null}
          </div>

          {/* Cover Letter Preview */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
            <p className="text-gray-600 text-sm line-clamp-3">
              {proposal.coverLetter}
            </p>
          </div>

          {/* Bid Details */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm">
              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
              <div>
                <p className="text-gray-600">Bid Amount</p>
                <p className="font-semibold text-gray-900">
                  {formatAmount(proposal.bidAmount, proposal.currency)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <div>
                <p className="text-gray-600">Delivery</p>
                <p className="font-semibold text-gray-900">
                  {proposal.deliveryTime} days
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          {proposal.freelancer?.skills && (
            <div className="flex flex-wrap gap-1">
              {proposal.freelancer.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {skill}
                </span>
              ))}
              {proposal.freelancer.skills.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{proposal.freelancer.skills.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Milestones */}
          {proposal.milestones && proposal.milestones.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Milestones ({proposal.milestones.length})</h4>
              <div className="space-y-1">
                {proposal.milestones.slice(0, 2).map((milestone, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{milestone.title}</span>
                    <span className="font-medium">{formatAmount(milestone.amount)}</span>
                  </div>
                ))}
                {proposal.milestones.length > 2 && (
                  <p className="text-xs text-gray-500">+{proposal.milestones.length - 2} more milestones</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link href={`/proposals/${proposal._id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
            
            {userRole === 'client' && proposal.status === 'pending' && (
              <>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleAcceptProposal(proposal._id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRejectProposal(proposal._id)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {userRole === 'freelancer' && (
              <Link href={`/messages?proposal=${proposal._id}`}>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Date */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Submitted {formatDate(proposal.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userRole === 'freelancer' ? 'My Proposals' : 'Received Proposals'}
          </h1>
          <p className="text-gray-600 mt-1">
            {userRole === 'freelancer' 
              ? 'Track your submitted proposals and their status'
              : 'Review and manage proposals from freelancers'
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Proposals</p>
                <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-xl font-semibold text-gray-900">{stats.accepted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                placeholder="All Statuses"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </Select>
              
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <option value="createdAt">Latest</option>
                <option value="bidAmount">Bid Amount</option>
                <option value="deliveryTime">Delivery Time</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Grid */}
      {error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={fetchProposals}
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
            <p className="text-gray-600 mb-4">
              {userRole === 'freelancer'
                ? "You haven't submitted any proposals yet."
                : "No proposals have been received for your projects."
              }
            </p>
            {userRole === 'freelancer' && (
              <Link href="/projects">
                <Button>Browse Projects</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => (
              <ProposalCard key={proposal._id} proposal={proposal} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
