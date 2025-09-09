export interface NotificationItem {
  _id: string;
  type: string;
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UpdateNotificationPreferencesDto {
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
}
