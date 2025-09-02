// Authentication API functions

import { apiClient } from './client';
import type {
  RegisterData,
  LoginData,
  AuthResponse,
  VerifyEmailData,
  VerifyOTPData,
  SendEmailOTPData,
  ResetPasswordData
} from './types';

// Authentication API functions
export const authAPI = {
  // Register user
  async register(data: RegisterData): Promise<{ message: string }> {
    return apiClient.post('/auth/register', data);
  },

  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    console.log('Login Response:', response.access_token);
    apiClient.setToken(response.access_token);
    return response;
  },

  // Verify email
  async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    return apiClient.post('/auth/verify-email', data);
  },

  // Send email OTP
  async sendEmailOTP(data: SendEmailOTPData): Promise<{ message: string }> {
    return apiClient.post('/auth/send-email-otp', data);
  },

  // Verify email OTP
  async verifyEmailOTP(data: VerifyOTPData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', data);
    console.log('OTP Verification Response:', response);
    apiClient.setToken(response.access_token);
    return response;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', data);
  },

  // Get current user
  async getCurrentUser(): Promise<any> {
    return apiClient.get('/auth/me');
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    apiClient.setToken(response.access_token);
    return response;
  },

  // Logout
  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    apiClient.clearToken();
    return response;
  },

  // Logout from all devices
  async logoutAll(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/logout-all');
    apiClient.clearToken();
    return response;
  },
};
