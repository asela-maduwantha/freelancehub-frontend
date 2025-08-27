// Main API exports - centralized access to all API services
import authApi from './services/auth';
import publicApi from './services/public';
import projectApi, { clientProjectApi, freelancerProjectApi } from './services/projects';
import proposalApi, { freelancerProposalApi, clientProposalApi } from './services/proposals';
import userApi, { freelancerApi, clientApi } from './services/users';
import freelancerProfileApi from './services/freelancer';
import utilityApi from './services/utility';
import messagingApi, { 
  paymentApi, 
  notificationApi, 
  reviewApi, 
  fileApi, 
  activityApi 
} from './services/platform';
import apiUtils from './utils';

// Re-export the axios instance for direct use if needed
export { default as apiClient } from './axios-instance';

// Authentication APIs
export { authApi };

// Public APIs (no authentication required)
export { publicApi };

// Project APIs
export { 
  projectApi,
  clientProjectApi,
  freelancerProjectApi
};

// Proposal APIs
export { 
  proposalApi,
  freelancerProposalApi,
  clientProposalApi
};

// User Profile APIs
export { 
  userApi,
  freelancerApi,
  clientApi
};

// Freelancer onboarding and profile APIs
export { freelancerProfileApi };

// Utility APIs
export { utilityApi };

// Platform feature APIs
export { 
  messagingApi,
  paymentApi,
  notificationApi,
  reviewApi,
  fileApi,
  activityApi
};

// API utilities
export { apiUtils };

// Convenience exports for common use cases
export const api = {
  // Authentication
  auth: authApi,
  
  // Public endpoints
  public: publicApi,
  
  // Projects
  projects: projectApi,
  
  // Proposals
  proposals: proposalApi,
  
  // Users and profiles
  users: userApi,
  
  // Platform features
  messaging: messagingApi,
  payments: paymentApi,
  notifications: notificationApi,
  reviews: reviewApi,
  files: fileApi,
  activity: activityApi,
  
  // Utilities
  utils: apiUtils,
  utility: utilityApi,
  
  // Role-specific APIs
  freelancer: {
    profile: freelancerApi,
    onboarding: freelancerProfileApi,
    projects: freelancerProjectApi,
    proposals: freelancerProposalApi,
  },
  
  client: {
    profile: clientApi,
    projects: clientProjectApi,
    proposals: clientProposalApi,
  }
};

export default api;
