// API utilities and helpers
import { ApiResponse, PaginatedResponse } from '../types';

/**
 * Helper function to handle API responses with error handling
 */
export const handleApiResponse = async <T>(
  apiCall: () => Promise<ApiResponse<T>>
): Promise<{ data: T | null; error: string | null; success: boolean }> => {
  try {
    const response = await apiCall();
    
    if (response.success && response.data) {
      return {
        data: response.data,
        error: null,
        success: true
      };
    } else {
      return {
        data: null,
        error: response.error?.message || 'An unknown error occurred',
        success: false
      };
    }
  } catch (error: any) {
    return {
      data: null,
      error: error.response?.data?.error?.message || error.message || 'Network error',
      success: false
    };
  }
};

/**
 * Helper function to handle paginated API responses
 */
export const handlePaginatedResponse = async <T>(
  apiCall: () => Promise<PaginatedResponse<T>>
): Promise<{ 
  data: T | null; 
  pagination: any; 
  error: string | null; 
  success: boolean 
}> => {
  try {
    const response = await apiCall();
    
    if (response.success && response.data) {
      return {
        data: response.data,
        pagination: response.pagination,
        error: null,
        success: true
      };
    } else {
      return {
        data: null,
        pagination: null,
        error: 'An error occurred while fetching data',
        success: false
      };
    }
  } catch (error: any) {
    return {
      data: null,
      pagination: null,
      error: error.response?.data?.error?.message || error.message || 'Network error',
      success: false
    };
  }
};

/**
 * Helper to build query parameters from an object
 */
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};

/**
 * Helper to format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Helper to validate file type and size
 */
export const validateFile = (
  file: File,
  allowedTypes: string[] = [],
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${formatFileSize(maxSize)}`
    };
  }
  
  // Check file type if specified
  if (allowedTypes.length > 0) {
    const fileType = file.type;
    const isValidType = allowedTypes.some(type => {
      if (type.includes('*')) {
        // Handle wildcards like 'image/*'
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType + '/');
      }
      return fileType === type;
    });
    
    if (!isValidType) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }
  }
  
  return { valid: true };
};

/**
 * Helper to create FormData from an object
 */
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        if (value[0] instanceof File) {
          // Handle file arrays
          value.forEach(file => formData.append(key, file));
        } else {
          // Handle other arrays
          formData.append(key, JSON.stringify(value));
        }
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  return formData;
};

/**
 * Helper to debounce API calls
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Helper to format currency
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Helper to format date
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  },
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Helper to format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

/**
 * Helper to extract error message from API error
 */
export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Helper to check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('access_token');
  return !!token;
};

/**
 * Helper to get stored auth token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

/**
 * Helper to clear authentication
 */
export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Helper to store authentication
 */
export const storeAuth = (tokens: { accessToken: string; refreshToken: string }, user?: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', tokens.accessToken);
  localStorage.setItem('refresh_token', tokens.refreshToken);
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * Helper to get stored user
 */
export const getStoredUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export default {
  handleApiResponse,
  handlePaginatedResponse,
  buildQueryParams,
  formatFileSize,
  validateFile,
  createFormData,
  debounce,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getErrorMessage,
  isAuthenticated,
  getAuthToken,
  clearAuth,
  storeAuth,
  getStoredUser
};
