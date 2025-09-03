import { IUser } from './user.types';
import { IProposal } from './contract.types';

export interface ISkill {
  _id: string;
  skill: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

export interface IAnalytics {
  _id?: string;
  views: number;
  applications: number;
  saves: number;
}

export interface IProject {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  clientId: string | IUser;
  freelancerId?: string;
  status: 'draft' | 'open' | 'in-progress' | 'completed' | 'cancelled' | 'paused';
  requiredSkills: ISkill[];
  budgetType: 'fixed' | 'hourly';
  budget: number;
  duration: string;
  workType: string[];
  experienceLevel: string;
  tags: string[];
  attachments: string[];
  visibility: string;
  analytics: IAnalytics;
  milestones: any[];
  proposals: IProposal[];
  payments: any[];
  messages: any[];
  reviews: any[];
  disputes: any[];
  postedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}