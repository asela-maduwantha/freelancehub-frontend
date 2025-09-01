'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Send,
  Paperclip,
  User,
  Calendar,
  Filter,
  Search,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { disputeAPI, authAPI } from '@/lib/api';
import Header from '@/components/ui/Header';

interface Dispute {
  id: string;
  contractId: string;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  clientId: string;
  clientName: string;
  reason: 'quality' | 'deadline' | 'communication' | 'payment' | 'other';
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
    description: string;
  }>;
  resolution?: {
    decision: 'client_favored' | 'freelancer_favored' | 'partial_refund' | 'mediation';
    amount?: number;
    description: string;
    resolvedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DisputeStats {
  total: number;
  open: number;
  underReview: number;
  resolved: number;
  closed: number;
}

export default function FreelancerDisputes() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'under_review' | 'resolved' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showNewDisputeForm, setShowNewDisputeForm] = useState(false);
  const [newDispute, setNewDispute] = useState({
    contractId: '',
    reason: 'quality' as Dispute['reason'],
    description: '',
    priority: 'medium' as Dispute['priority']
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    loadDisputes();
  }, [router]);

  const loadDisputes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load disputes
      const disputesResponse = await disputeAPI.getUserDisputes();
      setDisputes(disputesResponse as Dispute[]);

      // Load stats
      const statsResponse = await disputeAPI.getDisputeStats();
      setStats(statsResponse as DisputeStats);
    } catch (error) {
      console.error('Failed to load disputes:', error);
      setError('Failed to load disputes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, [filter]);

  const handleAddMessage = async (disputeId: string) => {
    if (!messageText.trim()) {
      alert('Please enter a message.');
      return;
    }

    try {
      await disputeAPI.addMessage(disputeId, messageText);
      alert('Message sent successfully!');
      setSelectedDispute(null);
      setMessageText('');
      loadDisputes(); // Refresh disputes
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleCreateDispute = async () => {
    if (!newDispute.contractId || !newDispute.description.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      await disputeAPI.createDispute(newDispute);
      alert('Dispute created successfully!');
      setShowNewDisputeForm(false);
      setNewDispute({
        contractId: '',
        reason: 'quality',
        description: '',
        priority: 'medium'
      });
      loadDisputes(); // Refresh disputes
    } catch (error) {
      console.error('Failed to create dispute:', error);
      alert('Failed to create dispute. Please try again.');
    }
  };

  const filteredDisputes = disputes.filter(dispute =>
    dispute.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'under_review': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-gray-600 bg-gray-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Disputes</h1>
              <p className="text-gray-600">Manage and resolve project disputes</p>
            </div>
            <button
              onClick={() => setShowNewDisputeForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Dispute
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Closed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* New Dispute Form */}
        {showNewDisputeForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Dispute</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract ID *
                </label>
                <input
                  type="text"
                  value={newDispute.contractId}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, contractId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter contract ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <select
                  value={newDispute.reason}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, reason: e.target.value as Dispute['reason'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="quality">Quality Issues</option>
                  <option value="deadline">Deadline Issues</option>
                  <option value="communication">Communication Issues</option>
                  <option value="payment">Payment Issues</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  value={newDispute.priority}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, priority: e.target.value as Dispute['priority'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newDispute.description}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe the issue in detail..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateDispute}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                Create Dispute
              </button>
              <button
                onClick={() => setShowNewDisputeForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search disputes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {(['all', 'open', 'under_review', 'resolved', 'closed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'under_review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Disputes List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDisputes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms.' : 'You haven\'t created any disputes yet.'}
                </p>
              </div>
            ) : (
              filteredDisputes.map((dispute, index) => (
                <motion.div
                  key={dispute.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {dispute.projectTitle}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                          {dispute.status.replace('_', ' ').charAt(0).toUpperCase() + dispute.status.replace('_', ' ').slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                          {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{dispute.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>vs {dispute.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{dispute.reason.charAt(0).toUpperCase() + dispute.reason.slice(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatDate(dispute.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDispute(selectedDispute === dispute.id ? null : dispute.id)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </button>
                      <Link
                        href={`/freelancer/disputes/${dispute.id}`}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Resolution */}
                  {dispute.resolution && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Resolution</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-gray-900">
                            {dispute.resolution.decision.replace('_', ' ').charAt(0).toUpperCase() + dispute.resolution.decision.replace('_', ' ').slice(1)}
                          </span>
                          {dispute.resolution.amount && (
                            <span className="text-sm text-gray-600">
                              (${dispute.resolution.amount})
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{dispute.resolution.description}</p>
                        <p className="text-sm text-gray-500">
                          Resolved on {formatDate(dispute.resolution.resolvedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Message Form */}
                  {selectedDispute === dispute.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t pt-4 mt-4"
                    >
                      <h4 className="font-medium text-gray-900 mb-3">Send Message</h4>
                      <div className="space-y-4">
                        <textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Type your message..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddMessage(dispute.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            <Send className="h-4 w-4" />
                            Send Message
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDispute(null);
                              setMessageText('');
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
