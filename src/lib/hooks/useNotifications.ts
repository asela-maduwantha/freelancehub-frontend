// Custom hook for notifications
'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
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
  setFilters,
} from '@/store/slices/notifications/notificationsSlice';
import type { NotificationFilters } from '@/types/notifications';

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
  
  // Get auth state from Redux store
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);

  // Socket connection status
  const [socketStatus, setSocketStatus] = useState(socketService.getStatus());

  // Track if initial data has been loaded to prevent duplicate calls
  const initialLoadDone = useRef(false);

  // Socket connection status monitoring
  useEffect(() => {
    const handleConnected = () => setSocketStatus(socketService.getStatus());
    const handleDisconnected = () => setSocketStatus(socketService.getStatus());
    const handleConnectionFailed = () => setSocketStatus(socketService.getStatus());

    socketService.on('connected', handleConnected);
    socketService.on('disconnected', handleDisconnected);
    socketService.on('connection_failed', handleConnectionFailed);

    return () => {
      socketService.off('connected', handleConnected);
      socketService.off('disconnected', handleDisconnected);
      socketService.off('connection_failed', handleConnectionFailed);
    };
  }, []);

  // Load initial data when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !initialLoadDone.current) {
      console.log('📡 Loading initial notification data...');
      dispatch(fetchNotifications(filters));
      dispatch(fetchUnreadCount());
      initialLoadDone.current = true;
    } else if (!isAuthenticated) {
      initialLoadDone.current = false;
    }
  }, [isAuthenticated, dispatch]);  // Request browser notification permission
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
    socketStatus,
    isSocketConnected: socketService.isSocketConnected(),
  };
};

export default useNotifications;
