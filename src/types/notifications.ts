// Notification types and interfaces

export enum NotificationType {
  PROPOSAL_RECEIVED = 'proposal_received',
  PROPOSAL_ACCEPTED = 'proposal_accepted',
  PROPOSAL_REJECTED = 'proposal_rejected',
  CONTRACT_CREATED = 'contract_created',
  CONTRACT_COMPLETED = 'contract_completed',
  CONTRACT_CANCELLED = 'contract_cancelled',
  MILESTONE_CREATED = 'milestone_created',
  MILESTONE_SUBMITTED = 'milestone_submitted',
  MILESTONE_APPROVED = 'milestone_approved',
  MILESTONE_REJECTED = 'milestone_rejected',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_SENT = 'payment_sent',
  PAYMENT_REFUNDED = 'payment_refunded',
  REVIEW_RECEIVED = 'review_received',
  MESSAGE_RECEIVED = 'message_received',
  DISPUTE_CREATED = 'dispute_created',
  DISPUTE_RESOLVED = 'dispute_resolved',
  WITHDRAWAL_REQUESTED = 'withdrawal_requested',
  WITHDRAWAL_PROCESSED = 'withdrawal_processed',
  WITHDRAWAL_COMPLETED = 'withdrawal_completed',
  JOB_POSTED = 'job_posted',
  JOB_COMPLETED = 'job_completed',
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date | string;
  relatedType?: 'job' | 'proposal' | 'contract' | 'milestone' | 'payment' | 'user' | 'dispute' | 'review';
  relatedId?: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType | string;
  startDate?: string;
  endDate?: string;
  relatedType?: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

export interface NotificationActionResponse {
  success: boolean;
  message: string;
  data?: Notification;
}

export interface SocketNotificationData {
  notification: Notification;
  count?: number;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filters: NotificationFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
