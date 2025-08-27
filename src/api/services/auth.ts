// Authentication API services
import apiClient from '../axios-instance';
import { 
  ApiResponse, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  WebAuthnChallenge,
  WebAuthnResponse,
  PasswordResetRequest,
  PasswordResetData,
  ChangePasswordData,
  EmailVerificationData
} from '../../types';

export const authApi = {
  // Traditional login
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response.data as ApiResponse<AuthResponse>;
  },

  // Register new user
  register: async (userData: RegisterData): Promise<ApiResponse<{ user: any; verificationRequired: boolean }>> => {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    return response.data as ApiResponse<{ user: any; verificationRequired: boolean }>;
  },

  // Get current user info
  getCurrentUser: async (): Promise<ApiResponse<{ user: any }>> => {
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data as ApiResponse<{ user: any }>;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ tokens: any }>> => {
    const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken });
    return response.data as ApiResponse<{ tokens: any }>;
  },

  // Logout user
  logout: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data as ApiResponse<any>;
  },

  // WebAuthn login challenge
  getLoginChallenge: async (identifier: string): Promise<ApiResponse<WebAuthnChallenge>> => {
    const response = await apiClient.post('/api/v1/auth/login/challenge', { identifier });
    return response.data as ApiResponse<WebAuthnChallenge>;
  },

  // Verify WebAuthn login
  verifyWebAuthnLogin: async (data: {
    identifier: string;
    authenticationResponse: WebAuthnResponse;
    challenge: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/api/v1/auth/login/verify', data);
    return response.data as ApiResponse<AuthResponse>;
  },

  // Email verification
  verifyEmail: async (data: EmailVerificationData): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/auth/verify-email', data);
    return response.data as ApiResponse<any>;
  },

  // Send email OTP
  sendEmailOtp: async (email: string, type: string = 'verification'): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/auth/send-email-otp', { email, type });
    return response.data as ApiResponse<any>;
  },

  // Password reset request
  forgotPassword: async (data: PasswordResetRequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/auth/forgot-password', data);
    return response.data as ApiResponse<any>;
  },

  // Reset password with OTP
  resetPassword: async (data: PasswordResetData): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/auth/reset-password', data);
    return response.data as ApiResponse<any>;
  },

  // Change password (authenticated)
  changePassword: async (data: ChangePasswordData): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/api/v1/auth/change-password', data);
    return response.data as ApiResponse<any>;
  },

  // Update profile
  updateProfile: async (data: any): Promise<ApiResponse<{ user: any }>> => {
    const response = await apiClient.put('/api/v1/auth/profile', data);
    return response.data as ApiResponse<{ user: any }>;
  },

  // Update privacy settings
  updatePrivacySettings: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/api/v1/auth/privacy', data);
    return response.data as ApiResponse<any>;
  },

  // Update notification preferences
  updateNotificationPreferences: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/api/v1/notifications/preferences', data);
    return response.data as ApiResponse<any>;
  },

  // Enable 2FA
  enableTwoFactor: async (): Promise<ApiResponse<{ qrCode: string; secret: string }>> => {
    const response = await apiClient.post('/api/v1/auth/2fa/enable');
    return response.data as ApiResponse<{ qrCode: string; secret: string }>;
  },

  // Verify 2FA setup
  verifyTwoFactor: async (code: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/auth/2fa/verify', { code });
    return response.data as ApiResponse<any>;
  },

  // Disable 2FA
  disableTwoFactor: async (code: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/auth/2fa/disable', { code });
    return response.data as ApiResponse<any>;
  },

  // Get active sessions
  getActiveSessions: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/api/v1/auth/sessions');
    return response.data as ApiResponse<any[]>;
  },

  // Terminate session
  terminateSession: async (sessionId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/auth/sessions/${sessionId}`);
    return response.data as ApiResponse<any>;
  },

  // Terminate all sessions
  terminateAllSessions: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete('/api/v1/auth/sessions/all');
    return response.data as ApiResponse<any>;
  },

  // Delete account
  deleteAccount: async (password: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/auth/delete-account', {
      password,
      reason
    });
    return response.data as ApiResponse<any>;
  },

  // Export user data
  exportUserData: async (): Promise<ApiResponse<{ downloadUrl: string }>> => {
    const response = await apiClient.post('/api/v1/auth/export-data');
    return response.data as ApiResponse<{ downloadUrl: string }>;
  }
};

export default authApi;
