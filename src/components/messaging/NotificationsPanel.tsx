'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, Settings, MessageCircle, DollarSign, Star, AlertCircle } from 'lucide-react';
import { Notification } from '@/lib/types';
import { MessagingService } from '@/lib/api';
import { getWebSocketService } from '@/lib/utils/websocket.service';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onUnreadCountChange?: (count: number) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return MessageCircle;
    case 'payment':
      return DollarSign;
    case 'review':
      return Star;
    case 'system':
      return AlertCircle;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return 'text-blue-500';
    case 'payment':
      return 'text-green-500';
    case 'review':
      return 'text-yellow-500';
    case 'system':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export default function NotificationsPanel({ isOpen, onClose, onNotificationClick, onUnreadCountChange }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      connectWebSocket();
    }

    return () => {
      const service = getWebSocketService();
      service.off('notification');
    };
  }, [isOpen]);

  const connectWebSocket = async () => {
    try {
      const service = getWebSocketService();
      await service.connect();
      setupWebSocketListeners(service);
    } catch (error) {
      console.error('Failed to connect WebSocket in NotificationsPanel:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await MessagingService.getNotifications();

      // Ensure data is an array
      const notificationsArray = Array.isArray(data) ? data : [];
      setNotifications(notificationsArray);
      const unreadCount = notificationsArray.filter(n => !n.isRead).length;
      setUnreadCount(unreadCount);
      onUnreadCountChange?.(unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Set empty array on error to prevent crashes
      setNotifications([]);
      setUnreadCount(0);
      onUnreadCountChange?.(0);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocketListeners = (service: any) => {
    service.on('notification', (data: any) => {
      // Ensure we have valid notification data
      if (data && data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => {
          const newCount = prev + 1;
          onUnreadCountChange?.(newCount);
          return newCount;
        });
      }
    });
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await MessagingService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        onUnreadCountChange?.(newCount);
        return newCount;
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await MessagingService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      onUnreadCountChange?.(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {(notifications || []).map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                    onNotificationClick?.(notification);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full bg-gray-100 ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">
                            {notification.content}
                          </p>
                          <p className="text-gray-400 text-xs mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 ml-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100"
                          >
                            <Check className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => {
            // Navigate to full notifications page
            onClose();
          }}
        >
          <Settings className="w-4 h-4" />
          View all notifications
        </Button>
      </div>
    </div>
  );
}
