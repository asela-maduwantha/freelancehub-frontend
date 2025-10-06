import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Withdrawal,
  WithdrawalStatus,
  WithdrawalMethod,
  CreateWithdrawalRequest,
  ProcessWithdrawalRequest,
  FailWithdrawalRequest,
  GetWithdrawalsQuery,
} from '@/types';
import { withdrawalService } from '@/lib/api/withdrawals';

export interface WithdrawalsState {
  withdrawals: Withdrawal[];
  currentWithdrawal: Withdrawal | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  filters: GetWithdrawalsQuery;
}

const initialState: WithdrawalsState = {
  withdrawals: [],
  currentWithdrawal: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 20,
    sortBy: 'requestedAt',
    sortOrder: 'desc',
  },
};

// Async Thunks

/**
 * Fetch withdrawals with optional filters
 */
export const fetchWithdrawals = createAsyncThunk(
  'withdrawals/fetchWithdrawals',
  async (query: GetWithdrawalsQuery | undefined, { rejectWithValue }) => {
    try {
      const response = await withdrawalService.getWithdrawals(query);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdrawals');
    }
  }
);

/**
 * Fetch a single withdrawal by ID
 */
export const fetchWithdrawalById = createAsyncThunk(
  'withdrawals/fetchWithdrawalById',
  async (withdrawalId: string, { rejectWithValue }) => {
    try {
      const response = await withdrawalService.getWithdrawalById(withdrawalId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdrawal');
    }
  }
);

/**
 * Create a new withdrawal request
 */
export const createWithdrawal = createAsyncThunk(
  'withdrawals/createWithdrawal',
  async (data: CreateWithdrawalRequest, { rejectWithValue }) => {
    try {
      const response = await withdrawalService.createWithdrawal(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create withdrawal');
    }
  }
);

/**
 * Process a pending withdrawal (Admin only)
 */
export const processWithdrawal = createAsyncThunk(
  'withdrawals/processWithdrawal',
  async (
    { withdrawalId, data }: { withdrawalId: string; data?: ProcessWithdrawalRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await withdrawalService.processWithdrawal(withdrawalId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process withdrawal');
    }
  }
);

/**
 * Complete a withdrawal (Admin only)
 */
export const completeWithdrawal = createAsyncThunk(
  'withdrawals/completeWithdrawal',
  async (withdrawalId: string, { rejectWithValue }) => {
    try {
      const response = await withdrawalService.completeWithdrawal(withdrawalId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete withdrawal');
    }
  }
);

/**
 * Fail a withdrawal (Admin only)
 */
export const failWithdrawal = createAsyncThunk(
  'withdrawals/failWithdrawal',
  async (
    { withdrawalId, data }: { withdrawalId: string; data: FailWithdrawalRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await withdrawalService.failWithdrawal(withdrawalId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fail withdrawal');
    }
  }
);

/**
 * Fetch pending withdrawals (Admin)
 */
export const fetchPendingWithdrawals = createAsyncThunk(
  'withdrawals/fetchPendingWithdrawals',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await withdrawalService.getPendingWithdrawals(page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending withdrawals');
    }
  }
);

// Slice
const withdrawalsSlice = createSlice({
  name: 'withdrawals',
  initialState,
  reducers: {
    clearWithdrawalError: (state) => {
      state.error = null;
    },
    setCurrentWithdrawal: (state, action: PayloadAction<Withdrawal | null>) => {
      state.currentWithdrawal = action.payload;
    },
    updateWithdrawalFilters: (state, action: PayloadAction<Partial<GetWithdrawalsQuery>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetWithdrawalFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateWithdrawalInList: (state, action: PayloadAction<Withdrawal>) => {
      const index = state.withdrawals.findIndex((w) => w._id === action.payload._id);
      if (index !== -1) {
        state.withdrawals[index] = action.payload;
      }
    },
    removeWithdrawalFromList: (state, action: PayloadAction<string>) => {
      state.withdrawals = state.withdrawals.filter((w) => w._id !== action.payload);
    },
    clearWithdrawals: (state) => {
      state.withdrawals = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch withdrawals
    builder
      .addCase(fetchWithdrawals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawals = action.payload.withdrawals as Withdrawal[];
        const paginationData = action.payload.pagination;
        state.pagination = paginationData ? {
          ...paginationData,
          hasMore: paginationData.page < paginationData.totalPages,
        } : null;
      })
      .addCase(fetchWithdrawals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch withdrawal by ID
    builder
      .addCase(fetchWithdrawalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWithdrawalById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWithdrawal = action.payload as Withdrawal;
      })
      .addCase(fetchWithdrawalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create withdrawal
    builder
      .addCase(createWithdrawal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWithdrawal.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawals.unshift(action.payload as Withdrawal);
      })
      .addCase(createWithdrawal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Process withdrawal
    builder
      .addCase(processWithdrawal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processWithdrawal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.withdrawals.findIndex((w) => w._id === action.payload._id);
        if (index !== -1) {
          state.withdrawals[index] = action.payload as Withdrawal;
        }
        if (state.currentWithdrawal?._id === action.payload._id) {
          state.currentWithdrawal = action.payload as Withdrawal;
        }
      })
      .addCase(processWithdrawal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Complete withdrawal
    builder
      .addCase(completeWithdrawal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeWithdrawal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.withdrawals.findIndex((w) => w._id === action.payload._id);
        if (index !== -1) {
          state.withdrawals[index] = action.payload as Withdrawal;
        }
        if (state.currentWithdrawal?._id === action.payload._id) {
          state.currentWithdrawal = action.payload as Withdrawal;
        }
      })
      .addCase(completeWithdrawal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fail withdrawal
    builder
      .addCase(failWithdrawal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(failWithdrawal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.withdrawals.findIndex((w) => w._id === action.payload._id);
        if (index !== -1) {
          state.withdrawals[index] = action.payload as Withdrawal;
        }
        if (state.currentWithdrawal?._id === action.payload._id) {
          state.currentWithdrawal = action.payload as Withdrawal;
        }
      })
      .addCase(failWithdrawal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch pending withdrawals
    builder
      .addCase(fetchPendingWithdrawals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingWithdrawals.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawals = action.payload.withdrawals as Withdrawal[];
        const paginationData = action.payload.pagination;
        state.pagination = paginationData ? {
          ...paginationData,
          hasMore: paginationData.page < paginationData.totalPages,
        } : null;
      })
      .addCase(fetchPendingWithdrawals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearWithdrawalError,
  setCurrentWithdrawal,
  updateWithdrawalFilters,
  resetWithdrawalFilters,
  updateWithdrawalInList,
  removeWithdrawalFromList,
  clearWithdrawals,
} = withdrawalsSlice.actions;

// Selectors
export const selectAllWithdrawals = (state: { withdrawals: WithdrawalsState }) => state.withdrawals.withdrawals;
export const selectWithdrawalById = (state: { withdrawals: WithdrawalsState }, id: string) =>
  state.withdrawals.withdrawals.find((w) => w._id === id || w.id === id);
export const selectWithdrawalsLoading = (state: { withdrawals: WithdrawalsState }) => state.withdrawals.loading;
export const selectWithdrawalsError = (state: { withdrawals: WithdrawalsState }) => state.withdrawals.error;
export const selectWithdrawalsPagination = (state: { withdrawals: WithdrawalsState }) => state.withdrawals.pagination;
export const selectCurrentWithdrawal = (state: { withdrawals: WithdrawalsState }) => state.withdrawals.currentWithdrawal;
export const selectWithdrawalFilters = (state: { withdrawals: WithdrawalsState }) => state.withdrawals.filters;

export default withdrawalsSlice.reducer;
