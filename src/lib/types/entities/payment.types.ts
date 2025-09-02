export interface IPayment {
  _id: string;
  id: string;
  contractId: string;
  payeeId: string;
  payerId: string;
  projectId: string;
  milestoneId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: 'milestone' | 'bonus' | 'refund';
  stripePaymentIntentId?: string;
  createdAt: string | Date;
  completedAt?: string;
  contract?: {
    id: string;
    title: string;
  };
  freelancer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}