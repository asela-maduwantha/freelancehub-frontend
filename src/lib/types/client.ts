export interface Location {
  country: string;
  city: string;
  province: string;
}

export interface ClientProfileCreationDto {
  companyName: string;
  industry: string;
  companySize: string;
  website?: string;
  description: string;
  location: Location;
}

export interface ClientProfileResponse {
  id: string;
  companyName: string;
  industry: string;
  companySize: string;
  website?: string;
  description: string;
  location: Location;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfileDraft {
  id: string;
  companyName: string;
  industry: string;
  companySize: string;
  website?: string;
  description: string;
  location: Location;
  updatedAt: string;
}
