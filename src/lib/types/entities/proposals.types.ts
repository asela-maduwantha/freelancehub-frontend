import { IUser } from './user.types';
import { IProject } from './project.types';

export interface IDashboardProposal {
  _id: string;
  freelancerId: {
    email: string;
    name: string;
  };
  projectId: {
    _id: string;
    clientId: {
      _id: string;
      name: string;
    };
    title: string;
  };
  proposedBudget: {
    amount: number;
    currency: string;
    type: string;
  };
  submittedAt: string;
}
