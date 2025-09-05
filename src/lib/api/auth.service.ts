import { apiClient } from './client';
import {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  AuthResponse,
  RegisterResponse,
  VerifyOtpResponse,
  RefreshTokenResponse,
  LogoutResponse,
  ProfileResponse,
  IApiResponse
} from '../types/index';

export interface RefreshRequest {
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
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
  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', data);
    
    // Store tokens after successful verification
    if (response.access_token && response.refresh_token) {
      apiClient.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
    
    // Update the stored access token, keep the existing refresh token
    if (response.accessToken) {
      apiClient.setTokens(response.accessToken, refreshToken);
    }
    
    return response;
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
  async getProfile(): Promise<ProfileResponse> {
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