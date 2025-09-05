import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  IPayment,
  IPaymentStats,
  IWallet,
  IEscrowPayment,
  IPaymentIntent,
  ICreatePaymentRequest,
  IPaymentConfirmation
} from '../types';

interface PaymentState {
  // Data
  payments: IPayment[];
  stats: IPaymentStats | null;
  wallet: IWallet | null;
  escrowPayments: IEscrowPayment[];

  // UI State
  isLoading: boolean;
  error: string | null;
  selectedPayment: IPayment | null;
  paymentIntent: IPaymentIntent | null;

  // Filters
  statusFilter: string;
  projectFilter: string;

  // Actions
  setPayments: (payments: IPayment[]) => void;
  setStats: (stats: IPaymentStats | null) => void;
  setWallet: (wallet: IWallet) => void;
  setEscrowPayments: (payments: IEscrowPayment[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedPayment: (payment: IPayment | null) => void;
  setPaymentIntent: (intent: IPaymentIntent | null) => void;
  setStatusFilter: (filter: string) => void;
  setProjectFilter: (filter: string) => void;

  // Computed
  filteredPayments: IPayment[];
  totalSpent: number;
  pendingAmount: number;
  availableBalance: number;
}

export const usePaymentStore = create<PaymentState>()(
  devtools(
    (set, get) => ({
      // Initial state
      payments: [],
      stats: null,
      wallet: null,
      escrowPayments: [],
      isLoading: false,
      error: null,
      selectedPayment: null,
      paymentIntent: null,
      statusFilter: 'all',
      projectFilter: 'all',

      // Actions
      setPayments: (payments) => set({ payments }),
      setStats: (stats) => set({ stats }),
      setWallet: (wallet) => set({ wallet }),
      setEscrowPayments: (escrowPayments) => set({ escrowPayments }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSelectedPayment: (selectedPayment) => set({ selectedPayment }),
      setPaymentIntent: (paymentIntent) => set({ paymentIntent }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setProjectFilter: (projectFilter) => set({ projectFilter }),

      // Computed
      get filteredPayments() {
        const { payments, statusFilter, projectFilter } = get();
        let filtered = payments;

        if (statusFilter !== 'all') {
          filtered = filtered.filter(payment => payment.status === statusFilter);
        }

        if (projectFilter !== 'all') {
          filtered = filtered.filter(payment => payment.projectId === projectFilter);
        }

        return filtered;
      },

      get totalSpent() {
        const { stats } = get();
        return stats?.totalSpent || 0;
      },

      get pendingAmount() {
        const { stats } = get();
        return stats?.pendingPayments || 0;
      },

      get availableBalance() {
        const { wallet } = get();
        return wallet?.balance || 0;
      },
    }),
    {
      name: 'payment-store',
    }
  )
);
