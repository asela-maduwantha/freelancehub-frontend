export interface CreateDisputeDto {
  contractId: string;
  evidence?: Array<{ description?: string; files?: string[] }>;
}

export interface DisputeItem {
  id: string;
  status: 'open' | 'resolved' | 'pending' | string;
}
