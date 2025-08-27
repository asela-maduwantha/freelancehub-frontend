// Public API Types (for non-authenticated users)
import { Location, Money, Category, Skill } from './common';

export interface PlatformStats {
  totalProjects: number;
  totalFreelancers: number;
  totalClients: number;
  totalEarnings: number;
  projectsCompleted: number;
  averageRating: number;
}

export interface FeaturedTestimonial {
  id: string;
  clientName?: string;
  freelancerName?: string;
  clientCompany?: string;
  rating: number;
  comment: string;
  projectType: string;
  featured: boolean;
  avatar?: string;
  verified?: boolean;
}

export interface FeaturedFreelancer {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePhoto?: string;
  title: string;
  bio?: string;
  skills: string[];
  hourlyRate: Money;
  rating: number;
  reviewsCount: number;
  completedProjects: number;
  location: Location;
  availability: string;
  verified: boolean;
  memberSince: string;
  portfolio: Array<{
    id: string;
    title: string;
    image: string;
    technologies?: string[];
  }>;
  matchScore?: number;
  featured?: boolean;
}

export interface PublicProjectBrief {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: Money;
  skills: string[];
  clientRating?: number;
  proposalsCount: number;
  postedAt: string;
  deadline?: string;
  client: {
    name: string;
    location?: Location;
    verified: boolean;
    rating?: number;
    memberSince?: string;
  };
  featured?: boolean;
  urgent?: boolean;
  remote?: boolean;
}

export interface FreelancerSearchFilters {
  skills?: string[];
  minRate?: number;
  maxRate?: number;
  location?: string;
  availability?: string;
  rating?: number;
  verified?: boolean;
  languages?: string[];
  experience?: string;
  page?: number;
  limit?: number;
  sort?: 'rating' | 'rate' | 'experience' | 'recent';
  order?: 'asc' | 'desc';
}

// Alias for convenience
export type FreelancerFilters = FreelancerSearchFilters;

export interface ProjectSearchFilters {
  category?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  projectType?: 'fixed' | 'hourly';
  remote?: boolean;
  featured?: boolean;
  urgent?: boolean;
  location?: string;
  clientRating?: number;
  postedWithin?: number; // days
  page?: number;
  limit?: number;
  sort?: 'newest' | 'budget_high' | 'budget_low' | 'applications' | 'deadline';
}

export interface PopularCategory extends Category {
  trendingSkills?: string[];
  averageBudget?: Money;
  demandLevel?: 'low' | 'medium' | 'high';
  growthRate?: number;
}

export interface SkillTrend {
  skill: Skill;
  demandGrowth: number;
  averageRate: Money;
  projectCount: number;
  freelancerCount: number;
  trending: boolean;
  futureOutlook: 'growing' | 'stable' | 'declining';
}

export interface MarketInsight {
  category: string;
  averageProjectValue: Money;
  completionRate: number;
  averageTimeToHire: number; // days
  topSkillsInDemand: string[];
  freelancerSupply: 'low' | 'medium' | 'high';
  clientDemand: 'low' | 'medium' | 'high';
  competitionLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface SuccessStory {
  id: string;
  title: string;
  summary: string;
  client: {
    name: string;
    company?: string;
    industry?: string;
    avatar?: string;
  };
  freelancer: {
    name: string;
    title: string;
    avatar?: string;
    skills: string[];
  };
  project: {
    title: string;
    category: string;
    budget: Money;
    duration: number;
    completedAt: string;
  };
  results: {
    satisfaction: number;
    deliveredOnTime: boolean;
    budgetAdherence: number;
    qualityRating: number;
  };
  testimonial: string;
  featured: boolean;
  publishedAt: string;
}

export interface PlatformNews {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: 'feature' | 'announcement' | 'market' | 'tips' | 'success';
  featured: boolean;
  publishedAt: string;
  author: {
    name: string;
    title: string;
    avatar?: string;
  };
  tags: string[];
  readTime: number; // minutes
  image?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting_started' | 'payments' | 'projects' | 'profiles' | 'disputes' | 'general';
  helpful: number;
  featured: boolean;
  updatedAt: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: string;
  relatedArticles?: Array<{
    id: string;
    title: string;
  }>;
}

// Location and Geography
export interface Country {
  code: string;
  name: string;
  states?: State[];
  popular: boolean;
  freelancerCount: number;
  clientCount: number;
  averageRates: {
    min: Money;
    max: Money;
    average: Money;
  };
}

export interface State {
  code: string;
  name: string;
  cities?: City[];
}

export interface City {
  name: string;
  freelancerCount: number;
  averageRate: Money;
  popular: boolean;
}

export interface TimeZone {
  name: string;
  abbreviation: string;
  offset: string;
  location: string;
}

// Search and Discovery
export interface SearchSuggestion {
  type: 'skill' | 'category' | 'freelancer' | 'project' | 'client';
  value: string;
  label: string;
  count?: number;
  popular?: boolean;
}

export interface TrendingSearch {
  query: string;
  count: number;
  growth: number;
  category?: string;
}

export interface RecommendationReason {
  type: 'skill_match' | 'budget_range' | 'client_rating' | 'location' | 'availability' | 'past_work';
  description: string;
  weight: number;
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'project' | 'freelancer' | 'client';
  item: any; // Will be typed as PublicProjectBrief | FeaturedFreelancer etc.
  score: number;
  reasons: RecommendationReason[];
  createdAt: string;
}
