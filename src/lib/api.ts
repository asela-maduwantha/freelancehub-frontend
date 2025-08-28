// API configuration and utility functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// API client configuration
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Get token from localStorage if available (client-side only)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Ensure we have the latest token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Log response details for debugging
      console.log(`API Response for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError);
        }
        
        // Create a more detailed error object
        const apiError = new Error(errorMessage);
        (apiError as any).status = response.status;
        (apiError as any).statusText = response.statusText;
        (apiError as any).endpoint = endpoint;
        
        console.error(`API Error for ${endpoint}:`, {
          status: response.status,
          message: errorMessage,
          endpoint: endpoint
        });
        
        throw apiError;
      }

      const data = await response.json();
      console.log(`API Success for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload request (for FormData)
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Ensure we have the latest token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
    
    const headers: Record<string, string> = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method: 'POST',
      body: formData,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError);
        }
        
        const apiError = new Error(errorMessage);
        (apiError as any).status = response.status;
        (apiError as any).statusText = response.statusText;
        (apiError as any).endpoint = endpoint;
        
        throw apiError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`File upload failed: ${endpoint}`, error);
      throw error;
    }
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Auth-related interfaces
export interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  primaryRole: 'client' | 'freelancer';
  phone: string;
  location: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    profile: any;
    verification: any;
    twoFactorEnabled?: boolean;
  };
  expiresIn: number;
}

export interface VerifyEmailData {
  token: string;
  email: string;
}



export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface SendEmailOTPData {
  email: string;
  type: 'verification' | 'reset';
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

// Authentication API functions
export const authAPI = {
  // Register user
  async register(data: RegisterData): Promise<{ message: string; verificationRequired: boolean }> {
    return apiClient.post('/auth/register', data);
  },

  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    apiClient.setToken(response.accessToken);
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
    const response = await apiClient.post<AuthResponse>('/auth/verify-email-otp', data);
    apiClient.setToken(response.accessToken);
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
    apiClient.setToken(response.accessToken);
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

  // Verify 2FA
  async verify2FA(code: string): Promise<{ message: string }> {
    return apiClient.post('/auth/2fa/verify', { code });
  },

  // Enable 2FA
  async enable2FA(): Promise<{ qrCode: string; backupCodes: string[] }> {
    return apiClient.post('/auth/2fa/enable');
  },

  // Disable 2FA
  async disable2FA(code: string): Promise<{ message: string }> {
    return apiClient.post('/auth/2fa/disable', { code });
  },
};

// Error handling utilities
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic API response type
export interface APIResponse<T = any> {
  message: string;
  data?: T;
  success: boolean;
}

// Paginated response type
export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Client API functions
export const clientAPI = {
  // Get client dashboard data
  async getDashboard(): Promise<any> {
    return apiClient.get('/client/dashboard');
  },

  // Get client projects
  async getProjects(params: any = {}): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/client/projects${queryParams ? `?${queryParams}` : ''}`);
  },

  // Search freelancers
  async searchFreelancers(params: any = {}): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/client/freelancers/search${queryParams ? `?${queryParams}` : ''}`);
  },

  // Create project
  async createProject(projectData: any): Promise<any> {
    return apiClient.post('/projects', projectData);
  },

  // Get project by ID
  async getProject(projectId: string): Promise<any> {
    return apiClient.get(`/projects/${projectId}`);
  },

  // Update project
  async updateProject(projectId: string, projectData: any): Promise<any> {
    return apiClient.put(`/projects/${projectId}`, projectData);
  },

  // Delete project
  async deleteProject(projectId: string): Promise<any> {
    return apiClient.delete(`/projects/${projectId}`);
  },

  // Get project proposals
  async getProjectProposals(projectId: string): Promise<any> {
    return apiClient.get(`/projects/${projectId}/proposals`);
  },

  // Accept proposal
  async acceptProposal(proposalId: string): Promise<any> {
    return apiClient.post(`/projects/proposals/${proposalId}/accept`);
  },

  // Reject proposal
  async rejectProposal(proposalId: string, reason?: string): Promise<any> {
    return apiClient.post(`/projects/proposals/${proposalId}/reject`, { reason });
  },
};

// Freelancer API functions
export const freelancerAPI = {
  // Get freelancer dashboard data
  async getDashboard(): Promise<any> {
    return apiClient.get('/freelancer/dashboard');
  },

  // Update freelancer profile
  async updateProfile(profileData: any): Promise<any> {
    return apiClient.put('/freelancer/profile', profileData);
  },

  // Create complete freelancer profile
  async createCompleteProfile(profileData: any): Promise<any> {
    return apiClient.post('/freelancer/profile/create', profileData);
  },

  // Add portfolio item
  async addPortfolioItem(portfolioData: any): Promise<any> {
    return apiClient.post('/freelancer/portfolio', portfolioData);
  },

  // Get portfolio items
  async getPortfolioItems(): Promise<any> {
    return apiClient.get('/freelancer/portfolio');
  },

  // Update portfolio item
  async updatePortfolioItem(itemId: string, portfolioData: any): Promise<any> {
    return apiClient.put(`/freelancer/portfolio/${itemId}`, portfolioData);
  },

  // Delete portfolio item
  async deletePortfolioItem(itemId: string): Promise<any> {
    return apiClient.delete(`/freelancer/portfolio/${itemId}`);
  },

  // Get freelancer proposals
  async getProposals(params: any = {}): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/projects/freelancer/proposals${queryParams ? `?${queryParams}` : ''}`);
  },

  // Submit proposal
  async submitProposal(projectId: string, proposalData: any): Promise<any> {
    return apiClient.post(`/projects/${projectId}/proposals`, proposalData);
  },
};

// Contract API functions
export const contractAPI = {
  // Get contracts
  async getContracts(params: any = {}): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/contracts${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get contract by ID
  async getContract(contractId: string): Promise<any> {
    return apiClient.get(`/contracts/${contractId}`);
  },

  // Get contract statistics
  async getContractStats(): Promise<any> {
    return apiClient.get('/contracts/stats');
  },
};

// Project API functions
export const projectAPI = {
  // Get all projects (public)
  async getProjects(params: any = {}): Promise<PaginatedResponse> {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/projects${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get public projects (no auth required)
  async getPublicProjects(params: any = {}): Promise<PaginatedResponse> {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/projects/public${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get project by ID
  async getProject(projectId: string): Promise<any> {
    return apiClient.get(`/projects/${projectId}`);
  },
};

// File Upload API functions
export const uploadAPI = {
  // Upload single file
  async uploadSingleFile(file: File, category: string, relatedTo?: string, onModel?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (relatedTo) formData.append('relatedTo', relatedTo);
    if (onModel) formData.append('onModel', onModel);

    return apiClient.upload('/uploads/single', formData);
  },

  // Upload multiple files
  async uploadMultipleFiles(files: File[], category: string, relatedTo?: string, onModel?: string): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', category);
    if (relatedTo) formData.append('relatedTo', relatedTo);
    if (onModel) formData.append('onModel', onModel);

    return apiClient.upload('/uploads/multiple', formData);
  },

  // Get user files
  async getUserFiles(params: any = {}): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/uploads${queryParams ? `?${queryParams}` : ''}`);
  },

  // Delete file
  async deleteFile(fileId: string): Promise<any> {
    return apiClient.delete(`/uploads/${fileId}`);
  },
};

export default apiClient;
