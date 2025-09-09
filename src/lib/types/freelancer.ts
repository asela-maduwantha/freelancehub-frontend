import { Availability, Certification, Education, Language, Location, PortfolioItem } from './auth';

// Normalized ID fields from backend (could be _id or id depending on endpoint)
export type IdLike = string;

export interface FreelancerProfileBase {
  id: IdLike;
  userId: IdLike;
  professionalTitle: string;
  description: string;
  skills: string[];
  categories: string[];
  experienceLevel: string;
  hourlyRate: number;
  availability: Availability;
  location: Location;
  publicProfileUrl: string;
  portfolio: PortfolioItem[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfileResponse extends FreelancerProfileBase {
  isProfileComplete: boolean;
}

// Drafts may come back with partial fields
export type FreelancerProfileDraft = Partial<FreelancerProfileBase> & {
  id: IdLike;
  isProfileComplete?: boolean;
};
