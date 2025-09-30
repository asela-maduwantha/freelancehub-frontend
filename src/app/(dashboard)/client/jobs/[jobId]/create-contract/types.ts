export interface MilestoneFormData {
  id: string;
  title: string;
  description: string;
  amount: number;
  durationDays: number;
  isSelected: boolean;
  column: 'proposal' | 'custom' | 'contract';
  isFromProposal?: boolean;
}