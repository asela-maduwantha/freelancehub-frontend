// Main API exports

// Export the API client
export { apiClient, ApiClient } from './client';

// Export all types
export * from './types';

// Export API modules
export { authAPI } from './auth';
export { userAPI } from './user';
export { freelancerAPI } from './freelancer';
export { clientAPI } from './client-api';
export { projectAPI } from './project';
export { contractAPI } from './contract';
export { uploadAPI } from './upload';

// Re-export the default apiClient for backward compatibility
export { apiClient as default } from './client';
