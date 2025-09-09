import { api } from '../api/api-client';
import type { NotificationItem, UpdateNotificationPreferencesDto } from '../types/notifications';

export const NotificationsService = {
  create: (body: Partial<NotificationItem>) => api.post<NotificationItem>('/notifications', body),
  list: () => api.get<NotificationItem[]>('/notifications'),
  markRead: (id: string) => api.put<string>(`/notifications/${id}/read`),
  markAllRead: () => api.put<string>(`/notifications/read-all`),
  remove: (id: string) => api.delete<string>(`/notifications/${id}`),
  unreadCount: () => api.get<number>(`/notifications/unread-count`),
  setFcmToken: (token: string) => api.put<string>(`/notifications/fcm-token`, { token }),
  setPreferences: (body: UpdateNotificationPreferencesDto) => api.put<string>(`/notifications/preferences`, body),
  getPreferences: () => api.get<UpdateNotificationPreferencesDto>(`/notifications/preferences`),
};
