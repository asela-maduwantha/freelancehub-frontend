// enums/status.types.ts
export type UserRole = 'freelancer' | 'client' | 'both' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending' | 'inactive';
export type ProjectStatus = 'draft' | 'open' | 'in-progress' | 'completed' | 'cancelled';
export type ContractStatus = 'active' | 'completed' | 'cancelled' | 'disputed';
export type MilestoneStatus = 'pending' | 'in-progress' | 'submitted' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PaymentType = 'milestone' | 'bonus' | 'refund';
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type DisputeStatus = 'open' | 'under-review' | 'resolved' | 'closed';
export type ReviewType = 'client-to-freelancer' | 'freelancer-to-client';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'LKR' | 'INR';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';
export type AvailabilityStatus = 'full-time' | 'part-time' | 'not-available';
export type ProficiencyLevel = 'basic' | 'conversational' | 'fluent' | 'native';
export type CompanySize = '1-10' | '11-50' | '51-200' | '200+';
export type SortOrder = 'asc' | 'desc';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type Environment = 'development' | 'staging' | 'production' | 'test';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export type FileType = 'image' | 'document' | 'video' | 'audio' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType =
  | 'project_created'
  | 'proposal_received'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'milestone_submitted'
  | 'milestone_approved'
  | 'milestone_rejected'
  | 'payment_received'
  | 'contract_completed'
  | 'review_received'
  | 'dispute_created'
  | 'system_notification';