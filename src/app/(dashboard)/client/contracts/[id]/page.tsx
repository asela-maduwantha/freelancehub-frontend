'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { ContractResponse, contractService } from '../../../../../lib/api/contracts';
import { JobResponse, jobService } from '../../../../../lib/api/jobs';
import { ProposalResponse, proposalService } from '../../../../../lib/api/proposals';
import CreateMilestoneModal from '../../../../../components/features/contracts/CreateMilestoneModal';
import CancelContractModal from '../../../../../components/features/contracts/CancelContractModal';
import { ComponentLoader } from '../../../../../components/common/Loading';
import { Badge } from '../../../../../components/ui/Display';
import Button from '../../../../../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../../../components/ui/Card';
import { ChatInterface } from '../../../../../components/features/messaging/ChatInterface';
import { conversationsApi } from '../../../../../lib/api/messages';
import Breadcrumb from '../../../../../components/common/Breadcrumb';
import { useToast } from '../../../../../components/common/Toast';
import { 
  Eye, FileText, Clock, CheckCircle, Calendar, MapPin, Briefcase, 
  Star, MessageSquare, Download, ChevronRight, TrendingUp, User,
  MoreVertical, AlertCircle, DollarSign, Zap, XCircle, Plus,
  Paperclip, Send, Filter, Search, Activity as ActivityIcon,
  FolderOpen, Mail, Settings, HelpCircle, Award, Target,
  BarChart3, PieChart, CreditCard, Shield, Lock, Check,
  X, Loader2, Upload, File, Image, Video, Archive
} from 'lucide-react';

type TabType = 'overview' | 'milestones' | 'activity' | 'documents' | 'messages';

interface Activity {
  id: string;
  type: 'contract_created' | 'payment_made' | 'milestone_created' | 'milestone_completed' | 'message_sent' | 'status_changed' | 'document_uploaded';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  metadata?: any;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'client' | 'freelancer';
  timestamp: string;
  attachments?: Document[];
}

interface ContractWithDetails extends ContractResponse {
  job?: JobResponse;
  proposal?: ProposalResponse;
}

// Helper Functions (moved outside component for reuse)
const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'secondary';
  }
};

const getContractHealth = (contract: ContractWithDetails) => {
  if (!contract) return { score: 0, status: 'unknown', recommendations: [] };

  let score = 100;
  const recommendations = [];

  // Check if contract is overdue
  if (contract.endDate && new Date(contract.endDate) < new Date()) {
    score -= 30;
    recommendations.push('Contract is overdue - consider extending deadline');
  }

  // Check milestone completion rate
  const completionRate = contract.milestoneCount > 0 ? (contract.completedMilestones || 0) / contract.milestoneCount * 100 : 100;
  if (completionRate < 50) {
    score -= 20;
    recommendations.push('Milestone completion rate is low');
  }

  // Check payment status
  if ((contract.totalPaid || 0) < contract.totalAmount * 0.5) {
    score -= 15;
    recommendations.push('Payment progress is behind schedule');
  }

  const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';

  return { score, status, recommendations };
};

const getProgressPercentage = (contract: ContractWithDetails) => {
  if (!contract || contract.milestoneCount === 0) {
    console.log('Progress calculation: No contract or milestoneCount is 0', {
      contract: !!contract,
      milestoneCount: contract?.milestoneCount
    });
    return 0;
  }
  const percentage = Math.round(((contract.completedMilestones || 0) / contract.milestoneCount) * 100);
  console.log('Progress calculation:', {
    completed: contract.completedMilestones || 0,
    total: contract.milestoneCount,
    percentage
  });
  return percentage;
};

