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
    MY_JOBS: '/jobs/my-jobs',
    CREATE: '/jobs',
    DETAIL: (id: string) => `/jobs/${id}`,
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
    APPLY: (id: string) => `/jobs/${id}/apply`,
    FEATURED: '/jobs/featured',
    RECENT: '/jobs/recent',
  },

  CATEGORIES: {
    LIST: '/categories',
  },

  SKILLS: {
    LIST: '/skills',
  },

  PROPOSALS: {
    LIST: '/proposals',
    MY_PROPOSALS: '/proposals/my',
    BY_JOB: (jobId: string) => `/proposals/job/${jobId}`,
    CREATE: '/proposals',
    DETAIL: (id: string) => `/proposals/${id}`,
    UPDATE: (id: string) => `/proposals/${id}`,
    WITHDRAW: (id: string) => `/proposals/${id}/withdraw`,
    ACCEPT: (id: string) => `/proposals/${id}/accept`,
    REJECT: (id: string) => `/proposals/${id}/reject`,
  },

  CONTRACTS: {
    LIST: '/contracts',
    DETAIL: (id: string) => `/contracts/${id}`,
    MILESTONES: (id: string) => `/contracts/${id}/milestones`,
    MESSAGES: (id: string) => `/contracts/${id}/messages`,
    DOWNLOAD: (id: string) => `/contracts/${id}/download`,
  },

  MILESTONES: {
    LIST_BY_CONTRACT: (contractId: string) => `/milestones/contract/${contractId}/milestones`,
    LIST_ALL: '/milestones',
    OVERDUE: '/milestones/overdue',
    STATS: (contractId: string) => `/milestones/contract/${contractId}/stats`,
    START_WORK: (id: string) => `/milestones/${id}/in-progress`,
    SUBMIT_WORK: (id: string) => `/milestones/${id}/submit`,
    APPROVE: (id: string) => `/milestones/${id}/approve`,
    REJECT: (id: string) => `/milestones/${id}/reject`,
    PROCESS_PAYMENT: (id: string) => `/milestones/${id}/payment`,
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

  // File upload endpoints
  FILES: {
    UPLOAD_DOCUMENT: '/files/upload-document',
    SUPPORTED_TYPES: '/files/supported-types',
  },

  // Dashboard endpoints
  DASHBOARD: {
    CLIENT: '/dashboard/client',
    FREELANCER: '/dashboard/freelancer',
  },
};

export default API_ENDPOINTS;