export type ProjectStatus = 'open' | 'active' | 'completed' | 'cancelled' | 'draft';
export type Visibility = 'public' | 'private';
export type BudgetType = 'fixed' | 'hourly';

export interface ProjectListItem {
  _id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  visibility: Visibility;
  clientId: string;
  requiredSkills?: Array<{ skill: string; level?: string }>;
  budgetType?: BudgetType;
  budget?: number;
  currency?: string;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  category?: string;
  subcategory?: string;
  requiredSkills?: string[];
  type: BudgetType;
  budget: { amount: number; currency: string; type: BudgetType };
  timeline?: { deadline?: string; duration?: number; isUrgent?: boolean; isFlexible?: boolean };
  requirements?: { experienceLevel?: 'beginner' | 'intermediate' | 'expert' };
  visibility?: Visibility;
  tags?: string[];
}

export interface ProjectDetail extends Omit<CreateProjectDto, 'budget' | 'type'> {
  _id: string;
  budgetType: BudgetType;
  budget: number;
  currency: string;
  status: ProjectStatus;
}

export interface ProjectListQuery {
  page?: number;
  limit?: number; // <=50
  status?: ProjectStatus;
  category?: string;
  skills?: string; // comma-separated
  minBudget?: number;
  maxBudget?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Proposals
export type ProposalStatus = 'submitted' | 'accepted' | 'rejected' | 'withdrawn';

export interface ProposalListItem {
  _id: string;
  projectId?: string;
  freelancerId?: string;
  status: ProposalStatus;
}

export interface SubmitProposalDto {
  coverLetter: string;
  pricing: { amount: number; currency: string; type: BudgetType; estimatedHours?: number };
  timeline: {
    deliveryTime?: number;
    startDate?: string;
    milestones?: Array<{ title: string; description?: string; deliveryDate?: string; amount?: number }>;
  };
  portfolioLinks?: string[];
  attachments?: Array<{ url: string; fileType: string; fileSize: number }>;
}
