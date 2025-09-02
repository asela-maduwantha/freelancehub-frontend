import { IUser } from './user.types';
import { IProposal } from './contract.types';

export interface ISkill {
  _id: string;
  skill: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

export interface IAnalytics {
  views: number;
  applications: number;
}

export interface IProject {
  _id: string;
  title: string;
  description: string;
  clientId: string | IUser;
  freelancerId?: string;
  status: 'draft' | 'open' | 'in-progress' | 'completed' | 'cancelled';
  budget: number;
  budgetType?: 'fixed' | 'hourly';
  deadline: string;
  duration?: string;
  category?: string;
  skills?: string[];
  requiredSkills?: ISkill[];
  experienceLevel?: string;
  workType?: string[];
  attachments?: string[];
  postedAt?: string;
  proposals?: IProposal[];
  analytics?: IAnalytics;
  createdAt: string;
  updatedAt: string;
}