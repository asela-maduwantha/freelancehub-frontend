import type { Role } from './common';

export interface BaseUser {
  id?: string; // some endpoints return id
  _id?: string; // others return _id
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: Role;
  profilePicture?: string | null;
  isActive?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string;
}

export interface UpdateBaseProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePicture?: string;
}

export interface ClientProfileDto {
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  description?: string;
  location?: { country: string; city?: string; province?: string };
}

export interface ClientProfile extends ClientProfileDto {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
