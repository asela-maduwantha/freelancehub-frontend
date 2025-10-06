'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { socketService } from '@/lib/services/socketService';
import {
  addNotification,
  updateUnreadCount,
  updateNotification as updateNotificationAction,
} from '@/store/slices/notifications/notificationsSlice';
import type { Notification } from '@/types/notifications';

interface SocketProviderProps {
  children: React.ReactNode;
}

/**
 * SocketProvider component that manages the WebSocket connection globally
 * This ensures the socket is connected whenever the user is authenticated
 */
export default function SocketProvider({ children }: SocketProviderProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get auth state from Redux store
  const token = useSelector((state: RootState) => state.auth?.token);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);

  useEffect(() => {
    console.log('🔍 SocketProvider - Auth State:', {
      isAuthenticated,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    });

    // Only connect if we have a valid token and are authenticated
    if (isAuthenticated && token && token.length > 10) { // Basic token validation
      console.log('🔌 Initializing notification socket connection...');
      socketService.connect(token);

      // Socket event handlers
      const handleNewNotification = (notification: Notification) => {
        console.log('📬 New notification received:', notification);
        dispatch(addNotification(notification));
        
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icons/notification-icon.png',
          });
        }
      };

      const handleUnreadCountUpdate = (count: number) => {
        console.log('🔔 Unread count update:', count);
        dispatch(updateUnreadCount(count));
      };

      const handleNotificationUpdate = (data: any) => {
        console.log('🔄 Notification update:', data);
        if (data.action === 'marked_read' && data.notificationId) {
          dispatch(updateNotificationAction({
            notificationId: data.notificationId,
            updates: { isRead: true, readAt: new Date().toISOString() },
          }));
        }
      };

      const handleAllNotificationsRead = () => {
        console.log('✅ All notifications marked as read');
        dispatch(updateUnreadCount(0));
      };

      // Subscribe to socket events
      socketService.on('notification', handleNewNotification);
      socketService.on('unread_count', handleUnreadCountUpdate);
      socketService.on('notification_updated', handleNotificationUpdate);
      socketService.on('all_notifications_read', handleAllNotificationsRead);

      return () => {
        console.log('🔌 Cleaning up socket listeners...');
        socketService.off('notification', handleNewNotification);
        socketService.off('unread_count', handleUnreadCountUpdate);
        socketService.off('notification_updated', handleNotificationUpdate);
        socketService.off('all_notifications_read', handleAllNotificationsRead);
      };
    } else {
      // Disconnect socket when user logs out
      console.log('❌ Not authenticated or no token - disconnecting socket');
      socketService.disconnect();
    }
  }, [isAuthenticated, token, dispatch]);

  return <>{children}</>;
}
