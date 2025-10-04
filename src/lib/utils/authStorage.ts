// Auth hydration utilities
export interface StoredAuthData {
  token: string | null;
  refreshToken: string | null;
}

/**
 * Get stored authentication data from localStorage
 */
export const getStoredAuthData = (): StoredAuthData => {
  if (typeof window === 'undefined') {
    return { token: null, refreshToken: null };
  }

  try {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    return {
      token,
      refreshToken,
    };
  } catch (error) {
    console.error('Error retrieving auth data from localStorage:', error);
    return { token: null, refreshToken: null };
  }
};

/**
 * Check if stored auth data exists and is valid
 */
export const hasValidStoredAuth = (): boolean => {
  const { token } = getStoredAuthData();
  return !!token;
};

/**
 * Clear stored authentication data
 */
export const clearStoredAuthData = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Error clearing auth data from localStorage:', error);
  }
};