// Admin specific types
import { UserStatus, ProjectStatus, PaymentStatus } from './common';
import { User, FreelancerProfile, ClientProfile } from './user';
import { Project } from './project';
import { Payment } from './platform';

export interface AdminDashboardStats {
  overview: {
    totalUsers: number;
    totalFreelancers: number;
    totalClients: number;
    activeProjects: number;
    completedProjects: number;
    totalRevenue: number;
    monthlyRevenue: number;
    platformFees: number;
  };
  growth: {
    userGrowth: number;
    revenueGrowth: number;
    projectGrowth: number;
  };
  recentActivity: AdminActivityItem[];
  systemHealth: SystemHealth;
}

export interface AdminActivityItem {
  type: 'user_registration' | 'project_completed' | 'payment_processed' | 'dispute_raised' | 'policy_violation';
  message: string;
  timestamp: string;
  userId?: string;
  projectId?: string;
  amount?: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: string;
  errorRate: string;
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    storage: ServiceStatus;
    payments?: ServiceStatus;
    notifications?: ServiceStatus;
  };
}

export interface ServiceStatus {
  status: 'healthy' | 'warning' | 'critical';
  responseTime?: string;
  connections?: string;
  hitRate?: string;
  memory?: string;
  usage?: string;
  available?: string;
  lastCheck?: string;
}

export interface PlatformAnalytics {
  revenue: {
    monthly: Array<{
      month: string;
      revenue: number;
      fees: number;
      transactions: number;
    }>;
    total: number;
    growth: number;
  };
  users: {
    registrations: Array<{
      month: string;
      freelancers: number;
      clients: number;
      total: number;
    }>;
    activeUsers: number;
    retentionRate: number;
    churnRate?: number;
  };
  projects: {
    created: number;
    completed: number;
    successRate: number;
    averageValue: number;
    averageDuration?: number;
  };
  topCategories: Array<{
    category: string;
    projectCount: number;
    revenue: number;
    growth: number;
  }>;
  topSkills: Array<{
    skill: string;
    demandCount: number;
    averageRate: number;
    growth: number;
  }>;
}

// User Management
export interface AdminUserView extends User {
  statistics: {
    completedProjects: number;
    activeProjects: number;
    totalEarnings?: number;
    totalSpent?: number;
    rating: number;
    reviewsCount: number;
  };
  flags: UserFlag[];
  warnings: number;
  activityLog: UserActivityLog[];
  riskScore?: number;
  verificationStatus: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    payment: boolean;
  };
}

export interface UserFlag {
  id: string;
  type: 'suspicious_activity' | 'multiple_accounts' | 'payment_issues' | 'policy_violation' | 'fake_profile';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  flaggedAt: string;
  flaggedBy: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface UserActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

export interface BulkUserAction {
  userIds: string[];
  action: 'activate' | 'suspend' | 'ban' | 'verify' | 'flag' | 'send_message';
  reason?: string;
  notes?: string;
  duration?: number; // for temporary actions
}

// Project Management
export interface AdminProjectView extends Project {
  flagged: boolean;
  flagReasons: string[];
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  riskScore: number;
  qualityScore?: number;
}

export interface ProjectReviewAction {
  projectId: string;
  status: 'approved' | 'rejected' | 'requires_changes';
  notes?: string;
  flagReasons?: string[];
  requiresClientContact?: boolean;
}

// Financial Management
export interface FinancialOverview {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    currency: string;
  };
  fees: {
    platformFees: number;
    processingFees: number;
    total: number;
    percentage: number;
  };
  payouts: {
    pending: number;
    processed: number;
    failed: number;
  };
  escrow: {
    held: number;
    released: number;
  };
  transactions: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
}

