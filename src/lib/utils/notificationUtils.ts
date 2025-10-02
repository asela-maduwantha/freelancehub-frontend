// Notification utility functions and constants
import { NotificationType } from '@/types/notifications';
import type { Notification } from '@/types/notifications';

// Notification type display names
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.PROPOSAL_RECEIVED]: 'New Proposal',
  [NotificationType.PROPOSAL_ACCEPTED]: 'Proposal Accepted',
  [NotificationType.PROPOSAL_REJECTED]: 'Proposal Rejected',
  [NotificationType.CONTRACT_CREATED]: 'Contract Created',
  [NotificationType.CONTRACT_COMPLETED]: 'Contract Completed',
  [NotificationType.CONTRACT_CANCELLED]: 'Contract Cancelled',
  [NotificationType.MILESTONE_CREATED]: 'Milestone Created',
  [NotificationType.MILESTONE_SUBMITTED]: 'Milestone Submitted',
  [NotificationType.MILESTONE_APPROVED]: 'Milestone Approved',
  [NotificationType.MILESTONE_REJECTED]: 'Milestone Rejected',
  [NotificationType.PAYMENT_RECEIVED]: 'Payment Received',
  [NotificationType.PAYMENT_SENT]: 'Payment Sent',
  [NotificationType.PAYMENT_REFUNDED]: 'Payment Refunded',
  [NotificationType.REVIEW_RECEIVED]: 'Review Received',
  [NotificationType.MESSAGE_RECEIVED]: 'New Message',
  [NotificationType.DISPUTE_CREATED]: 'Dispute Created',
  [NotificationType.DISPUTE_RESOLVED]: 'Dispute Resolved',
  [NotificationType.WITHDRAWAL_REQUESTED]: 'Withdrawal Requested',
  [NotificationType.WITHDRAWAL_PROCESSED]: 'Withdrawal Processed',
  [NotificationType.WITHDRAWAL_COMPLETED]: 'Withdrawal Completed',
  [NotificationType.JOB_POSTED]: 'Job Posted',
  [NotificationType.JOB_COMPLETED]: 'Job Completed',
};

// Notification type icons
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  [NotificationType.PROPOSAL_RECEIVED]: '📝',
  [NotificationType.PROPOSAL_ACCEPTED]: '✅',
  [NotificationType.PROPOSAL_REJECTED]: '❌',
  [NotificationType.CONTRACT_CREATED]: '📄',
  [NotificationType.CONTRACT_COMPLETED]: '🎉',
  [NotificationType.CONTRACT_CANCELLED]: '🚫',
  [NotificationType.MILESTONE_CREATED]: '🎯',
  [NotificationType.MILESTONE_SUBMITTED]: '📤',
  [NotificationType.MILESTONE_APPROVED]: '✅',
  [NotificationType.MILESTONE_REJECTED]: '❌',
  [NotificationType.PAYMENT_RECEIVED]: '💰',
  [NotificationType.PAYMENT_SENT]: '💸',
  [NotificationType.PAYMENT_REFUNDED]: '↩️',
  [NotificationType.REVIEW_RECEIVED]: '⭐',
  [NotificationType.MESSAGE_RECEIVED]: '💬',
  [NotificationType.DISPUTE_CREATED]: '⚠️',
  [NotificationType.DISPUTE_RESOLVED]: '✔️',
  [NotificationType.WITHDRAWAL_REQUESTED]: '🏦',
  [NotificationType.WITHDRAWAL_PROCESSED]: '⏳',
  [NotificationType.WITHDRAWAL_COMPLETED]: '✅',
  [NotificationType.JOB_POSTED]: '📢',
  [NotificationType.JOB_COMPLETED]: '✅',
};

