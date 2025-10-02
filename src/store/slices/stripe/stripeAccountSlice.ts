import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  StripeAccount,
  StripeAccountStatus,
  StripeAccountType,
  OnboardingType,
  CreateStripeAccountRequest,
  CreateOnboardingLinkRequest,
  StripeAccountSetupState,
  AccountStateInfo,
} from '@/types';
import { stripeAccountService } from '@/lib/api/stripe';

export interface StripeAccountState {
  account: StripeAccount | null;
  status: StripeAccountStatus | null;
  accountState: AccountStateInfo | null;
  onboardingUrl: string | null;
  loading: boolean;
  error: string | null;
  lastChecked: string | null;
}

const initialState: StripeAccountState = {
  account: null,
  status: null,
  accountState: null,
  onboardingUrl: null,
  loading: false,
  error: null,
  lastChecked: null,
};

// Async Thunks

/**
 * Create a Stripe connected account
 */
export const createStripeAccount = createAsyncThunk(
  'stripeAccount/createAccount',
  async (data: CreateStripeAccountRequest, { rejectWithValue }) => {
    try {
      const response = await stripeAccountService.createAccount(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create Stripe account');
    }
  }
);

/**
 * Create onboarding link
 */
export const createOnboardingLink = createAsyncThunk(
  'stripeAccount/createOnboardingLink',
  async (data: CreateOnboardingLinkRequest, { rejectWithValue }) => {
    try {
      const response = await stripeAccountService.createOnboardingLink(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create onboarding link');
    }
  }
);

/**
 * Start onboarding with current URL
 */
export const startOnboarding = createAsyncThunk(
  'stripeAccount/startOnboarding',
  async (
    {
      returnPath = '/dashboard?onboarding=complete',
      refreshPath = '/dashboard?onboarding=refresh',
      type = OnboardingType.ACCOUNT_ONBOARDING,
    }: {
      returnPath?: string;
      refreshPath?: string;
      type?: OnboardingType;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await stripeAccountService.startOnboarding(returnPath, refreshPath, type);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start onboarding');
    }
  }
);

/**
 * Fetch account status
 */
export const fetchAccountStatus = createAsyncThunk(
  'stripeAccount/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await stripeAccountService.getAccountStatus();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch account status');
    }
  }
);

/**
 * Delete Stripe account
 */
export const deleteStripeAccount = createAsyncThunk(
  'stripeAccount/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await stripeAccountService.deleteAccount();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete Stripe account');
    }
  }
);

/**
 * Check if user can withdraw
 */
export const checkCanWithdraw = createAsyncThunk(
  'stripeAccount/checkCanWithdraw',
  async (_, { rejectWithValue }) => {
    try {
      const canWithdraw = await stripeAccountService.canWithdraw();
      return canWithdraw;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check withdrawal eligibility');
    }
  }
);

// Slice
const stripeAccountSlice = createSlice({
  name: 'stripeAccount',
  initialState,
  reducers: {
    clearStripeAccountError: (state) => {
      state.error = null;
    },
    clearOnboardingUrl: (state) => {
      state.onboardingUrl = null;
    },
    setAccountState: (state, action: PayloadAction<AccountStateInfo>) => {
      state.accountState = action.payload;
    },
    resetStripeAccount: (state) => {
      return initialState;
    },
    updateAccountStatus: (state, action: PayloadAction<StripeAccountStatus>) => {
      state.status = action.payload;
      if (action.payload) {
        state.accountState = stripeAccountService.getAccountState(action.payload);
      }
      state.lastChecked = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    // Create account
    builder
      .addCase(createStripeAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStripeAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload as StripeAccount;
      })
      .addCase(createStripeAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create onboarding link
    builder
      .addCase(createOnboardingLink.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOnboardingLink.fulfilled, (state, action) => {
        state.loading = false;
        state.onboardingUrl = action.payload.url;
      })
      .addCase(createOnboardingLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Start onboarding
    builder
      .addCase(startOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.onboardingUrl = action.payload.url;
      })
      .addCase(startOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch account status
    builder
      .addCase(fetchAccountStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
        state.accountState = stripeAccountService.getAccountState(action.payload);
        state.lastChecked = new Date().toISOString();
      })
      .addCase(fetchAccountStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete account
    builder
      .addCase(deleteStripeAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStripeAccount.fulfilled, (state) => {
        state.loading = false;
        state.account = null;
        state.status = null;
        state.accountState = null;
        state.onboardingUrl = null;
        state.lastChecked = null;
      })
      .addCase(deleteStripeAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Check can withdraw
    builder
      .addCase(checkCanWithdraw.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkCanWithdraw.fulfilled, (state, action) => {
        state.loading = false;
        if (state.accountState) {
          state.accountState.canWithdraw = action.payload;
        }
      })
      .addCase(checkCanWithdraw.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearStripeAccountError,
  clearOnboardingUrl,
  setAccountState,
  resetStripeAccount,
  updateAccountStatus,
} = stripeAccountSlice.actions;

export default stripeAccountSlice.reducer;
