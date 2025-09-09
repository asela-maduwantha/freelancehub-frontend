export interface ContractMilestoneDto {
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
}

export interface CreateContractDto {
  projectId: string;
  proposalId: string;
  terms: {
    budget: number;
    type: 'fixed' | 'hourly';
    startDate?: string;
    endDate?: string;
    paymentSchedule?: string;
  };
  milestones: ContractMilestoneDto[];
}

export interface UpdateMilestoneDto {
  description?: string;
  amount?: number;
  dueDate?: string;
}

export interface SubmitMilestoneDto {
  description: string;
  files?: string[];
}

export interface ApproveMilestoneDto {
  feedback?: string;
  paymentMethodId?: string;
  processPayment?: boolean;
}

export interface RejectMilestoneDto {
  feedback?: string;
  revisionRequest?: string;
}

export interface DefaultPaymentMethodResult {
  defaultPaymentMethod: { id: string; brand?: string; last4?: string; isDefault?: boolean } | null;
}
