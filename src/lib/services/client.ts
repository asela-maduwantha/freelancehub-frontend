import { api } from '../api/api-client';
import type { ClientProfileCreationDto, ClientProfileResponse, ClientProfileDraft } from '../types/client';

export class ClientService {
  /**
   * Create a new client profile
   */
  static async createProfile(data: ClientProfileCreationDto): Promise<ClientProfileResponse> {
    return api.post('/client/profile', data);
  }

  /**
   * Update client profile
   */
  static async updateProfile(profileId: string, data: Partial<ClientProfileCreationDto>): Promise<ClientProfileResponse> {
    return api.put(`/client/profile/${profileId}`, data);
  }

  /**
   * Get current user's client profile
   */
  static async getMyClientProfile(): Promise<ClientProfileResponse> {
    return api.get('/users/profile');
  }

  /**
   * Save draft client profile
   */
  static async saveDraft(data: Partial<ClientProfileCreationDto>): Promise<ClientProfileDraft> {
    return api.post('/client/profile/draft', data);
  }

  /**
   * Update draft client profile
   */
  static async updateDraft(data: Partial<ClientProfileCreationDto>): Promise<ClientProfileDraft> {
    return api.put('/client/profile/draft', data);
  }

  /**
   * Get client profile by ID
   */
  static async getProfile(profileId: string): Promise<ClientProfileResponse> {
    return api.get(`/client/profile/${profileId}`);
  }

  /**
   * Delete client profile
   */
  static async deleteProfile(profileId: string): Promise<void> {
    return api.delete(`/client/profile/${profileId}`);
  }
}
