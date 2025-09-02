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
    this.baseURL = baseURL;
    
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
  }

  private initializeTokens() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private setupRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Ensure we have the latest token from localStorage
        if (typeof window !== 'undefined') {
          this.token = localStorage.getItem('accessToken');
        }
        
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        return config;
      },
      (error) => {
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
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle token refresh
        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
          if (this.isRefreshing) {
            // Queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          (originalRequest as any)._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.processQueue(null, newToken);
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.clearTokens();
            // Redirect to login or emit auth error event
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
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
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
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
      this.setTokens(access_token, refresh_token);
      return access_token;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  private createApiError(error: AxiosError): ApiError {
    let errorMessage = `HTTP ${error.response?.status}: ${error.response?.statusText}`;
    let errors: string[] = [];

    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      errorMessage = data.message || data.error || errorMessage;
      errors = data.errors || [];
    }

    const apiError = new Error(errorMessage) as ApiError;
    apiError.status = error.response?.status;
    apiError.statusText = error.response?.statusText;
    apiError.endpoint = error.config?.url;
    apiError.errors = errors;
    
    return apiError;
  }

  setTokens(accessToken: string, refreshToken?: string) {
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
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, { params });
    return response.data;
  }

  // Public GET request (without auth)
  async getPublic<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await axios.get<T>(`${this.baseURL}${endpoint}`, { params });
    return response.data;
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data);
    return response.data;
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data);
    return response.data;
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data);
    return response.data;
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint);
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