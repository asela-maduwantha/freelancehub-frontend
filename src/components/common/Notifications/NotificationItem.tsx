'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Check, ExternalLink } from 'lucide-react';
import type { Notification } from '@/types/notifications';
import {
  getNotificationIcon,
  getNotificationColor,
  getNotificationRoute,
  getNotificationTypeLabel,
  isRecentNotification,
} from '@/lib/utils/notificationUtils';

interface NotificationItemProps {
  notification: Notification;
  isSelected?: boolean;
  onSelect?: (notificationId: string) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  showCheckbox?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  isSelected = false,
  onSelect,
  onMarkAsRead,
  onDelete,
  showCheckbox = false,
}) => {
  const route = getNotificationRoute(notification);
  const icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);
  const typeLabel = getNotificationTypeLabel(notification.type);
  const isRecent = isRecentNotification(notification);

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification._id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this notification?')) {
      onDelete(notification._id);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(notification._id);
    }
  };

  return (
    <div
      className={`
        group relative border-l-4 transition-all duration-200
        ${!notification.isRead ? 'bg-blue-50 border-l-blue-500' : 'bg-white border-l-transparent'}
        ${isSelected ? 'ring-2 ring-primary-500' : ''}
        hover:shadow-md rounded-lg overflow-hidden
      `}
    >
      <Link href={route} className="block">
        <div className="px-4 py-4">
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            {showCheckbox && (
              <div className="flex-shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleCheckboxChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
              </div>
            )}

            {/* Icon */}
            <div className="flex-shrink-0">
              <div className={`text-3xl ${colorClass}`}>
                {icon}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Type Label */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${colorClass}`}>
                  {typeLabel}
                </span>
                {isRecent && (
                  <span className="px-1.5 py-0.5 text-xs font-medium text-white bg-red-500 rounded">
                    NEW
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                {notification.title}
              </h4>

              {/* Message */}
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {notification.message}
              </p>

              {/* Timestamp */}
              <p className="mt-2 text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {/* Unread Indicator */}
              {!notification.isRead && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
              )}

              {/* Action Buttons (shown on hover) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.isRead && onMarkAsRead && (
                  <button
                    onClick={handleMarkAsRead}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="p-1.5 text-gray-500">
                  <ExternalLink size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default NotificationItem;
