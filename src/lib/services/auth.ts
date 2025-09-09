import apiClient, { api } from '../api/api-client';
import { tokenManager } from './tokenManager';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyOtpDto,
  OtpVerificationResponse,
  AuthResponse,
  User,
  RegisterResponse,
  RefreshedTokens
} from '../types/auth';

export class AuthService {
  static async register(data: RegisterDto): Promise<RegisterResponse> {
  return api.post('/auth/register', data);
  }

  static async login(data: LoginDto): Promise<AuthResponse> {
    try {
  const authDetails = await api.post<any>('/auth/login', data);
      
      return {
        user: authDetails.user,
        accessToken: authDetails.access_token || authDetails.accessToken,
        refreshToken: authDetails.refresh_token || authDetails.refreshToken
      };
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }

  static async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
  return api.post('/auth/forgot-password', data);
  }

  static async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
  return api.post('/auth/reset-password', data);
  }

  static async verifyOtp(data: VerifyOtpDto): Promise<OtpVerificationResponse> {
    try {
  const backendData = await api.post<any>('/auth/verify-otp', data);
      
      return {
        user: backendData.user,
        accessToken: backendData.access_token || backendData.accessToken,
        refreshToken: backendData.refresh_token || backendData.refreshToken
      };
    } catch (error) {
      console.error('Verify OTP Error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User> {
  return api.get('/auth/profile');
  }

  static async refreshToken(refreshToken: string): Promise<RefreshedTokens> {
  const data = await api.post<any>('/auth/refresh', { refreshToken });
  const accessToken = data.access_token || data.accessToken;
  const newRefreshToken = data.refresh_token || data.refreshToken;
    
    if (!accessToken) {
      throw new Error('No access token received from refresh endpoint');
    }
    
    if (!newRefreshToken) {
      throw new Error('No refresh token received from refresh endpoint');
    }
    
    return { 
      accessToken, 
      refreshToken: newRefreshToken 
    };
  }

  static async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side logout even if server request fails
    }
    
    // Clear tokens using TokenManager
    tokenManager.clearTokens();
  }
}
