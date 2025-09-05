import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
  IApiResponse, 
  PaginatedApiResponse,
  FileUploadResult,
  UploadResponse,
  UploadMultipleResponse 
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  endpoint?: string;
  errors?: string[];
}

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL; // Assign baseURL first

    try {
      // Create axios instance
      this.axiosInstance = axios.create({
        baseURL: this.baseURL,
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Initialize tokens from storage
      this.initializeTokens();

      // Setup interceptors
      this.setupRequestInterceptor();
      this.setupResponseInterceptor();
    } catch (error) {
      console.error('Error initializing ApiClient:', error);
      // Create a basic axios instance as fallback
      this.axiosInstance = axios.create({
        baseURL: this.baseURL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }  private initializeTokens() {
    try {
      if (typeof window !== 'undefined') {
        this.token = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
      }
    } catch (error) {
      console.error('Error initializing tokens:', error);
      // Reset tokens if there's an issue with localStorage
      this.token = null;
      this.refreshToken = null;
    }
  }

  private setupRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        try {
          // Ensure we have the latest token from localStorage
          if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('accessToken');
          }

          if (this.token && config.headers) {
            config.headers.Authorization = `Bearer ${this.token}`;
          }

          return config;
        } catch (error) {
          console.error('Request interceptor error:', error);
          return config; // Return config even if token retrieval fails
        }
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
  }

  private setupResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Success for ${response.config.url}:`, response.data);
        }
        return response.data;
      },
      async (error: AxiosError) => {
        try {
          const originalRequest = error.config;

          // Handle token refresh
          if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
            // Prevent infinite retry loops
            if ((originalRequest as any)._retryCount >= 3) {
              console.error('Max retry attempts reached for request:', originalRequest.url);
              return Promise.reject(error);
            }

            if (this.isRefreshing) {
              // Queue the request
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
              }).then((token) => {
                // Retry with new token
                return this.axiosInstance({
                  ...originalRequest,
                  headers: {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${token}`
                  }
                });
              }).catch(err => {
                console.error('Queued request failed:', err);
                return Promise.reject(err);
              });
            }

            (originalRequest as any)._retry = true;
            (originalRequest as any)._retryCount = ((originalRequest as any)._retryCount || 0) + 1;
            this.isRefreshing = true;

            try {
              const newToken = await this.refreshAccessToken();
              this.processQueue(null, newToken);
              // Retry the original request with new token
              return this.axiosInstance({
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${newToken}`
                }
              });
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              this.processQueue(refreshError, null);
              this.clearTokens();
              // Redirect to login or emit auth error event
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          }

          // Log errors in development
          if (process.env.NODE_ENV === 'development') {
            console.error(`API Error for ${error.config?.url}:`, {
              status: error.response?.status,
              message: error.message,
              endpoint: error.config?.url,
              data: error.response?.data
            });
          }

          // Create structured error
          const apiError = this.createApiError(error);
          return Promise.reject(apiError);
        } catch (interceptorError) {
          // Handle any errors that occur within the interceptor itself
          console.error('Response interceptor error:', interceptorError);
          // Return the original error if interceptor fails
          return Promise.reject(error || interceptorError);
        }
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    try {
      this.failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      });
    } catch (queueError) {
      console.error('Error processing failed queue:', queueError);
    } finally {
      this.failedQueue = [];
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken: this.refreshToken
      });

      const { access_token, refresh_token } = response.data;
      if (!access_token) {
        throw new Error('No access token received from refresh endpoint');
      }

      this.setTokens(access_token, refresh_token);
      return access_token;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw new Error(`Token refresh failed: ${error.message || 'Unknown error'}`);
    }
  }

  private createApiError(error: AxiosError): ApiError {
    try {
      let errorMessage = `HTTP ${error.response?.status}: ${error.response?.statusText}`;
      let errors: string[] = [];

      if (error.response?.data && typeof error.response.data === 'object') {
        const data = error.response.data as any;
        errorMessage = data.message || data.error || errorMessage;
        errors = Array.isArray(data.errors) ? data.errors : [];
      } else if (error.message) {
        errorMessage = error.message;
      }

      const apiError = new Error(errorMessage) as ApiError;
      apiError.status = error.response?.status;
      apiError.statusText = error.response?.statusText;
      apiError.endpoint = error.config?.url;
      apiError.errors = errors;

      return apiError;
    } catch (createError) {
      // Fallback error creation if something goes wrong
      console.error('Error creating API error:', createError);
      const fallbackError = new Error('An unexpected error occurred') as ApiError;
      fallbackError.status = error.response?.status;
      fallbackError.endpoint = error.config?.url;
      return fallbackError;
    }
  }

  setTokens(accessToken: string, refreshToken?: string) {
    try {
      this.token = accessToken;
      if (refreshToken) {
        this.refreshToken = refreshToken;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
      }
    } catch (error) {
      console.error('Error setting tokens:', error);
      // Don't throw here as this might cause cascading failures
    }
  }

  clearTokens() {
    try {
      this.token = null;
      this.refreshToken = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
      // Don't throw here as this might cause cascading failures
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.axiosInstance.get(endpoint, { params });
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data;
    }
    return response.data;
  }

  // Public GET request (without auth)
  async getPublic<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await axios.get(`${this.baseURL}${endpoint}`, { params });
    console.log('Public API response:', response);
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post(endpoint, data);
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put(endpoint, data);
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.patch(endpoint, data);
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete(endpoint);
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  }

  // Single file upload
  async uploadFile(endpoint: string, file: File, folder?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await this.axiosInstance.post<UploadResponse>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Multiple files upload
  async uploadFiles(endpoint: string, files: File[], folder?: string): Promise<UploadMultipleResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await this.axiosInstance.post<UploadMultipleResponse>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Download file
  async downloadFile(endpoint: string): Promise<Blob> {
    const response = await this.axiosInstance.get(endpoint, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);