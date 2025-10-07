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
    UPDATE_PROFILE: '/users/freelancer/profile',
    UPLOAD_AVATAR: '/users/avatar',
    ADD_SKILLS: '/users/freelancer/skills',
    ADD_PORTFOLIO: '/users/freelancer/portfolio',
  },

  CLIENT: {
    UPDATE_PROFILE: '/users/client/profile',
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
    STATS: '/jobs/stats',
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
    DELETE: (id: string) => `/proposals/${id}`,
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
    PROCESS: (id: string) => `/payments/${id}/process`,
    COMPLETE: (id: string) => `/payments/${id}/complete`,
    FAIL: (id: string) => `/payments/${id}/fail`,
    REFUND: (id: string) => `/payments/${id}/refund`,
    CONTRACT_PAYMENTS: (contractId: string) => `/payments/contract/${contractId}`,
    CONTRACT_TOTAL: (contractId: string) => `/payments/contract/${contractId}/total`,
    USER_STATS: (userId: string, userType: string) => `/payments/stats/user/${userId}/${userType}`,
    TRANSACTION_LOGS: '/payments/transactions/logs',
    USER_TRANSACTIONS: (userId: string) => `/payments/transactions/user/${userId}`,
    USER_BALANCE: (userId: string) => `/payments/balance/${userId}`,
    WEBHOOK: '/payments/webhook',
    WITHDRAW: '/payments/withdraw',
  },

  // Payment Methods endpoints
  PAYMENT_METHODS: {
    LIST: '/payment-methods',
    CREATE_SETUP_INTENT: '/payment-methods/setup-intent',
    SAVE: '/payment-methods',
    SET_DEFAULT: (id: string) => `/payment-methods/${id}/default`,
    DELETE: (id: string) => `/payment-methods/${id}`,
  },

  // Withdrawals endpoints
  WITHDRAWALS: {
    LIST: '/withdrawals',
    CREATE: '/withdrawals',
    DETAIL: (id: string) => `/withdrawals/${id}`,
    PROCESS: (id: string) => `/withdrawals/${id}/process`,
    COMPLETE: (id: string) => `/withdrawals/${id}/complete`,
    FAIL: (id: string) => `/withdrawals/${id}/fail`,
  },

  // Stripe Connected Account endpoints
  STRIPE_ACCOUNT: {
    CREATE: '/users/stripe-account',
    ONBOARD: '/users/stripe-account/onboard',
    STATUS: '/users/stripe-account/status',
    DELETE: '/users/stripe-account',
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