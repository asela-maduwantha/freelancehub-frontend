export interface IUser {
  _id: string;
  email: string;
  emailVerified: boolean;
  role: string[];
  activeRole: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  phone?: string;
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
  languages?: {
    language: string;
    proficiency: string;
  }[];
  freelancerProfile?: {
    title?: string;
    bio?: string;
    skills?: string[];
    experience?: string;
    education?: {
      degree: string;
      institution: string;
      year: number;
    }[];
    certifications?: {
      name: string;
      issuer: string;
      date: string;
      url?: string;
    }[];
    portfolio?: {
      title: string;
      description: string;
      images?: string[];
      url?: string;
      tags?: string[];
    }[];
    hourlyRate?: number;
    availability?: string;
    workingHours?: {
      timezone: string;
      hours: {
        day: string;
        start: string;
        end: string;
      }[];
    };
  };
  clientProfile?: {
    companyName?: string;
    companySize?: string;
    industry?: string;
    website?: string;
    description?: string;
    verified?: boolean;
  };
  stats?: {
    projectsCompleted?: number;
    totalEarnings?: number;
    totalSpent?: number;
    avgRating?: number;
    responseRate?: number;
    responseTime?: number;
    completionRate?: number;
  };
  stripeCustomerId?: string;
  paymentMethods?: {
    id: string;
    type: string;
    last4: string;
    isDefault: boolean;
  }[];
  followers?: string[];
  following?: string[];
  status?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}