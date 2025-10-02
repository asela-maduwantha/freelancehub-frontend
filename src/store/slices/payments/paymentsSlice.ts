import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PaymentMethod, PaymentMethodsResponse } from '../../../lib/api/payments';

export interface ContractCreationFlow {
  jobId: string;
  proposalId: string;
  contractData: any;
  selectedPaymentMethodId: string | null;
  returnUrl: string;
}

export interface PaymentProcessing {
  status: 'idle' | 'processing' | 'success' | 'failed';
  message: string | null;
  contractId: string | null;
}

export interface PaymentState {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  defaultPaymentMethodId: string | null;
  contractCreationFlow: ContractCreationFlow | null;
  paymentProcessing: PaymentProcessing;
}

// Initial state
const initialState: PaymentState = {
  paymentMethods: [],
  loading: false,
  error: null,
  defaultPaymentMethodId: null,
  contractCreationFlow: null,
  paymentProcessing: {
    status: 'idle',
    message: null,
    contractId: null,
  },
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
    // Contract creation flow actions
    setContractCreationFlow: (state, action: PayloadAction<ContractCreationFlow>) => {
      state.contractCreationFlow = action.payload;
    },
    clearContractCreationFlow: (state) => {
      state.contractCreationFlow = null;
    },
    setSelectedPaymentMethod: (state, action: PayloadAction<string>) => {
      if (state.contractCreationFlow) {
        state.contractCreationFlow.selectedPaymentMethodId = action.payload;
      }
    },
    // Payment processing actions
    setPaymentProcessing: (state, action: PayloadAction<{ status: PaymentProcessing['status']; message?: string; contractId?: string }>) => {
      state.paymentProcessing.status = action.payload.status;
      state.paymentProcessing.message = action.payload.message || null;
      state.paymentProcessing.contractId = action.payload.contractId || null;
    },
    resetPaymentProcessing: (state) => {
      state.paymentProcessing = {
        status: 'idle',
        message: null,
        contractId: null,
      };
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
  setContractCreationFlow,
  clearContractCreationFlow,
  setSelectedPaymentMethod,
  setPaymentProcessing,
  resetPaymentProcessing,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;