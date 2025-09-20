// API client configuration
import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../../store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle common errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear auth state
          store.dispatch({ type: 'auth/logout' });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // First try to get from Redux store
    const state = store.getState();
    if (state.auth?.token) {
      return state.auth.token;
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  // HTTP methods
  async get(endpoint: string, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.axiosInstance.get(endpoint, config);
    if(response.data.success === false){
      throw new Error(response.data.message || 'API Error');
    }
    return response.data.data;
  }

  async post(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.axiosInstance.post(endpoint, data, config);
    if(response.data.success === false){
      throw new Error(response.data.message || 'API Error');
    }
    return response.data.data;
  }

  async put(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.axiosInstance.put(endpoint, data, config);
    if(response.data.success === false){
      throw new Error(response.data.message || 'API Error');
    }
    return response.data.data;
  }

  async patch(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.axiosInstance.patch(endpoint, data, config);
    if(response.data.success === false){
      throw new Error(response.data.message || 'API Error');
    }
    return response.data.data;
  }

  async delete(endpoint: string, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.axiosInstance.delete(endpoint, config);
    if(response.data.success === false){
      throw new Error(response.data.message || 'API Error');
    }
    return response.data.data;
  }

  // Special method for endpoints that return the full response structure
  async getFullResponse(endpoint: string, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.axiosInstance.get(endpoint, config);
    if(response.data.success === false){
      throw new Error(response.data.message || 'API Error');
    }
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;