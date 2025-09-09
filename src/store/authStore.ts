import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/lib/types/auth';

// Token management interface
interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Token state
  tokens: TokenState;
  
  // Registration flow state (non-persistent)
  selectedRole: 'freelancer' | 'client' | null;
  registrationEmail: string | null;
  
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: TokenState) => void;
  setSelectedRole: (role: 'freelancer' | 'client' | null) => void;
  setRegistrationEmail: (email: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  login: (user: User, tokens: { accessToken: string; refreshToken?: string }) => void;
  logout: () => void;
  clearRegistrationData: () => void;
  getUserRole: () => 'freelancer' | 'client' | null;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  hasValidToken: () => boolean;
}

// Persistent state (user, tokens, isAuthenticated)
const persistentState = {
  user: null as User | null,
  isAuthenticated: false,
  tokens: {
    accessToken: null,
    refreshToken: null,
  } as TokenState,
};

// Non-persistent state (registration flow, loading states)
const temporaryState = {
  selectedRole: null as 'freelancer' | 'client' | null,
  registrationEmail: null as string | null,
  isLoading: false,
  isInitialized: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...persistentState,
      ...temporaryState,

      // Actions
      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setTokens: (tokens) => {
        set({ tokens });
      },

      setSelectedRole: (role) => {
        set({ selectedRole: role });
      },

      setRegistrationEmail: (email) => {
        set({ registrationEmail: email });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setInitialized: (initialized) => {
        set({ isInitialized: initialized });
      },

      login: (user, tokenData) => {
        const tokens: TokenState = {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken || null,
        };
        
        console.log('AuthStore login - received tokens:', tokenData);
        console.log('AuthStore login - storing tokens:', tokens);
        
        set({ 
          user, 
          isAuthenticated: true,
          tokens,
        });
        
        // Verify tokens were stored
        console.log('AuthStore login - stored state:', get().tokens);
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          tokens: {
            accessToken: null,
            refreshToken: null,
          },
          // Keep registration flow data for now (user might want to continue registration)
          // selectedRole: null,
          // registrationEmail: null,
          isLoading: false,
        });
      },

      clearRegistrationData: () => {
        set({
          selectedRole: null,
          registrationEmail: null,
        });
      },

      getUserRole: () => {
        const state = get();
        return state.user?.role || null;
      },

      getAccessToken: () => {
        const state = get();
        return state.tokens.accessToken;
      },

      getRefreshToken: () => {
        const state = get();
        return state.tokens.refreshToken;
      },

      hasValidToken: () => {
        const state = get();
        // Consider presence of token; validity will be checked by API call/init hook
        return !!state.tokens.accessToken;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user authentication data, not temporary registration flow data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        tokens: state.tokens,
      }),
    }
  )
);
