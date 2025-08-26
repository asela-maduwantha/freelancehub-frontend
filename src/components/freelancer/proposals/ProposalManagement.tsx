'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit3,
  Trash2,
  Eye,
  Download,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { proposalApi, Proposal } from '@/lib/api/proposals';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/context/toast-context';

export function ProposalManagement() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    successRate: 0
  });

  useEffect(() => {
    loadProposals();
  }, [filter]);

  const loadProposals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const filters: any = { 
        page: 1, 
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      if (filter !== 'all') {
        filters.status = filter;
      }
      
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const response = await proposalApi.getMyProposals(filters);
      
      // Handle case where response might be undefined
      const proposals = response?.proposals || [];
      setProposals(proposals);
      
      // Calculate stats
      const all = proposals;
      const pending = all.filter(p => p.status === 'pending').length;
      const accepted = all.filter(p => p.status === 'accepted').length;
      const rejected = all.filter(p => p.status === 'rejected').length;
      const total = all.length;
      const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
      
      setStats({ total, pending, accepted, rejected, successRate });
    } catch (error) {
      console.error('Failed to load proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawProposal = async (proposalId: string) => {
    try {
      await proposalApi.deleteProposal(proposalId);
      toast.success('Proposal withdrawn successfully');
      loadProposals();
    } catch (error) {
      console.error('Failed to withdraw proposal:', error);
      toast.error('Failed to withdraw proposal');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'withdrawn': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = !searchQuery || 
      proposal.project?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.coverLetter.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-gray-600">Total Proposals</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-gray-600">Pending</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          <div className="text-gray-600">Accepted</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-gray-600">Rejected</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
          <div className="text-gray-600">Success Rate</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {['all', 'pending', 'accepted', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter(status as any)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 h-32 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Proposals Found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "You haven't submitted any proposals yet." 
              : `No ${filter} proposals found.`
            }
          </p>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Browse Projects
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {filteredProposals.map((proposal, index) => (
              <motion.div
                key={proposal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {proposal.project?.title || 'Project Title Not Available'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium">
                              {formatCurrency(proposal.bidAmount, proposal.currency)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{proposal.deliveryTime} days</span>
                          </div>
                          <div className="text-gray-500">
                            Submitted {formatDate(proposal.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1`}>
                          {getStatusIcon(proposal.status)}
                          <span className="capitalize">{proposal.status}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Cover Letter Preview */}
                    <div className="mb-4">
                      <p className="text-gray-700 line-clamp-2">
                        {proposal.coverLetter}
                      </p>
                    </div>

                    {/* Project Budget Range */}
                    {proposal.project?.budget && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="text-sm text-gray-600">Project Budget Range</div>
                        <div className="font-medium">
                          {formatCurrency(proposal.project.budget.min, proposal.project.budget.currency)} - {formatCurrency(proposal.project.budget.max, proposal.project.budget.currency)}
                        </div>
                      </div>
                    )}

                    {/* Milestones */}
                    {proposal.milestones && proposal.milestones.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Milestones ({proposal.milestones.length})
                        </div>
                        <div className="space-y-2">
                          {proposal.milestones.slice(0, 2).map((milestone, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{milestone.title}</span>
                              <span className="font-medium">
                                {formatCurrency(milestone.amount, proposal.currency)}
                              </span>
                            </div>
                          ))}
                          {proposal.milestones.length > 2 && (
                            <div className="text-sm text-gray-500">
                              +{proposal.milestones.length - 2} more milestones
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProposal(proposal)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        
                        {proposal.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleWithdrawProposal(proposal._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Withdraw
                            </Button>
                          </>
                        )}
                      </div>
                      
                      {proposal.attachments && proposal.attachments.length > 0 && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          {proposal.attachments.length} Files
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProposal.project?.title}
                  </h2>
                  <Badge className={`${getStatusColor(selectedProposal.status)} flex items-center gap-1 w-fit`}>
                    {getStatusIcon(selectedProposal.status)}
                    <span className="capitalize">{selectedProposal.status}</span>
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProposal(null)}
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Cover Letter</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedProposal.coverLetter}
                    </p>
                  </div>

                  {selectedProposal.milestones && selectedProposal.milestones.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Milestones</h3>
                      <div className="space-y-3">
                        {selectedProposal.milestones.map((milestone, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <span className="font-semibold">
                                {formatCurrency(milestone.amount, selectedProposal.currency)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                            <div className="text-sm text-gray-500">
                              Due: {new Date(milestone.deliveryDate).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Proposal Details</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Bid Amount</div>
                          <div className="font-semibold text-lg">
                            {formatCurrency(selectedProposal.bidAmount, selectedProposal.currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Delivery Time</div>
                          <div className="font-semibold">{selectedProposal.deliveryTime} days</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Submitted</div>
                          <div className="font-semibold">{formatDate(selectedProposal.createdAt)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Status</div>
                          <div className="font-semibold capitalize">{selectedProposal.status}</div>
                        </div>
                      </div>
                    </div>

                    {selectedProposal.project?.budget && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-2">Client Budget Range</div>
                        <div className="font-semibold">
                          {formatCurrency(selectedProposal.project.budget.min, selectedProposal.project.budget.currency)} - {formatCurrency(selectedProposal.project.budget.max, selectedProposal.project.budget.currency)}
                        </div>
                      </div>
                    )}

                    {selectedProposal.attachments && selectedProposal.attachments.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Attachments</h4>
                        <div className="space-y-2">
                          {selectedProposal.attachments.map((attachment, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{attachment}</span>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