// Notification type colors (Tailwind classes)
export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  [NotificationType.PROPOSAL_RECEIVED]: 'text-blue-600',
  [NotificationType.PROPOSAL_ACCEPTED]: 'text-green-600',
  [NotificationType.PROPOSAL_REJECTED]: 'text-red-600',
  [NotificationType.CONTRACT_CREATED]: 'text-indigo-600',
  [NotificationType.CONTRACT_COMPLETED]: 'text-green-600',
  [NotificationType.CONTRACT_CANCELLED]: 'text-red-600',
  [NotificationType.MILESTONE_CREATED]: 'text-purple-600',
  [NotificationType.MILESTONE_SUBMITTED]: 'text-blue-600',
  [NotificationType.MILESTONE_APPROVED]: 'text-green-600',
  [NotificationType.MILESTONE_REJECTED]: 'text-red-600',
  [NotificationType.PAYMENT_RECEIVED]: 'text-green-600',
  [NotificationType.PAYMENT_SENT]: 'text-orange-600',
  [NotificationType.PAYMENT_REFUNDED]: 'text-yellow-600',
  [NotificationType.REVIEW_RECEIVED]: 'text-yellow-500',
  [NotificationType.MESSAGE_RECEIVED]: 'text-blue-600',
  [NotificationType.DISPUTE_CREATED]: 'text-red-600',
  [NotificationType.DISPUTE_RESOLVED]: 'text-green-600',
  [NotificationType.WITHDRAWAL_REQUESTED]: 'text-purple-600',
  [NotificationType.WITHDRAWAL_PROCESSED]: 'text-blue-600',
  [NotificationType.WITHDRAWAL_COMPLETED]: 'text-green-600',
  [NotificationType.JOB_POSTED]: 'text-blue-600',
  [NotificationType.JOB_COMPLETED]: 'text-green-600',
};

/**
 * Get the display label for a notification type
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  return NOTIFICATION_TYPE_LABELS[type] || formatNotificationType(type);
}

/**
 * Get the icon for a notification type
 */
export function getNotificationIcon(type: NotificationType): string {
  return NOTIFICATION_TYPE_ICONS[type] || '🔔';
}

/**
 * Get the color class for a notification type
 */
export function getNotificationColor(type: NotificationType): string {
  return NOTIFICATION_TYPE_COLORS[type] || 'text-gray-600';
}

/**
 * Format notification type string (convert snake_case to Title Case)
 */
export function formatNotificationType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get route for a notification based on its related type and ID
 */
export function getNotificationRoute(notification: Notification): string {
  const { relatedType, relatedId, type } = notification;

  if (!relatedType || !relatedId) {
    return '/dashboard/notifications';
  }

  switch (relatedType) {
    case 'job':
      return `/browse-jobs/${relatedId}`;
    case 'proposal':
      return `/freelancer/proposals/${relatedId}`;
    case 'contract':
      return `/freelancer/contracts/${relatedId}`;
    case 'milestone':
      return `/milestone-tracker/${relatedId}`;
    case 'payment':
      return `/freelancer/payments`;
    case 'user':
      return `/profile/${relatedId}`;
    case 'dispute':
      return `/disputes/${relatedId}`;
    case 'review':
      return `/profile/${relatedId}/reviews`;
    default:
      return '/shared/notifications';
  }
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'This Month': [],
    Older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  notifications.forEach(notification => {
    const notifDate = new Date(notification.createdAt);
    const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

    if (notifDay.getTime() === today.getTime()) {
      groups.Today.push(notification);
    } else if (notifDay.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(notification);
    } else if (notifDate >= weekAgo) {
      groups['This Week'].push(notification);
    } else if (notifDate >= monthAgo) {
      groups['This Month'].push(notification);
    } else {
      groups.Older.push(notification);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

/**
 * Check if notification is recent (within last 5 minutes)
 */
export function isRecentNotification(notification: Notification): boolean {
  const notifDate = new Date(notification.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - notifDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  return diffMins < 5;
}

/**
 * Get notification priority based on type
 */
export function getNotificationPriority(type: NotificationType): 'high' | 'medium' | 'low' {
  const highPriority = [
    NotificationType.PAYMENT_RECEIVED,
    NotificationType.CONTRACT_CREATED,
    NotificationType.PROPOSAL_ACCEPTED,
    NotificationType.DISPUTE_CREATED,
  ];

  const mediumPriority = [
    NotificationType.PROPOSAL_RECEIVED,
    NotificationType.MILESTONE_SUBMITTED,
    NotificationType.MESSAGE_RECEIVED,
    NotificationType.REVIEW_RECEIVED,
  ];

  if (highPriority.includes(type)) return 'high';
  if (mediumPriority.includes(type)) return 'medium';
  return 'low';
}

/**
 * Play notification sound
 */
export function playNotificationSound(): void {
  if (typeof Audio !== 'undefined') {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Could not play notification sound:', err));
    } catch (err) {
      console.log('Audio not supported:', err);
    }
  }
}

/**
 * Show browser notification
 */
export async function showBrowserNotification(notification: Notification): Promise<void> {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const browserNotification = new window.Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: notification._id,
        requireInteraction: false,
        silent: false,
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        // Navigate to notification route
        const route = getNotificationRoute(notification);
        window.location.href = route;
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    } catch (err) {
      console.error('Error showing browser notification:', err);
    }
  }
}
