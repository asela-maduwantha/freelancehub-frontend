// Notification Redux Slice
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationAPI } from '@/lib/api/notifications';
import { socketService } from '@/lib/services/socketService';
import {
  Notification,
  NotificationFilters,
  NotificationState,
} from '@/types/notifications';

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    isRead: undefined,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  },
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (filters: NotificationFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getNotifications(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await notificationAPI.getUnreadCount();
      return count;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch unread count');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      // Also send via socket for real-time sync
      socketService.markAsRead(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const markMultipleNotificationsAsRead = createAsyncThunk(
  'notifications/markMultipleAsRead',
  async (notificationIds: string[], { rejectWithValue }) => {
    try {
      await notificationAPI.markMultipleAsRead(notificationIds);
      return notificationIds;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notifications as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationAPI.markAllAsRead();
      // Also send via socket for real-time sync
      socketService.markAllAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue, getState }) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      const state = getState() as { notifications: NotificationState };
      const notification = state.notifications.notifications.find(n => n._id === notificationId);
      return { notificationId, wasUnread: notification ? !notification.isRead : false };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete notification');
    }
  }
);

// Notification Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add new notification from socket
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    // Update unread count from socket
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    // Update notification from socket
    updateNotification: (state, action: PayloadAction<{ notificationId: string; updates: Partial<Notification> }>) => {
      const index = state.notifications.findIndex(n => n._id === action.payload.notificationId);
      if (index !== -1) {
        state.notifications[index] = {
          ...state.notifications[index],
          ...action.payload.updates,
        };
      }
    },

    // Mark notification as read (optimistic update)
    markAsReadOptimistic: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all as read (optimistic update)
    markAllAsReadOptimistic: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
      });
      state.unreadCount = 0;
    },

    // Update filters
    setFilters: (state, action: PayloadAction<NotificationFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset notifications state
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Unread Count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // Mark as Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // Mark Multiple as Read
    builder
      .addCase(markMultipleNotificationsAsRead.fulfilled, (state, action) => {
        action.payload.forEach(id => {
          const notification = state.notifications.find(n => n._id === id);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        });
      });

    // Mark All as Read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        });
        state.unreadCount = 0;
      });

    // Delete Notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n._id !== action.payload.notificationId);
        if (action.payload.wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

// Export actions
export const {
  addNotification,
  updateUnreadCount,
  updateNotification,
  markAsReadOptimistic,
  markAllAsReadOptimistic,
  setFilters,
  clearError,
  resetNotifications,
} = notificationSlice.actions;

// Export reducer
export default notificationSlice.reducer;