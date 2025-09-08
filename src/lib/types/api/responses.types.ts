export interface FileData {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: FileData;
}

export interface UploadMultipleResponse {
  success: boolean;
  message: string;
  data: FileData[];
}

export interface FreelancerProfileResponse {
  success: boolean;
  data: import('../entities/freelancer.types').FreelancerProfile;
  message?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProjectsResponse {
  data: {
    projects: import('../entities/project.types').IProject[];
    pagination: PaginationInfo;
  };
  timestamp: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string; // Full name (firstName + lastName)
  role: string; // Single role string
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: string;
  emailVerified: boolean;
  lastLoginAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDashboardResponse {
    totalProjects: number;
    projectsByStatus: {
      open: number;
      'in-progress': number;
      completed: number;
      cancelled: number;
      disputed: number;
    };
    totalProposals: number;
    recentProjects: import('../entities/project.types').IProject[];
    latestProposals: import('../entities/proposals.types').IDashboardProposal[];
  }

export interface SubmittedMilestone {
  _id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  status: 'submitted';
  deliverables: any[];
  createdAt: string;
  contractId: string;
  contractTitle: string;
}

export interface ProjectSubmittedMilestones {
  projectId: string;
  projectTitle: string;
  submittedMilestones: SubmittedMilestone[];
}

export interface SubmittedMilestonesResponse {
  data: ProjectSubmittedMilestones[];
  timestamp: string;
}