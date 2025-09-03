import { apiClient } from './client';
import {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  IUser,
  IApiResponse
} from '../types/index';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: IUser;
}

export interface RefreshRequest {
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<{ user: IUser }> {
    return apiClient.post('/auth/register', data);
  }

  /**
   * Login user and get tokens
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens
    if (response.access_token && response.refresh_token) {
      apiClient.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  }

  /**
   * Verify email with OTP
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', data);
    
    // Store tokens after successful verification
    if (response.access_token && response.refresh_token) {
      apiClient.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post('/auth/refresh', { refreshToken });
  }

  /**
   * Logout user
   */
  async logout(): Promise<IApiResponse> {
    try {
      const response = await apiClient.post<IApiResponse>('/auth/logout');
      return response;
    } finally {
      // Always clear tokens, even if logout fails
      apiClient.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<IUser> {
    return apiClient.get('/auth/profile');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }
}

export const authService = new AuthService();