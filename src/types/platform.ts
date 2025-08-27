import { PaymentStatus, Money, MessageType, NotificationType, Priority } from './common';
import { User } from './user';

// Payment and Transaction Types
export interface Payment {
  id: string;
  projectId?: string;
  contractId?: string;
  milestoneId?: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  type: 'milestone' | 'project_completion' | 'bonus' | 'refund' | 'withdrawal';
  status: PaymentStatus;
  description?: string;
  paidAt?: string;
  createdAt: string;
  fees: {
    platformFee: number;
    processingFee: number;
    total: number;
  };
  paymentMethod?: PaymentMethod;
  escrowReleased?: boolean;
  releasedAt?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'crypto';
  last4?: string;
  brand?: string;
  holderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  verified: boolean;
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled';
  contractId?: string;
  milestoneId?: string;
  description?: string;
  createdAt: string;
  fees: {
    platformFee: number;
    processingFee: number;
    total: number;
  };
}

export interface CreatePaymentIntentData {
  contractId?: string;
  milestoneId?: string;
  amount: number;
  currency: string;
  description?: string;
  paymentMethodId?: string;
}

export interface ProcessPaymentData {
  paymentIntentId: string;
  paymentMethodId: string;
  confirmationToken?: string;
}

export interface Payout {
  id: string;
  freelancerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  requestedAt: string;
  processedAt?: string;
  failedAt?: string;
  estimatedProcessingTime?: string;
  fee: number;
  netAmount: number;
  reference?: string;
  failureReason?: string;
}

export interface CreatePayoutRequest {
  amount: number;
  currency?: string;
  paymentMethod: string;
}

// Messaging Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  timestamp: string;
  read: boolean;
  readAt?: string;
  edited: boolean;
  editedAt?: string;
  attachments?: MessageAttachment[];
  replyTo?: string;
  reactions?: MessageReaction[];
  metadata?: any;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
  archived?: boolean;
  muted?: boolean;
  projectId?: string;
  contractId?: string;
}

export interface ConversationParticipant {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  profilePhoto?: string;
  online: boolean;
  lastSeen?: string;
  role?: 'freelancer' | 'client';
}

export interface SendMessageData {
  receiverId?: string;
  conversationId?: string;
  content: string;
  type: MessageType;
  attachments?: string[];
  replyTo?: string;
}

export interface MessageFilters {
  conversationId?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}

// Notifications Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
  priority: Priority;
  category: 'project' | 'payment' | 'message' | 'system' | 'promotion';
  actionUrl?: string;
  imageUrl?: string;
}

export interface NotificationFilters {
  status?: 'read' | 'unread' | 'all';
  category?: string;
  type?: NotificationType;
  priority?: Priority;
  page?: number;
  limit?: number;
  since?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
  byPriority: Record<Priority, number>;
}

// Reviews and Ratings Types
export interface Review {
  id: string;
  projectId: string;
  contractId?: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  title?: string;
  comment: string;
  categories: {
    communication: number;
    quality: number;
    timeline: number;
    overall: number;
  };
  createdAt: string;
  updatedAt?: string;
  verified: boolean;
  helpful: number;
  response?: ReviewResponse;
  anonymous?: boolean;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  response: string;
  createdAt: string;
}

export interface CreateReviewData {
  projectId: string;
  contractId?: string;
  rating: number;
  title?: string;
  comment: string;
  categories: {
    communication: number;
    quality: number;
    timeline: number;
  };
  anonymous?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
  categoryAverages: {
    communication: number;
    quality: number;
    timeline: number;
    overall: number;
  };
}

export interface ReviewFilters {
  userId?: string;
  projectId?: string;
  rating?: number;
  verified?: boolean;
  withResponse?: boolean;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
}

// File Management Types
export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: 'project_file' | 'portfolio' | 'profile' | 'document' | 'image' | 'video';
  url: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  virusScanned: boolean;
  public: boolean;
  downloads: number;
  shared: boolean;
  tags?: string[];
  folder?: string;
}

export interface FileUploadResponse {
  file?: FileMetadata;
  files?: FileMetadata[];
  summary?: {
    totalUploaded: number;
    totalSize: number;
    failed: number;
  };
}

export interface FileFilters {
  category?: string;
  mimeType?: string;
  folder?: string;
  tags?: string[];
  uploadedAfter?: string;
  uploadedBefore?: string;
  page?: number;
  limit?: number;
  sort?: 'name' | 'size' | 'uploaded_at';
  order?: 'asc' | 'desc';
}

// Statistics and Analytics Types
export interface EarningsStats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  yearToDate: number;
  growthPercentage: number;
  currency: string;
  monthlyBreakdown: Array<{
    month: string;
    earnings: number;
    projectsCompleted: number;
    hoursWorked?: number;
  }>;
  topClients?: Array<{
    clientId: string;
    clientName: string;
    totalEarnings: number;
    projectsCount: number;
  }>;
}

export interface DashboardStats {
  activeProjects: number;
  pendingProposals?: number;
  totalEarnings?: number;
  profileViews?: number;
  completedProjects: number;
  averageRating: number;
  totalSpent?: number;
  totalProjects?: number;
  pendingApplications?: number;
  savedFreelancers?: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  metadata?: {
    projectId?: string;
    projectTitle?: string;
    milestoneId?: string;
    freelancerName?: string;
    clientName?: string;
    amount?: number;
  };
  actionUrl?: string;
  priority?: Priority;
}