export interface AdminTransaction {
  id: string;
  type: 'milestone_payment' | 'project_completion' | 'refund' | 'payout' | 'fee_collection';
  amount: number;
  currency: string;
  status: PaymentStatus;
  client?: {
    id: string;
    name: string;
  };
  freelancer?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    title: string;
  };
  fees: {
    platformFee: number;
    processingFee: number;
  };
  processedAt: string;
  paymentMethod: string;
  reference?: string;
  flagged?: boolean;
  flagReason?: string;
}

export interface PayoutApproval {
  id: string;
  freelancerId: string;
  freelancerName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  riskFlags?: string[];
}

// Dispute Management
export interface Dispute {
  id: string;
  projectId: string;
  contractId?: string;
  raisedBy: string;
  raisedAgainst: string;
  type: 'payment' | 'quality' | 'scope' | 'communication' | 'deadline' | 'cancellation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'under_review' | 'awaiting_response' | 'escalated' | 'resolved' | 'closed';
  description: string;
  evidence: DisputeEvidence[];
  timeline: DisputeTimelineEvent[];
  assignedTo?: string;
  priority: number;
  createdAt: string;
  resolvedAt?: string;
  resolution?: DisputeResolution;
}

export interface DisputeEvidence {
  id: string;
  type: 'document' | 'screenshot' | 'communication' | 'payment_proof' | 'work_sample';
  description: string;
  files: string[];
  submittedBy: string;
  submittedAt: string;
}

export interface DisputeTimelineEvent {
  id: string;
  type: 'created' | 'evidence_submitted' | 'response_received' | 'escalated' | 'resolved';
  description: string;
  actor: string;
  timestamp: string;
  data?: any;
}

export interface DisputeResolution {
  outcome: 'favor_client' | 'favor_freelancer' | 'partial_refund' | 'project_cancellation' | 'mediation';
  refundAmount?: number;
  penaltyAmount?: number;
  notes: string;
  resolvedBy: string;
  resolvedAt: string;
  finalStatus: 'closed' | 'appeal_pending';
}

// Content Management
export interface PlatformContent {
  id: string;
  type: 'terms-of-service' | 'privacy-policy' | 'community-guidelines' | 'help-article' | 'faq';
  title: string;
  content: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  language: string;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
    category?: string;
  };
}

export interface CategoryManagement {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  featured: boolean;
  parentId?: string;
  sortOrder: number;
  status: 'active' | 'inactive' | 'deprecated';
  projectCount: number;
  freelancerCount: number;
  averageBudget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkillManagement {
  id: string;
  name: string;
  slug: string;
  category: string;
  aliases: string[];
  description?: string;
  popularity: number;
  demand: 'low' | 'medium' | 'high' | 'very_high';
  freelancerCount: number;
  projectCount: number;
  averageRate?: number;
  trending: boolean;
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

// Reports and Analytics
export interface AdminReport {
  id: string;
  name: string;
  type: 'user_activity' | 'financial' | 'project_performance' | 'fraud_detection' | 'custom';
  description: string;
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  recipients: string[];
  format: 'pdf' | 'csv' | 'excel' | 'json';
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  createdBy: string;
  createdAt: string;
}

export interface ReportParameter {
  name: string;
  type: 'date' | 'user' | 'category' | 'amount' | 'boolean' | 'select';
  value: any;
  required: boolean;
  options?: Array<{
    label: string;
    value: any;
  }>;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
}

// System Configuration
export interface SystemConfiguration {
  general: {
    platformName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    featuredListingPrice: number;
    urgentListingPrice: number;
  };
  fees: {
    freelancerCommission: number;
    clientProcessingFee: number;
    minimumWithdrawal: number;
    withdrawalFee: number;
    disputeFee: number;
  };
  limits: {
    maxFileSize: number;
    maxFilesPerUpload: number;
    maxProposalsPerProject: number;
    maxActiveProjects: number;
    rateLimit: {
      api: number;
      uploads: number;
    };
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireTwoFactor: boolean;
    allowedFileTypes: string[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    slackWebhook?: string;
  };
}
