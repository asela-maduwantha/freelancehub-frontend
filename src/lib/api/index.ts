export { apiClient, ApiClient } from './client';
export { authService, AuthService } from './auth.service';
export { usersService, UsersService } from './users.service';
export { projectsService, ProjectsService } from './projects.service';
export { proposalsService, ProposalsService } from './proposals.service';
export { clientsService, ClientsService } from './clients.service';
export type { ClientDashboard } from './clients.service';
export { contractsService, ContractsService } from './contracts.service';
export { paymentsService, PaymentsService } from './payments.service';
export { reviewsService, ReviewsService } from './reviews.service';
export { disputesService, DisputesService } from './disputes.service';
export { storageService, StorageService } from './storage.service';
export { adminService, AdminService } from './admin.service';
export { messagingService, MessagingService } from './messaging.service';

export { freelancersService, FreelancersService } from './freelancers.service';

// Alias exports for backward compatibility
export { freelancersService as freelancerAPI } from './freelancers.service';
export { storageService as uploadAPI } from './storage.service';
export { storageService as enhancedUploadAPI } from './storage.service';

// Re-export types for convenience
export type * from '../types';