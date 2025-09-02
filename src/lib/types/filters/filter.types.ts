import { AvailabilityStatus, ExperienceLevel, ProjectStatus, SortOrder, UserRole } from "../enums/status.types";

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type DateRange = {
  start: Date;
  end: Date;
};

export type PriceRange = {
  min: number;
  max: number;
};

export type ProjectFilters = {
  category?: string;
  skills?: string[];
  budget?: PriceRange;
  deadline?: DateRange;
  status?: ProjectStatus[];
  clientId?: string;
};

export type UserFilters = {
  role?: UserRole[];
  skills?: string[];
  location?: string;
  experienceLevel?: ExperienceLevel[];
  availability?: AvailabilityStatus[];
};

export type SearchOptions = {
  query: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
};