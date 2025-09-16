// API request/response interceptors
import { apiClient } from './client';

interface Interceptor {
  request?: (config: RequestInit) => RequestInit;
  response?: (response: Response) => Response;
  error?: (error: Error) => Error;
}

class InterceptorManager {
  private requestInterceptors: ((config: RequestInit) => RequestInit)[] = [];
  private responseInterceptors: ((response: Response) => Response)[] = [];
  private errorInterceptors: ((error: Error) => Error)[] = [];

  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response) {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: Error) => Error) {
    this.errorInterceptors.push(interceptor);
  }

  applyRequestInterceptors(config: RequestInit): RequestInit {
    return this.requestInterceptors.reduce((acc, interceptor) => interceptor(acc), config);
  }

  applyResponseInterceptors(response: Response): Response {
    return this.responseInterceptors.reduce((acc, interceptor) => interceptor(acc), response);
  }

  applyErrorInterceptors(error: Error): Error {
    return this.errorInterceptors.reduce((acc, interceptor) => interceptor(acc), error);
  }
}

export const interceptorManager = new InterceptorManager();

// Default interceptors
interceptorManager.addRequestInterceptor((config) => {
  // Add loading state
  console.log('Making API request:', config);
  return config;
});

interceptorManager.addResponseInterceptor((response) => {
  // Handle successful responses
  console.log('API response:', response);
  return response;
});

interceptorManager.addErrorInterceptor((error) => {
  // Handle errors globally
  console.error('API error:', error);

  // Handle authentication errors
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    // Redirect to login or refresh token
    console.log('Authentication error - redirecting to login');
  }

  return error;
});

export default interceptorManager;