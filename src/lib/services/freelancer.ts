import { api } from '../api/api-client';
import { AuthResponse, FreelancerProfileCreationDto } from '../types/auth';
import type { FreelancerProfileResponse, FreelancerProfileDraft } from '../types/freelancer';

export class FreelancerService {
  /**
   * Create a new freelancer profile
   */
  static async createProfile(data: FreelancerProfileCreationDto): Promise<FreelancerProfileResponse> {
  return api.post('/freelancers/profile', data);
  }

  /**
   * Update freelancer profile
   */
  static async updateProfile(profileId: string, data: Partial<FreelancerProfileCreationDto>): Promise<FreelancerProfileResponse> {
  return api.put(`/freelancers/profile/${profileId}`, data);
  }

  /**
   * Get current user's freelancer profile
   */
  static async getMyFreelancerProfile(): Promise<FreelancerProfileResponse> {
    return api.get('/users/profile');
  }

  /**
   * Save draft freelancer profile
   */
  static async saveDraft(data: Partial<FreelancerProfileCreationDto>): Promise<FreelancerProfileDraft> {
    return api.post('/freelancers/profile/draft', data);
  }

  /**
   * Update draft freelancer profile
   */
  static async updateDraft(data: Partial<FreelancerProfileCreationDto>): Promise<FreelancerProfileDraft> {
    return api.put('/freelancers/profile/draft', data);
  }

  /**
   * Get freelancer profile by ID
   */
  static async getProfile(profileId: string): Promise<FreelancerProfileResponse> {
  return api.get(`/freelancers/profile/${profileId}`);
  }

  /**
   * Delete freelancer profile
   */
  static async deleteProfile(profileId: string): Promise<{ message: string }> {
  return api.delete(`/freelancers/profile/${profileId}`);
  }

}
