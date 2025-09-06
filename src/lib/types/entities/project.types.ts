import { IUser } from './user.types';
import { IProposal } from './contract.types';

export interface ISkill {
  skill: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

export interface IAnalytics {
  views: number;
  applications: number;
  saves: number;
}

export interface IProject {
  _id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: number;
  currency?: string;
  deadline: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled' | 'disputed';
  createdAt: string;
  updatedAt?: string;
  requiredSkills?: ISkill[];
  budgetType?: 'fixed' | 'hourly';
  duration?: string;
  experienceLevel?: string;
  workType?: string[];
  postedAt?: string;
  proposals?: any[];
  analytics?: IAnalytics;
  attachments?: any[];
  tags?: string[];
  visibility?: string;
}

export interface IRecenetlyPostedProject {
  _id: string;
  title: string;
  category: string;
  budgetType: 'fixed' | 'hourly';
  budget: number;
  postedAt: string;
  requiredSkills: ISkill[];
}