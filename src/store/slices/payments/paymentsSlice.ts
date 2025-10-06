import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../../lib/api/client';

// Type definitions
export interface PaymentMethod {
  id: string;
  stripePaymentMethodId: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId?: string | null;
}

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
export const fetchPaymentMethods = createAsyncThunk<
  PaymentMethodsResponse,
  void,
  { rejectValue: string }
>(
  'payments/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchPaymentMethods thunk - START');
      
      // Call API directly using apiClient
      const data = await apiClient.get('/payment-methods');
      
      console.log('fetchPaymentMethods thunk - received data:', data);
      console.log('fetchPaymentMethods thunk - data type:', typeof data);
      console.log('fetchPaymentMethods thunk - data keys:', data ? Object.keys(data) : 'null');
      
      // Validate the response structure
      if (!data || typeof data !== 'object') {
        console.error('Invalid response structure - not an object:', data);
        return rejectWithValue('Invalid response from server');
      }
      
      // Check if paymentMethods exists and is an array
      if (!Array.isArray(data.paymentMethods)) {
        console.error('paymentMethods is not an array:', data.paymentMethods);
        // Return empty structure rather than failing
        return {
          paymentMethods: [],
          defaultPaymentMethodId: null
        };
      }
      
      console.log('fetchPaymentMethods thunk - returning valid data:', {
        paymentMethodsCount: data.paymentMethods.length,
        defaultPaymentMethodId: data.defaultPaymentMethodId
      });
      
      return {
        paymentMethods: data.paymentMethods,
        defaultPaymentMethodId: data.defaultPaymentMethodId || null
      };
      
    } catch (error: any) {
      console.error('fetchPaymentMethods thunk - ERROR:', error);
      console.error('fetchPaymentMethods thunk - error type:', typeof error);
      console.error('fetchPaymentMethods thunk - error message:', error?.message);
      console.error('fetchPaymentMethods thunk - error stack:', error?.stack);
      
      const errorMessage = error?.message || error?.toString() || 'Failed to fetch payment methods';
      return rejectWithValue(errorMessage);
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
        console.log('Reducer - PENDING');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        console.log('Reducer - FULFILLED');
        console.log('Reducer - action.payload:', action.payload);
        console.log('Reducer - action.payload type:', typeof action.payload);
        
        state.loading = false;
        
        if (action.payload && typeof action.payload === 'object') {
          const paymentMethods = action.payload.paymentMethods;
          const defaultId = action.payload.defaultPaymentMethodId;
          
          console.log('Reducer - paymentMethods:', paymentMethods);
          console.log('Reducer - paymentMethods is array:', Array.isArray(paymentMethods));
          console.log('Reducer - defaultId:', defaultId);
          
          state.paymentMethods = Array.isArray(paymentMethods) ? paymentMethods : [];
          state.defaultPaymentMethodId = defaultId || null;
          
          console.log('Reducer - STATE UPDATED');
          console.log('Reducer - state.paymentMethods.length:', state.paymentMethods.length);
        } else {
          console.error('Reducer - Invalid payload structure:', action.payload);
          state.paymentMethods = [];
          state.defaultPaymentMethodId = null;
        }
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        console.log('Reducer - REJECTED');
        console.log('Reducer - action.payload:', action.payload);
        console.log('Reducer - action.error:', action.error);
        
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch payment methods';
        state.paymentMethods = [];
        state.defaultPaymentMethodId = null;
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