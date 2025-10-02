export interface MilestoneFormData {
  id: string;
  title: string;
  description: string;
  amount: number;
  durationDays: number;
  isFromProposal?: boolean;
}

export interface MilestoneInput {
  title: string;
  description: string;
  amount: number;
  durationDays: number;
}