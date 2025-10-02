// Notification API service
import { apiClient } from './client';
import {
  Notification,
  NotificationFilters,
  NotificationResponse,
  UnreadCountResponse,
  NotificationActionResponse,
} from '@/types/notifications';

class NotificationAPI {
  private readonly BASE_PATH = '/notifications';

  /**
   * Get user notifications with filters
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead.toString());
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.relatedType) queryParams.append('relatedType', filters.relatedType);

    const response = await apiClient.get(
      `${this.BASE_PATH}?${queryParams.toString()}`
    );
    // Extract notifications array from the response
    return response.notifications || [];
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get(
      `${this.BASE_PATH}/unread-count`
    );
    return response.count || 0;
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<any> {
    const response = await apiClient.put(
      `${this.BASE_PATH}/mark-read`,
      { notificationId }
    );
    return response;
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<any> {
    const response = await apiClient.put(
      `${this.BASE_PATH}/mark-read`,
      { notificationIds }
    );
    return response;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<any> {
    const response = await apiClient.put(
      `${this.BASE_PATH}/mark-all-read`
    );
    return response;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<any> {
    const response = await apiClient.delete(
      `${this.BASE_PATH}/${notificationId}`
    );
    return response;
  }

  /**
   * Get a single notification by ID
   */
  async getNotificationById(notificationId: string): Promise<Notification> {
    const response = await apiClient.get(
      `${this.BASE_PATH}/${notificationId}`
    );
    return response;
  }
}

export const notificationAPI = new NotificationAPI();
