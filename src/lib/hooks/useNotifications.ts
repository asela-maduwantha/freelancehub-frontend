// Custom hook for notifications
'use client';

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { socketService } from '@/lib/services/socketService';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markMultipleNotificationsAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  addNotification,
  updateUnreadCount,
  updateNotification as updateNotificationAction,
  setFilters,
  resetNotifications,
} from '@/store/slices/notifications/notificationsSlice';
import type { Notification, NotificationFilters } from '@/types/notifications';

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors with safe defaults
  const notifications = useSelector((state: RootState) => state.notifications?.notifications || []);
  const unreadCount = useSelector((state: RootState) => state.notifications?.unreadCount || 0);
  const loading = useSelector((state: RootState) => state.notifications?.loading || false);
  const error = useSelector((state: RootState) => state.notifications?.error || null);
  const filters = useSelector((state: RootState) => state.notifications?.filters || { page: 1, limit: 10 });
  const pagination = useSelector((state: RootState) => state.notifications?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });
  
  // Get auth token from Redux store
  const token = useSelector((state: RootState) => state.auth?.token);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);

  // Socket event handlers
  const handleNewNotification = useCallback((notification: Notification) => {
    console.log('📬 New notification received:', notification);
    dispatch(addNotification(notification));
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
      });
    }
  }, [dispatch]);

  const handleUnreadCountUpdate = useCallback((count: number) => {
    console.log('🔔 Unread count update:', count);
    dispatch(updateUnreadCount(count));
  }, [dispatch]);

  const handleNotificationUpdate = useCallback((data: any) => {
    console.log('🔄 Notification update:', data);
    if (data.action === 'marked_read' && data.notificationId) {
      dispatch(updateNotificationAction({
        notificationId: data.notificationId,
        updates: { isRead: true, readAt: new Date().toISOString() },
      }));
    }
  }, [dispatch]);

  const handleAllNotificationsRead = useCallback(() => {
    console.log('✅ All notifications marked as read');
    dispatch(updateUnreadCount(0));
  }, [dispatch]);

  // Initialize socket connection
  useEffect(() => {
    console.log('🔍 useNotifications - Auth State:', { isAuthenticated, hasToken: !!token });
    
    if (isAuthenticated && token) {
      console.log('🔌 Connecting to notification socket with token...');
      socketService.connect(token);

      // Subscribe to socket events
      socketService.on('notification', handleNewNotification);
      socketService.on('unread_count', handleUnreadCountUpdate);
      socketService.on('notification_updated', handleNotificationUpdate);
      socketService.on('all_notifications_read', handleAllNotificationsRead);

      // Load initial data
      console.log('📡 Loading initial notification data...');
      dispatch(fetchNotifications(filters));
      dispatch(fetchUnreadCount());

      return () => {
        console.log('🔌 Cleaning up notification socket listeners...');
        socketService.off('notification', handleNewNotification);
        socketService.off('unread_count', handleUnreadCountUpdate);
        socketService.off('notification_updated', handleNotificationUpdate);
        socketService.off('all_notifications_read', handleAllNotificationsRead);
      };
    } else {
      // Disconnect socket and reset state when user logs out
      console.log('❌ Not authenticated or no token - disconnecting socket');
      socketService.disconnect();
      dispatch(resetNotifications());
    }
  }, [
    isAuthenticated,
    token,
    dispatch,
    handleNewNotification,
    handleUnreadCountUpdate,
    handleNotificationUpdate,
    handleAllNotificationsRead,
    filters,
  ]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Actions
  const loadNotifications = useCallback((customFilters?: NotificationFilters) => {
    const filtersToUse = customFilters || filters;
    return dispatch(fetchNotifications(filtersToUse));
  }, [dispatch, filters]);

  const loadUnreadCount = useCallback(() => {
    return dispatch(fetchUnreadCount());
  }, [dispatch]);

  const markAsRead = useCallback((notificationId: string) => {
    return dispatch(markNotificationAsRead(notificationId));
  }, [dispatch]);

  const markMultipleAsRead = useCallback((notificationIds: string[]) => {
    return dispatch(markMultipleNotificationsAsRead(notificationIds));
  }, [dispatch]);

  const markAllAsRead = useCallback(() => {
    return dispatch(markAllNotificationsAsRead());
  }, [dispatch]);

  const deleteNotif = useCallback((notificationId: string) => {
    return dispatch(deleteNotification(notificationId));
  }, [dispatch]);

  const updateFilters = useCallback((newFilters: NotificationFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const refreshNotifications = useCallback(() => {
    dispatch(fetchNotifications(filters));
    dispatch(fetchUnreadCount());
  }, [dispatch, filters]);

  // Get unread notifications
  const unreadNotifications = notifications.filter(n => !n.isRead);

  // Get recent notifications (last 5)
  const recentNotifications = notifications.slice(0, 5);

  return {
    // State
    notifications,
    unreadNotifications,
    recentNotifications,
    unreadCount,
    loading,
    error,
    filters,
    pagination,

    // Actions
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification: deleteNotif,
    updateFilters,
    refreshNotifications,
    requestNotificationPermission,

    // Socket status
    isSocketConnected: socketService.isSocketConnected(),
  };
};

export default useNotifications;
