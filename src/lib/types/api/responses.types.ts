export interface FileData {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: FileData;
}

export interface UploadMultipleResponse {
  success: boolean;
  message: string;
  data: FileData[];
}

export interface FreelancerProfileResponse {
  success: boolean;
  data: import('../entities/freelancer.types').FreelancerProfile;
  message?: string;
}