import { useAuthStore } from '@/store/authStore';

export class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Get the current access token
   */
  public getAccessToken(): string | null {
    return useAuthStore.getState().getAccessToken();
  }

  /**
   * Get the current refresh token
   */
  public getRefreshToken(): string | null {
    const refreshToken = useAuthStore.getState().getRefreshToken();
    return refreshToken;
  }

  /**
   * Check if we have a valid token
   */
  public hasValidToken(): boolean {
    return useAuthStore.getState().hasValidToken();
  }

  /**
   * Set new tokens
   */
  public setTokens(accessToken: string, refreshToken?: string): void {
    useAuthStore.getState().setTokens({
      accessToken,
      refreshToken: refreshToken || null,
    });
  }

  /**
   * Clear all tokens
   */
  public clearTokens(): void {
    useAuthStore.getState().setTokens({
      accessToken: null,
      refreshToken: null,
    });
  }

  /**
   * Refresh the access token using the refresh token
   * Ensures only one refresh request is made at a time
   */
  public async refreshAccessToken(): Promise<string | null> {
    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      try {
        return await this.refreshPromise;
      } catch {
        this.refreshPromise = null;
        throw new Error('Token refresh failed');
      }
    }

    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      console.error('TokenManager - No refresh token available for refresh');
      throw new Error('No refresh token available');
    }

    // Create the refresh promise
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const newAccessToken = await this.refreshPromise;
      this.refreshPromise = null;
      return newAccessToken;
    } catch {
      this.refreshPromise = null;
      throw new Error('Token refresh failed');
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      // Import AuthService dynamically to avoid circular dependency
      const { AuthService } = await import('./auth');
      
      const response = await AuthService.refreshToken(refreshToken);
      
      // Update tokens in store
      this.setTokens(response.accessToken, response.refreshToken);
      
      return response.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Only logout if it's a clear auth failure (not network issues)
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('unauthorized') || 
            errorMessage.includes('invalid') || 
            errorMessage.includes('expired')) {
          // Clear tokens and logout only for auth-related errors
          this.clearTokens();
          useAuthStore.getState().logout();
        }
      }
      
      throw error;
    }
  }

  /**
   * Check if a token is expired (basic check)
   * Note: This is a simple implementation. In production, you might want to decode JWT
   */
  public isTokenExpired(token: string): boolean {
    try {
  // Avoid atob on server
  if (typeof window === 'undefined') return false;
  // Basic JWT expiration check (you can enhance this)
  const base64 = token.split('.')[1];
  if (!base64) return true;
  const payload = JSON.parse(atob(base64));
      const currentTime = Math.floor(Date.now() / 1000);
  return typeof payload.exp === 'number' ? payload.exp < currentTime : true;
  } catch {
      // If we can't parse the token, consider it expired
      return true;
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  public async getValidAccessToken(): Promise<string | null> {
    let accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    // If no access token but we have a refresh token, try to refresh proactively
    if (!accessToken && refreshToken) {
      try {
        accessToken = await this.refreshAccessToken();
      } catch {
        return null;
      }
    } else if (!accessToken) {
      return null;
    }

    // Check if token is expired and refresh if needed
  if (!accessToken) return null;
  if (this.isTokenExpired(accessToken)) {
      try {
        accessToken = await this.refreshAccessToken();
  if (!accessToken) return null;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // Don't immediately logout, let the API call handle the 401
        return null;
      }
    }

    return accessToken;
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
