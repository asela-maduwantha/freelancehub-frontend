import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PaymentMethod, PaymentMethodsResponse } from '../../../lib/api/payments';

export interface PaymentState {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  defaultPaymentMethodId: string | null;
}

// Initial state
const initialState: PaymentState = {
  paymentMethods: [],
  loading: false,
  error: null,
  defaultPaymentMethodId: null,
};

// Async thunks
export const fetchPaymentMethods = createAsyncThunk(
  'payments/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const { paymentService } = await import('../../../lib/api/payments');
      const response = await paymentService.getPaymentMethods();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }
);

// Slice
const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    setDefaultPaymentMethod: (state, action: PayloadAction<string>) => {
      state.defaultPaymentMethodId = action.payload;
    },
    addPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethods.push(action.payload);
    },
    removePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethods = state.paymentMethods.filter(
        method => method.id !== action.payload
      );
    },
    updatePaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      const index = state.paymentMethods.findIndex(
        method => method.id === action.payload.id
      );
      if (index !== -1) {
        state.paymentMethods[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action: PayloadAction<PaymentMethodsResponse>) => {
        state.loading = false;
        state.paymentMethods = action.payload.paymentMethods;
        state.defaultPaymentMethodId = action.payload.defaultPaymentMethodId || null;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearPaymentError,
  setDefaultPaymentMethod,
  addPaymentMethod,
  removePaymentMethod,
  updatePaymentMethod,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;