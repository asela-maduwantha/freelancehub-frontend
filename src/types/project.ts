import { ProjectStatus, BudgetType, Timeline, Money, FileUpload, Category, Skill, Location } from './common';
import { User, FreelancerProfile, ClientProfile } from './user';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[] | Skill[];
  budget: Budget;
  timeline?: Timeline;
  projectType: BudgetType;
  status: ProjectStatus;
  createdAt: string;
  updatedAt?: string;
  deadline?: string;
  proposalsCount: number;
  clientId: string;
  client?: ClientInfo;
  freelancer?: FreelancerInfo;
  featured?: boolean;
  urgent?: boolean;
  remote?: boolean;
  location?: Location;
  attachments?: FileUpload[];
  requirements?: string[];
  deliverables?: string[];
  tags?: string[];
}

export interface Budget {
  type: BudgetType;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  hourlyRate?: number;
  currency: string;
  estimatedHours?: number;
}

export interface ClientInfo {
  id: string;
  name: string;
  companyName?: string;
  profilePhoto?: string;
  rating?: number;
  reviewsCount?: number;
  location?: Location;
  verified: boolean;
  memberSince?: string;
  totalProjects?: number;
  completedProjects?: number;
}

export interface FreelancerInfo {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePhoto?: string;
  title?: string;
  skills: string[];
  hourlyRate?: Money;
  rating: number;
  reviewsCount: number;
  completedProjects: number;
  location?: Location;
  verified: boolean;
  availability?: string;
  memberSince?: string;
  matchScore?: number;
}

export interface ProjectFilters {
  category?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  projectType?: BudgetType;
  location?: string;
  remote?: boolean;
  featured?: boolean;
  urgent?: boolean;
  postedWithin?: number; // days
  clientRating?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProjectSearchParams {
  q?: string;
  category?: string;
  skills?: string;
  minBudget?: number;
  maxBudget?: number;
  projectType?: BudgetType;
  location?: string;
  page?: number;
  limit?: number;
}

export interface CreateProjectData {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: Budget;
  timeline?: Timeline;
  projectType: BudgetType;
  requirements?: string[];
  deliverables?: string[];
  attachments?: string[];
  location?: Location;
  remote?: boolean;
  urgent?: boolean;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: ProjectStatus;
}

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  suggestedSkills: string[];
  estimatedBudget: {
    min: number;
    max: number;
    currency: string;
  };
  estimatedDuration: {
    min: number;
    max: number;
    unit: string;
  };
  popularity: number;
  requirements?: string[];
  deliverables?: string[];
}

export interface ProjectProgress {
  percentage: number;
  milestonesCompleted: number;
  totalMilestones: number;
  lastUpdated?: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  deliverables?: FileUpload[];
  notes?: string;
  reviewDeadline?: string;
}

export interface Contract {
  id: string;
  projectId: string;
  freelancerId: string;
  clientId: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'disputed';
  budget: Money;
  timeline: Timeline;
  milestones: Milestone[];
  terms?: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  freelancerId: string;
  clientId: string;
  message: string;
  status: 'sent' | 'accepted' | 'declined' | 'expired';
  sentAt: string;
  respondedAt?: string;
  expiresAt: string;
}

// Stats and Analytics
export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  successRate?: number;
  averageValue?: number;
  averageDuration?: number;
}

export interface ProjectAnalytics {
  views: number;
  applications: number;
  applicationRate: number;
  averageProposalAmount: number;
  skillsInDemand: string[];
  performanceScore: number;
}

// Public Project Data (for non-authenticated users)
export interface PublicProject {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: Budget;
  proposalsCount: number;
  postedAt: string;
  deadline?: string;
  client: {
    name: string;
    location?: Location;
    verified: boolean;
    rating?: number;
  };
  featured?: boolean;
  urgent?: boolean;
}
