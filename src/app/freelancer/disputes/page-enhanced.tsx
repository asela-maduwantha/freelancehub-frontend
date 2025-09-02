'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  MessageSquare,
  Paperclip,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Upload,
  Send,
  Search,
  Filter,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import AppLayout from '@/components/layout/AppLayout';

interface Dispute {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contract: {
    id: string;
    projectTitle: string;
    client: {
      id: string;
      name: string;
    };
    amount: number;
  };
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    sender: {
      id: string;
      name: string;
      type: 'freelancer' | 'client' | 'admin';
    };
    message: string;
    timestamp: string;
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
    }>;
  }>;
  evidence: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
    description?: string;
  }>;
  resolution?: {
    outcome: string;
    details: string;
    resolvedAt: string;
    resolvedBy: string;
  };
}

interface NewDisputeForm {
  title: string;
  description: string;
  contractId: string;
  evidence: File[];
}

interface Filters {
  status: string;
  priority: string;
  search: string;
}

const statusFilters = [
  { value: '', label: 'All Disputes' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

const priorityFilters = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export default function DisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewDisputeModal, setShowNewDisputeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState<((toast: any) => void) | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    status: '',
    priority: '',
    search: ''
  });

  const [newDispute, setNewDispute] = useState<NewDisputeForm>({
    title: '',
    description: '',
    contractId: '',
    evidence: []
  });

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    averageResolutionTime: '0 days'
  });

  useEffect(() => {
    // Safely get the toast function after mounting
    try {
      const { showToast: toastFn } = useToast();
      setShowToast(() => toastFn);
    } catch (error) {
      // Toast context not available during SSR
      console.warn('Toast context not available');
    }
  }, []);

  useEffect(() => {
    loadDisputes();
  }, [filters]);

  const loadDisputes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data - replace with actual API call
      const mockDisputes: Dispute[] = [
        {
          id: '1',
          title: 'Payment Delay Issue',
          description: 'Client has not released payment for completed milestone despite approval.',
          status: 'in_progress',
          priority: 'high',
          contract: {
            id: 'contract1',
            projectTitle: 'E-commerce Website Development',
            client: {
              id: 'client1',
              name: 'John Smith'
            },
            amount: 250000
          },
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T14:20:00Z',
          messages: [
            {
              id: 'msg1',
              sender: {
                id: 'freelancer1',
                name: 'Sarah Johnson',
                type: 'freelancer'
              },
              message: 'I completed the milestone on January 10th but payment has not been released yet. The client approved the work but the payment is still pending.',
              timestamp: '2024-01-15T10:30:00Z'
            },
            {
              id: 'msg2',
              sender: {
                id: 'admin1',
                name: 'Support Team',
                type: 'admin'
              },
              message: 'Thank you for reporting this issue. We are investigating the payment delay and will update you within 24 hours.',
              timestamp: '2024-01-16T09:15:00Z'
            }
          ],
          evidence: [
            {
              id: 'evidence1',
              name: 'milestone_completion_screenshot.png',
              url: '/evidence/screenshot.png',
              type: 'image',
              uploadedAt: '2024-01-15T10:35:00Z',
              description: 'Screenshot showing milestone completion and client approval'
            }
          ]
        },
        {
          id: '2',
          title: 'Scope Creep Dispute',
          description: 'Client requesting additional features not included in original contract.',
          status: 'resolved',
          priority: 'medium',
          contract: {
            id: 'contract2',
            projectTitle: 'Mobile App UI/UX Design',
            client: {
              id: 'client2',
              name: 'Jane Doe'
            },
            amount: 180000
          },
          createdAt: '2024-01-08T16:45:00Z',
          updatedAt: '2024-01-12T11:30:00Z',
          messages: [
            {
              id: 'msg3',
              sender: {
                id: 'freelancer1',
                name: 'Sarah Johnson',
                type: 'freelancer'
              },
              message: 'Client is requesting additional screens that were not part of the original scope. I need clarification on how to proceed.',
              timestamp: '2024-01-08T16:45:00Z'
            }
          ],
          evidence: [
            {
              id: 'evidence2',
              name: 'original_contract.pdf',
              url: '/evidence/contract.pdf',
              type: 'document',
              uploadedAt: '2024-01-08T16:50:00Z',
              description: 'Original contract showing agreed scope'
            }
          ],
          resolution: {
            outcome: 'Resolved in favor of freelancer',
            details: 'Additional work requires separate agreement and payment. Original scope maintained.',
            resolvedAt: '2024-01-12T11:30:00Z',
            resolvedBy: 'Support Team'
          }
        }
      ];

      // Apply filters
      let filteredDisputes = mockDisputes;
      if (filters.status) {
        filteredDisputes = filteredDisputes.filter(d => d.status === filters.status);
      }
      if (filters.priority) {
        filteredDisputes = filteredDisputes.filter(d => d.priority === filters.priority);
      }
      if (filters.search) {
        filteredDisputes = filteredDisputes.filter(d => 
          d.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          d.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          d.contract.projectTitle.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setDisputes(filteredDisputes);

      // Calculate stats
      setStats({
        total: mockDisputes.length,
        open: mockDisputes.filter(d => d.status === 'open').length,
        inProgress: mockDisputes.filter(d => d.status === 'in_progress').length,
        resolved: mockDisputes.filter(d => d.status === 'resolved').length,
        averageResolutionTime: '3.5 days'
      });

    } catch (error) {
      console.error('Failed to load disputes:', error);
      setError('Failed to load disputes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateDispute = async () => {
    try {
      setIsSubmitting(true);

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', newDispute.title);
      formData.append('description', newDispute.description);
      formData.append('contractId', newDispute.contractId);
      
      newDispute.evidence.forEach((file, index) => {
        formData.append(`evidence`, file);
      });

      // API call to create dispute
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create dispute');
      }

      showToast?.({ 
        title: 'Success', 
        message: 'Dispute created successfully!', 
        type: 'success' 
      });
      setShowNewDisputeModal(false);
      setNewDispute({ title: '', description: '', contractId: '', evidence: [] });
      loadDisputes();

    } catch (error) {
      console.error('Failed to create dispute:', error);
      showToast?.({ 
        title: 'Error', 
        message: 'Failed to create dispute', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      key: 'title' as keyof Dispute,
      title: 'Dispute',
      render: (value: string, dispute: Dispute) => (
        <div>
          <Link href={`/freelancer/disputes/${dispute.id}`}>
            <h3 className="font-medium text-gray-900 hover:text-green-600 transition-colors mb-1">
              {value}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 line-clamp-2">{dispute.description}</p>
          <p className="text-sm text-gray-500 mt-1">
            Project: {dispute.contract.projectTitle}
          </p>
        </div>
      )
    },
    {
      key: 'status' as keyof Dispute,
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'priority' as keyof Dispute,
      title: 'Priority',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'contract' as keyof Dispute,
      title: 'Contract Value',
      render: (value: any) => (
        <div>
          <p className="font-semibold text-gray-900">{formatCurrency(value.amount)}</p>
          <p className="text-sm text-gray-600">Client: {value.client.name}</p>
        </div>
      )
    },
    {
      key: 'createdAt' as keyof Dispute,
      title: 'Created',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatDate(value)}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (dispute: Dispute) => {
        router.push(`/freelancer/disputes/${dispute.id}`);
      },
      icon: Eye
    },
    {
      label: 'View Contract',
      onClick: (dispute: Dispute) => {
        router.push(`/freelancer/contracts/${dispute.contract.id}`);
      },
      icon: FileText
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">
              Disputes & Issues
            </h1>
            <p className="text-gray-600 font-inter">
              Manage and track dispute resolution for your projects
            </p>
          </div>
          <Button 
            onClick={() => setShowNewDisputeModal(true)}
            variant="premium" 
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Dispute</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Resolution</p>
                <p className="text-lg font-bold text-gray-900">{stats.averageResolutionTime}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search disputes..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
            >
              {statusFilters.map(filter => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
            >
              {priorityFilters.map(filter => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Disputes Table */}
        <DataTable
          data={disputes}
          columns={columns}
          loading={isLoading}
          emptyTitle="No disputes found"
          emptyDescription="You haven't created any disputes yet. If you encounter issues with projects, you can create a dispute here."
          emptyIcon={AlertTriangle}
          actions={actions}
          onRowClick={(dispute) => router.push(`/freelancer/disputes/${dispute.id}`)}
          rowClassName={(dispute) => 
            dispute.status === 'open' ? 'bg-red-50 border-red-200' :
            dispute.status === 'in_progress' ? 'bg-yellow-50 border-yellow-200' :
            dispute.status === 'resolved' ? 'bg-green-50 border-green-200' : ''
          }
        />

        {/* Create Dispute Modal */}
        <Modal
          isOpen={showNewDisputeModal}
          onClose={() => setShowNewDisputeModal(false)}
          title="Create New Dispute"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dispute Title
              </label>
              <input
                type="text"
                value={newDispute.title}
                onChange={(e) => setNewDispute(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract
              </label>
              <select
                value={newDispute.contractId}
                onChange={(e) => setNewDispute(prev => ({ ...prev, contractId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a contract</option>
                <option value="contract1">E-commerce Website Development</option>
                <option value="contract2">Mobile App UI/UX Design</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                value={newDispute.description}
                onChange={(e) => setNewDispute(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Provide detailed information about the dispute..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload screenshots, documents, or other evidence
                </p>
                <Button variant="outline">
                  Choose Files
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowNewDisputeModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDispute}
                disabled={isSubmitting || !newDispute.title || !newDispute.description || !newDispute.contractId}
                variant="premium"
              >
                {isSubmitting ? 'Creating...' : 'Create Dispute'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic';
