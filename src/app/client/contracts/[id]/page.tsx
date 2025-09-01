'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Download,
  Upload,
  Eye,
  Edit,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { contractAPI } from '@/lib/api';
import { paymentAPI } from '@/lib/api/payment';

interface Contract {
  id: string;
  project: {
    id: string;
    title: string;
    description: string;
    requirements?: string;
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
      size: number;
    }>;
  };
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    rating: number;
    skills: string[];
    portfolio?: string;
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
    deliverables?: Array<{
      id: string;
      name: string;
      url: string;
      uploadedAt: string;
    }>;
  }>;
  totalPaid: number;
  remainingAmount: number;
  messages: Array<{
    id: string;
    sender: 'client' | 'freelancer';
    message: string;
    timestamp: string;
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
    }>;
  }>;
}

export default function ContractDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'messages' | 'files'>('overview');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadContract();
    } else {
      router.push('/login');
    }
  }, [router, contractId]);

  const loadContract = async () => {
    try {
      const response = await contractAPI.getContract(contractId);
      setContract(response.data);
    } catch (error) {
      console.error('Failed to load contract:', error);
      // Mock data for demonstration
      const mockContract: Contract = {
        id: contractId,
        project: {
          id: '1',
          title: 'Build E-commerce Website',
          description: 'Full-stack e-commerce website with payment integration',
          requirements: 'React frontend, Node.js backend, MongoDB database, Stripe payment integration',
          attachments: [
            {
              id: '1',
              name: 'requirements.pdf',
              url: '/files/requirements.pdf',
              size: 2048576
            }
          ]
        },
        freelancer: {
          id: '1',
          firstName: 'John',
          lastName: 'Developer',
          email: 'john@example.com',
          rating: 4.9,
          skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          portfolio: 'https://johndeveloper.dev'
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
            dueDate: '2024-01-25T00:00:00Z',
            deliverables: [
              {
                id: '1',
                name: 'project_plan.pdf',
                url: '/files/project_plan.pdf',
                uploadedAt: '2024-01-25T10:00:00Z'
              }
            ]
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
        remainingAmount: 1650,
        messages: [
          {
            id: '1',
            sender: 'freelancer',
            message: 'Hi! I\'ve completed the project setup and planning phase. Please review the attached project plan.',
            timestamp: '2024-01-25T10:00:00Z',
            attachments: [
              {
                id: '1',
                name: 'project_plan.pdf',
                url: '/files/project_plan.pdf'
              }
            ]
          },
          {
            id: '2',
            sender: 'client',
            message: 'Great work! The project plan looks good. You can proceed with the frontend development.',
            timestamp: '2024-01-25T14:30:00Z'
          }
        ]
      };
      setContract(mockContract);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    if (!contract) return;

    try {
      await contractAPI.approveMilestone(contract.id, milestoneId);
      setContract(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map(milestone =>
            milestone.id === milestoneId
              ? { ...milestone, status: 'completed' }
              : milestone
          ),
          totalPaid: prev.totalPaid + (prev.milestones.find(m => m.id === milestoneId)?.amount || 0),
          remainingAmount: prev.remainingAmount - (prev.milestones.find(m => m.id === milestoneId)?.amount || 0)
        };
      });
    } catch (error) {
      console.error('Failed to approve milestone:', error);
      alert('Failed to approve milestone. Please try again.');
    }
  };

  const handleRejectMilestone = async (milestoneId: string) => {
    if (!contract) return;

    try {
      await contractAPI.rejectMilestone(contract.id, milestoneId, 'Work does not meet requirements', 'Please revise according to specifications');
      setContract(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map(milestone =>
            milestone.id === milestoneId
              ? { ...milestone, status: 'rejected' }
              : milestone
          )
        };
      });
    } catch (error) {
      console.error('Failed to reject milestone:', error);
      alert('Failed to reject milestone. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!contract || !newMessage.trim()) return;

    // For now, just add to local state (API integration needed)
    setContract(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            sender: 'client',
            message: newMessage.trim(),
            timestamp: new Date().toISOString()
          }
        ]
      };
    });
    setNewMessage('');
  };

  const handleCreatePayment = async (milestoneId: string) => {
    if (!contract) return;

    const milestone = contract.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    try {
      const paymentData = {
        payeeId: contract.freelancer.id,
        projectId: contract.project.id,
        amount: milestone.amount * 100, // Convert to cents for Stripe
        currency: 'usd',
        milestoneId: milestoneId
      };

      const response = await paymentAPI.createPaymentIntent(paymentData);

      // For demo purposes, simulate payment creation
      alert(`Payment intent created successfully! Amount: $${milestone.amount}`);

      // In a real implementation, you would redirect to Stripe checkout
      // or handle the payment confirmation here

    } catch (error) {
      console.error('Failed to create payment:', error);
      alert('Failed to create payment. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user || isLoading || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <Link
              href="/client/contracts"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contracts
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Contract Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">
                  {contract.project.title}
                </h1>
                <p className="text-gray-600 mb-4">{contract.project.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
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
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${getStatusColor(contract.status)}`}>
                {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
              </div>
              <div className="text-3xl font-bold text-gray-900 font-poppins mb-2">
                ${contract.budget.amount}
              </div>
              <div className="text-sm text-gray-500">
                ${contract.totalPaid} paid • ${contract.remainingAmount} remaining
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'milestones', label: 'Milestones', icon: CheckCircle },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'files', label: 'Files', icon: Upload }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                      <p className="text-gray-600">{contract.project.requirements}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Freelancer Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {contract.freelancer.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Contract Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                        <span className="font-medium text-gray-900">Total Budget</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mt-2">${contract.budget.amount}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="font-medium text-gray-900">Paid</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mt-2">${contract.totalPaid}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-orange-500 mr-2" />
                        <span className="font-medium text-gray-900">Remaining</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mt-2">${contract.remainingAmount}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
              <div className="space-y-4">
                {contract.milestones.map((milestone) => (
                  <div key={milestone.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{milestone.title}</h4>
                        <p className="text-gray-600 text-sm">{milestone.description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>${milestone.amount}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due {formatDate(milestone.dueDate)}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {milestone.status === 'pending' && contract.status === 'active' && (
                          <>
                            <Button
                              onClick={() => handleApproveMilestone(milestone.id)}
                              variant="premium"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectMilestone(milestone.id)}
                              variant="outline"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {milestone.status === 'completed' && (
                          <Button
                            onClick={() => handleCreatePayment(milestone.id)}
                            variant="premium"
                            size="sm"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>

                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Deliverables</h5>
                        <div className="space-y-2">
                          {milestone.deliverables.map((deliverable) => (
                            <div key={deliverable.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-700">{deliverable.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {formatDate(deliverable.uploadedAt)}
                                </span>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                    {contract.messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'client'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'client' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {formatDate(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} variant="premium">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Project Files</h3>
                  <div className="space-y-2">
                    {contract.project.attachments?.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Milestone Deliverables</h3>
                  <div className="space-y-2">
                    {contract.milestones.flatMap(milestone =>
                      milestone.deliverables?.map(deliverable => ({
                        ...deliverable,
                        milestoneTitle: milestone.title
                      })) || []
                    ).map((deliverable) => (
                      <div key={deliverable.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{deliverable.name}</p>
                            <p className="text-sm text-gray-500">From: {deliverable.milestoneTitle}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contract Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Contract Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/client/payments">
              <Button variant="premium" className="font-inter">
                <DollarSign className="h-4 w-4 mr-2" />
                View Payment History
              </Button>
            </Link>
            <Link href={`/client/reviews?contract=${contractId}`}>
              <Button variant="outline" className="font-inter">
                <Star className="h-4 w-4 mr-2" />
                Leave Review
              </Button>
            </Link>
            <Link href={`/client/disputes?contract=${contractId}`}>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 font-inter">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Create Dispute
              </Button>
            </Link>
            {contract.status === 'active' && (
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 font-inter">
                <AlertCircle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
