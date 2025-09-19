export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    CHECK_EMAIL: '/auth/check-email',
    LOGIN: '/auth/login',
    VERIFY_EMAIL: '/auth/verify-email',
    SEND_VERIFICATION: '/auth/send-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    RESEND_OTP: '/auth/resend-otp',
    RESEND_VERIFICATION: '/auth/resend-verification',
    REFRESH: '/auth/refresh',
    HEALTH: '/auth/health',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },

  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
  },

  JOBS: {
    LIST: '/jobs',
    CREATE: '/jobs',
    DETAIL: (id: string) => `/jobs/${id}`,
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
    APPLY: (id: string) => `/jobs/${id}/apply`,
  },

  PROPOSALS: {
    LIST: '/proposals',
    MY_PROPOSALS: '/proposals/my',
    CREATE: '/proposals',
    DETAIL: (id: string) => `/proposals/${id}`,
    UPDATE: (id: string) => `/proposals/${id}`,
    WITHDRAW: (id: string) => `/proposals/${id}/withdraw`,
  },

  CONTRACTS: {
    LIST: '/contracts',
    DETAIL: (id: string) => `/contracts/${id}`,
    MILESTONES: (id: string) => `/contracts/${id}/milestones`,
    MESSAGES: (id: string) => `/contracts/${id}/messages`,
  },

  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments',
    DETAIL: (id: string) => `/payments/${id}`,
    WITHDRAW: '/payments/withdraw',
  },

  // Messages endpoints
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    DETAIL: (id: string) => `/messages/conversations/${id}`,
    SEND: (id: string) => `/messages/conversations/${id}/send`,
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
};

export default API_ENDPOINTS;