import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { store } from '../../../store';
import { authActions } from '../../../store/slices/auth/authSlice';

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'freelancer' | 'client' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface SendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CheckEmailRequest {
  email: string;
}

export interface ResendOtpRequest {
  email: string;
  purpose: 'email_verification' | 'password_reset';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

class AuthService {

  async register(data: RegisterRequest): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async checkEmail(data: CheckEmailRequest): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.CHECK_EMAIL, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email check failed');
    }
  }

  async login(data: LoginRequest): Promise<void> {
    try {
      store.dispatch(authActions.loginStart());
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);

      const { accessToken, refreshToken, user, expiresIn } = response;
      store.dispatch(authActions.loginSuccess({
        user,
        token: accessToken,
        refreshToken,
        expiresIn,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      store.dispatch(authActions.loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    try {
      store.dispatch(authActions.setLoading(true));
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);

      const { accessToken, refreshToken, user, expiresIn } = response;
      store.dispatch(authActions.loginSuccess({
        user,
        token: accessToken,
        refreshToken,
        expiresIn,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      store.dispatch(authActions.loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  async sendVerification(data: SendVerificationRequest): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.SEND_VERIFICATION, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Send verification failed');
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Forgot password failed');
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Reset password failed');
    }
  }

  async resendOtp(data: ResendOtpRequest): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Resend OTP failed');
    }
  }

  async resendVerification(data: SendVerificationRequest): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Resend verification failed');
    }
  }

  async refreshToken(data: RefreshTokenRequest): Promise<void> {
    try {
      store.dispatch(authActions.refreshTokenStart());
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, data);

      const { accessToken, refreshToken, user, expiresIn } = response;
      store.dispatch(authActions.refreshTokenSuccess({
        token: accessToken,
        refreshToken,
        expiresIn,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Token refresh failed';
      store.dispatch(authActions.refreshTokenFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.HEALTH);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  }


  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Change password failed');
    }
  }

  async getProfile(): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
      store.dispatch(authActions.updateProfile(response));
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get profile failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error: any) {
      console.warn('API logout failed, but proceeding with local logout');
    } finally {
      store.dispatch(authActions.logout());
    }
  }

  async getMe(): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      store.dispatch(authActions.updateProfile(response));
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Get me failed');
    }
  }

  clearError(): void {
    store.dispatch(authActions.clearError());
  }

  setLoading(isLoading: boolean): void {
    store.dispatch(authActions.setLoading(isLoading));
  }
}

export const authService = new AuthService();
export default authService;