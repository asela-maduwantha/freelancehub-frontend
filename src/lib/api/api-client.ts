import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError } from '../types/api';
import { tokenManager } from '../services/tokenManager';
import { useAuthStore } from '@/store/authStore';

// Token refresh flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Create Axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token using TokenManager
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get a valid access token (refreshes if necessary)
      const token = await tokenManager.getValidAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get valid token for request:', error);
      // Continue with request without token
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor with improved error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { data } = error.response;
      if (data) {
        const { statusCode, message, error: errorType } = data;
        
        switch (statusCode) {
          case 401:
            // Handle token refresh
      const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean });
            
      if (originalRequest && !originalRequest._retry) {
              if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise<string | null>((resolve, reject) => {
                  failedQueue.push({ resolve: (v?: string | null) => resolve(v ?? null), reject });
                }).then(token => {
                  if (originalRequest.headers && token) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
                  }
                  return apiClient.request(originalRequest);
                }).catch(err => {
                  return Promise.reject(err);
                });
              }

        originalRequest._retry = true;
              isRefreshing = true;

              try {
                const newAccessToken = await tokenManager.refreshAccessToken();
                processQueue(null, newAccessToken);
                
                if (originalRequest.headers && newAccessToken) {
                  (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newAccessToken}`;
                }
                return apiClient.request(originalRequest);
              } catch (refreshError) {
                processQueue(refreshError, null);
                
                console.error('Token refresh failed during API call:', refreshError);

                // Clear local auth state on clear auth failure
                if (refreshError instanceof Error) {
                  const errorMessage = refreshError.message.toLowerCase();
                  if ((errorMessage.includes('unauthorized') || 
                       errorMessage.includes('invalid') || 
                       errorMessage.includes('expired')) &&
                      typeof window !== 'undefined') {
                    try {
                      tokenManager.clearTokens();
                      useAuthStore.getState().logout();
                    } catch {}
                    // Use router instead of direct navigation if possible
                    setTimeout(() => {
                      window.location.href = '/login';
                    }, 100);
                  }
                }
                
                return Promise.reject(refreshError);
              } finally {
                isRefreshing = false;
              }
            }
            break;
            
          case 403:
            console.error('Forbidden access:', Array.isArray(message) ? message.join(', ') : message);
            break;
            
          case 500:
            console.error('Internal server error');
            break;
            
          default:
            console.error(`API Error (${statusCode} - ${errorType}):`, Array.isArray(message) ? message.join(', ') : message);
        }
        
        // Return a more structured error
        return Promise.reject({
          statusCode,
          message: Array.isArray(message) ? message : [message],
          error: errorType,
          timestamp: data.timestamp,
          path: data.path,
          method: data.method
        });
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get<ApiResponse<T>>(url, config).then(res => res.data.data),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post<ApiResponse<T>>(url, data, config).then(res => res.data.data),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put<ApiResponse<T>>(url, data, config).then(res => res.data.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch<ApiResponse<T>>(url, data, config).then(res => res.data.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete<ApiResponse<T>>(url, config).then(res => res.data.data),
};

export default apiClient;