// Tab Navigation Component
const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  tabCounts 
}: { 
  activeTab: TabType; 
  onTabChange: (tab: TabType) => void; 
  tabCounts: Record<TabType, number>;
}) => {
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Eye, count: tabCounts.overview },
    { id: 'milestones' as TabType, label: 'Milestones', icon: Target, count: tabCounts.milestones },
    { id: 'activity' as TabType, label: 'Activity', icon: ActivityIcon, count: tabCounts.activity },
    { id: 'documents' as TabType, label: 'Documents', icon: FolderOpen, count: tabCounts.documents },
    { id: 'messages' as TabType, label: 'Messages', icon: Mail, count: tabCounts.messages }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-2 md:space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ contract, activities }: { contract: ContractWithDetails; activities: Activity[] }) => {
  const health = getContractHealth(contract);
  const progressPercentage = getProgressPercentage(contract);

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Progress</p>
                <p className="text-2xl font-bold text-blue-900">{progressPercentage}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {contract.completedMilestones || 0} of {contract.milestoneCount} milestones
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Payment Status Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Paid</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(contract.totalPaid || 0, contract.currency)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-4">
              of {formatCurrency(contract.totalAmount, contract.currency)} total
            </p>
          </CardBody>
        </Card>

        {/* Health Score Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Health</p>
                <p className="text-2xl font-bold text-purple-900">{health.score}%</p>
              </div>
              <ActivityIcon className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-600 mt-4 capitalize">{health.status}</p>
          </CardBody>
        </Card>

        {/* Timeline Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Timeline</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xs text-orange-600 mt-4">
              {formatDate(contract.endDate)}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Contract Timeline */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Contract Timeline</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(activity.timestamp)} by {activity.actor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Contract Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Contract Information</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {contract.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{contract.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Start Date</h4>
                  <p className="text-sm text-gray-600">{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">End Date</h4>
                  <p className="text-sm text-gray-600">{formatDate(contract.endDate)}</p>
                </div>
              </div>

              {contract.estimatedHours && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Estimated Hours</h4>
                  <p className="text-sm text-gray-600">{contract.estimatedHours} hours</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Contract Value</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(contract.totalAmount, contract.currency)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Paid</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(contract.totalPaid || 0, contract.currency)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Released to Freelancer</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(contract.releasedAmount || 0, contract.currency)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Held Balance</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(contract.remainingAmount || 0, contract.currency)}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

// Activity Tab Component
const ActivityTab = ({ 
  activities, 
  activityFilter, 
  setActivityFilter 
}: { 
  activities: Activity[]; 
  activityFilter: string; 
  setActivityFilter: (filter: string) => void;
}) => {
  const filteredActivities = activityFilter === 'all' ? activities : activities.filter(a => a.type === activityFilter);
  
  const activityTypes = [
    { value: 'all', label: 'All Activity', count: activities.length },
    { value: 'contract_created', label: 'Contract Created', count: activities.filter(a => a.type === 'contract_created').length },
    { value: 'payment_made', label: 'Payments', count: activities.filter(a => a.type === 'payment_made').length },
    { value: 'milestone_completed', label: 'Milestones', count: activities.filter(a => a.type === 'milestone_completed').length },
    { value: 'message_sent', label: 'Messages', count: activities.filter(a => a.type === 'message_sent').length }
  ];

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {activityTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setActivityFilter(type.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activityFilter === type.value
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            {type.label} ({type.count})
          </button>
        ))}
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No activities found for the selected filter.</p>
              </div>
            ) : (
              filteredActivities.map((activity, index) => {
                const getActivityIcon = (type: string) => {
                  switch (type) {
                    case 'contract_created': return FileText;
                    case 'payment_made': return DollarSign;
                    case 'milestone_completed': return CheckCircle;
                    case 'message_sent': return MessageSquare;
                    default: return ActivityIcon;
                  }
                };
                
                const Icon = getActivityIcon(activity.type);
                
                return (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      {index < filteredActivities.length - 1 && (
                        <div className="absolute top-10 left-5 w-0.5 h-full bg-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">by {activity.actor}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

// Documents Tab Component
const DocumentsTab = ({ documents }: { documents: Document[] }) => {
  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardBody className="p-6">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
            <p className="text-gray-600 mb-4">Share files related to this contract</p>
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              <Upload className="w-4 h-4" />
              Choose Files
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Contract Documents</h3>
        </CardHeader>
        <CardBody>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => {
                const getFileIcon = (type: string) => {
                  switch (type.toLowerCase()) {
                    case 'pdf': return File;
                    case 'doc':
                    case 'docx': return FileText;
                    case 'jpg':
                    case 'jpeg':
                    case 'png': return Image;
                    case 'mp4':
                    case 'avi': return Video;
                    default: return File;
                  }
                };
                
                const Icon = getFileIcon(doc.type);
                
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-8 h-8 text-gray-400" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                        <p className="text-xs text-gray-500">
                          {doc.size} bytes • Uploaded by {doc.uploadedBy} on {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

// Messages Tab Component - Uses real chat interface
const MessagesTab = ({ contractId }: { contractId: string }) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        // Fetch conversations for this contract
        const response = await conversationsApi.getConversations({ contractId });
        
        if (response.success && response.data.conversations.length > 0) {
          // Use the first conversation for this contract
          setConversationId(response.data.conversations[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchConversation();
    }
  }, [contractId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <Card>
        <CardBody className="p-12">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversation yet</h3>
            <p className="text-gray-600">
              Messages for this contract will appear here once communication begins.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="h-[600px] bg-white rounded-lg border border-gray-200 overflow-hidden">
      <ChatInterface conversationId={conversationId} contractId={contractId} />
    </div>
  );
};

// Milestones Tab Component
const MilestonesTab = ({ contract }: { contract: ContractWithDetails }) => {
  return (
    <div className="space-y-6">
      {/* Milestones Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
          <p className="text-sm text-gray-600">
            {contract.completedMilestones || 0} of {contract.milestoneCount} milestones completed
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Milestone
        </Button>
      </div>

      {/* Milestones List */}
      <Card>
        <CardBody>
          {contract.milestoneCount === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No milestones created yet.</p>
              <Button className="mt-4">Create First Milestone</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mock milestones for demonstration */}
              {Array.from({ length: contract.milestoneCount }, (_, i) => {
                const isCompleted = i < (contract.completedMilestones || 0);
                const milestoneAmount = contract.totalAmount / contract.milestoneCount;
                
                return (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Milestone {i + 1}</h4>
                        <p className="text-sm text-gray-600">
                          {isCompleted ? 'Completed' : 'Pending'} • {formatCurrency(milestoneAmount, contract.currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={isCompleted ? 'success' : 'secondary'}>
                        {isCompleted ? 'Completed' : 'Pending'}
                      </Badge>
                      {!isCompleted && (
                        <Button variant="outline" size="sm">
                          Release Payment
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default function ClientContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<ContractWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state variables for enhanced UI
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Cancel contract modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const toast = useToast();
  
  // Check URL query parameter for initial tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as TabType;
      if (tabParam && ['overview', 'milestones', 'activity', 'documents', 'messages'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showEndContractModal, setShowEndContractModal] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Milestone modal state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch the contract
        const contractData = await contractService.getContract(contractId);

        // Fetch related job and proposal data
        const [job, proposal] = await Promise.all([
          jobService.getJob(typeof contractData.jobId === 'object' ? contractData.jobId._id : contractData.jobId).catch(() => undefined),
          contractData.proposalId ? proposalService.getProposal(typeof contractData.proposalId === 'object' ? contractData.proposalId._id : contractData.proposalId).catch(() => undefined) : Promise.resolve(undefined)
        ]);

        setContract({
          ...contractData,
          job,
          proposal
        });

        // Generate mock activities based on contract data
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'contract_created',
            title: 'Contract Created',
            description: `Contract for "${contractData.title}" was created`,
            timestamp: contractData.createdAt,
            actor: 'System'
          },
          {
            id: '2',
            type: 'payment_made',
            title: 'Initial Payment',
            description: `Payment of ${formatCurrency(contractData.totalPaid || 0)} was processed`,
            timestamp: contractData.createdAt,
            actor: 'Client'
          }
        ];

        // Add milestone activities if any
        if (contractData.milestoneCount > 0) {
          for (let i = 0; i < contractData.completedMilestones; i++) {
            mockActivities.push({
              id: `milestone-${i + 1}`,
              type: 'milestone_completed',
              title: `Milestone ${i + 1} Completed`,
              description: `Milestone payment of ${formatCurrency((contractData.totalAmount / contractData.milestoneCount))} was released`,
              timestamp: new Date(Date.now() - (i * 86400000)).toISOString(),
              actor: 'Freelancer'
            });
          }
        }

        setActivities(mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

        // Generate mock documents
        const mockDocuments: Document[] = [
          {
            id: '1',
            name: 'Contract Agreement.pdf',
            type: 'pdf',
            size: 245760,
            uploadedAt: contractData.createdAt,
            uploadedBy: 'System',
            url: '#'
          }
        ];
        setDocuments(mockDocuments);

        // Debug logging for milestone data
        console.log('Contract milestone data:', {
          milestoneCount: contractData.milestoneCount,
          completedMilestones: contractData.completedMilestones,
          totalAmount: contractData.totalAmount,
          status: contractData.status
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load contract details');
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContractDetails();
    }
  }, [contractId]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getFilteredActivities = () => {
    if (activityFilter === 'all') return activities;
    return activities.filter(activity => activity.type === activityFilter);
  };

  const getTabCounts = () => {
    return {
      overview: 1,
      milestones: contract?.milestoneCount || 0,
      activity: activities.length,
      documents: documents.length,
      messages: 0 // Messages are loaded dynamically in the MessagesTab
    };
  };

  const getContractActions = () => {
    if (!contract) return [];

    const actions = [];

    if (contract.status === 'active') {
      actions.push(
        { label: 'Create Milestone', icon: Plus, action: handleCreateMilestone },
        { label: 'View Milestones', icon: Target, action: () => router.push(`/client/contracts/${contractId}/milestones`) },
        { label: 'Message Freelancer', icon: MessageSquare, action: () => setActiveTab('messages') },
        { label: 'End Contract', icon: XCircle, action: () => setShowEndContractModal(true) }
      );
    } else if (contract.status === 'pending') {
      actions.push(
        { label: 'Make Payment', icon: CreditCard, action: () => router.push(`/client/contracts/${contractId}/payment`) },
        { label: 'View Details', icon: Eye, action: () => setActiveTab('overview') },
        { label: 'Cancel Contract', icon: XCircle, action: () => setShowEndContractModal(true) }
      );
    } else if (contract.status === 'completed') {
      actions.push(
        { label: 'Leave Review', icon: Star, action: () => {/* TODO */} },
        { label: 'Download Invoice', icon: Download, action: () => {/* TODO */} },
        { label: 'Hire Again', icon: User, action: () => {/* TODO */} }
      );
    }

    return actions;
  };

  const handleCreateMilestone = () => {
    setIsMilestoneModalOpen(true);
  };

  const handleViewMilestones = () => {
    router.push(`/client/contracts/${contractId}/milestones`);
  };

  const handleBackToContracts = () => {
    router.push('/client/contracts');
  };

  const handleMilestoneCreated = () => {
    // Refresh the contract data to update milestone count
    if (contractId) {
      const fetchUpdatedContract = async () => {
        try {
          const contractData = await contractService.getContract(contractId);
          setContract(prev => prev ? { ...prev, ...contractData } : null);
        } catch (err) {
          console.error('Failed to refresh contract data:', err);
        }
      };
      fetchUpdatedContract();
    }
  };

  const canCreateMilestone = contract && (contract.status === 'active' || contract.status === 'pending');

  // Check if user can cancel this contract
  const canCancelContract = contract && (
    contract.status === 'pending' || 
    contract.status === 'pending_payment_method' || 
    contract.status === 'active'
  );

  // Handle contract cancellation
  const handleCancelContract = async () => {
    if (!contract) return;

    try {
      await contractService.cancelContract(contract._id);
      toast.success('Contract cancelled successfully');
      
      // Refresh contract data to show updated status
      const updatedContract = await contractService.getContract(contractId);
      setContract(prev => prev ? { ...prev, ...updatedContract } : null);
      
      // Close the modal
      setShowCancelModal(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel contract. Please try again.';
      toast.error(errorMessage);
      throw err; // Re-throw to let modal handle it
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="client">
        <div className="space-y-6">
          <div className="flex justify-center py-12">
            <ComponentLoader size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout userRole="client">
        <div className="space-y-6">
          <div className="mb-6">
            {/* Breadcrumb Navigation */}
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '/client/dashboard' },
                { label: 'Contracts', href: '/client/contracts', icon: <FileText size={16} /> },
                { label: 'Contract Details' }
              ]}
              className="mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Contract Details</h1>
          </div>
          <div className="alert-error rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-error mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-error mb-2">Error Loading Contract</h3>
              <p className="text-error">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/client/dashboard' },
            { label: 'Contracts', href: '/client/contracts', icon: <FileText size={16} /> },
            { label: contract.title || 'Contract Details' }
          ]}
        />

        {/* Enhanced Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-100">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex-1 w-full">
              {/* Contract Title and Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{contract.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant={getStatusBadgeVariant(contract.status)} className="px-3 py-1">
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </Badge>
                    {contract.contractType && (
                      <Badge variant="secondary" className="px-3 py-1">
                        {contract.contractType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      Contract #{typeof contract._id === 'string' ? contract._id.slice(-6) : 'N/A'}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  {contract.milestoneCount > 0 && (
                    <div className="max-w-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Project Progress</span>
                        <span className="text-sm text-gray-500">
                          {contract.completedMilestones || 0} / {contract.milestoneCount} milestones
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${getProgressPercentage(contract)}%` }}
                        ></div>
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-sm font-semibold text-blue-600">{getProgressPercentage(contract)}% Complete</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-6">
                  {canCreateMilestone && (
                    <Button variant="primary" onClick={handleCreateMilestone} className="flex items-center justify-center gap-2 w-full sm:w-auto">
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Create Milestone</span>
                      <span className="sm:hidden">Milestone</span>
                    </Button>
                  )}
                  <Button variant="secondary" onClick={handleViewMilestones} className="flex items-center justify-center gap-2 w-full sm:w-auto">
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">View Milestones</span>
                    <span className="sm:hidden">Milestones</span>
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('messages')} className="flex items-center justify-center gap-2 w-full sm:w-auto">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                  {canCancelContract && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCancelModal(true)} 
                      className="flex items-center justify-center gap-2 w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Cancel Contract</span>
                      <span className="sm:hidden">Cancel</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          tabCounts={getTabCounts()} 
        />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && <OverviewTab contract={contract} activities={activities} />}
          {activeTab === 'milestones' && <MilestonesTab contract={contract} />}
          {activeTab === 'activity' && <ActivityTab activities={activities} activityFilter={activityFilter} setActivityFilter={setActivityFilter} />}
          {activeTab === 'documents' && <DocumentsTab documents={documents} />}
          {activeTab === 'messages' && <MessagesTab contractId={contractId} />}
        </div>

       

        {/* Create Milestone Modal */}
        {contract && (
          <CreateMilestoneModal
            isOpen={isMilestoneModalOpen}
            onClose={() => setIsMilestoneModalOpen(false)}
            contract={contract}
            onMilestoneCreated={handleMilestoneCreated}
          />
        )}

        {/* Cancel Contract Modal */}
        {contract && (
          <CancelContractModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleCancelContract}
            contract={contract}
            userRole="client"
          />
        )}
      </div>
    </DashboardLayout>
  );
}