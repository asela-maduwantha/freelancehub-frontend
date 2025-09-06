import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { paymentsService } from '../api/payments.service';
import { adminService } from '../api/admin.service';
import {
  IPayment,
  IPaymentStats,
  IWallet,
  IEscrowPayment,
  IPaymentIntent,
  ICreatePaymentRequest,
  IPaymentConfirmation,
  IStripeConnectAccount,
  IWebhookEvent,
  IAutoReleaseSettings,
  IWithdrawalRequest,
  IRefundRequest,
  IDispute
} from '../types';

interface PaymentState {
  // Existing Data
  payments: IPayment[];
  stats: IPaymentStats | null;
  wallet: IWallet | null;
  escrowPayments: IEscrowPayment[];

  // New Stripe Connect Features
  stripeConnect: IStripeConnectAccount | null;
  onboardingUrl: string | null;
  onboardingStatus: 'idle' | 'loading' | 'success' | 'error';

  // Auto-Release Features
  autoReleaseSettings: IAutoReleaseSettings;
  autoReleaseTimer: number; // seconds remaining
  autoReleaseInterval: NodeJS.Timeout | null;

  // Webhook & Real-time Features
  webhooks: IWebhookEvent[];
  lastWebhookEvent: string | null;
  realTimeUpdates: boolean;

  // Withdrawal Features
  withdrawalHistory: IWithdrawalRequest[];
  currentBalance: number;

  // Admin Features
  disputedPayments: IDispute[];
  refundRequests: IRefundRequest[];

  // UI State
  isLoading: boolean;
  error: string | null;
  selectedPayment: IPayment | null;
  paymentIntent: IPaymentIntent | null;

  // Filters
  statusFilter: string;
  escrowStatusFilter: string;
  projectFilter: string;
  dateRangeFilter: { start: string; end: string } | null;

  // Actions
  // Existing actions
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

  // New Stripe Connect Actions
  setStripeConnect: (account: IStripeConnectAccount | null) => void;
  setOnboardingUrl: (url: string | null) => void;
  setOnboardingStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void;
  createStripeAccount: () => Promise<void>;
  checkStripeStatus: () => Promise<void>;

  // Auto-Release Actions
  setAutoReleaseSettings: (settings: IAutoReleaseSettings) => void;
  startAutoReleaseTimer: (paymentId: string, endTime: string) => void;
  stopAutoReleaseTimer: () => void;
  processAutoRelease: (paymentId: string) => Promise<void>;

  // Webhook Actions
  addWebhookEvent: (event: IWebhookEvent) => void;
  processWebhookEvent: (event: IWebhookEvent) => void;
  clearWebhookEvents: () => void;

  // Withdrawal Actions
  setWithdrawalHistory: (withdrawals: IWithdrawalRequest[]) => void;
  createWithdrawal: (request: Omit<IWithdrawalRequest, 'id' | 'status' | 'createdAt'>) => Promise<void>;

  // Admin Actions
  getDisputedPayments: () => Promise<void>;
  getRefundRequests: () => Promise<void>;
  resolveDispute: (paymentId: string, resolution: 'release' | 'refund') => Promise<void>;
  processRefund: (paymentId: string, approved: boolean) => Promise<void>;

  // Enhanced Payment Actions
  createPayment: (data: ICreatePaymentRequest) => Promise<IPaymentIntent>;
  confirmPayment: (paymentId: string, paymentIntentId: string) => Promise<void>;
  releasePayment: (paymentId: string) => Promise<void>;
  requestRefund: (paymentId: string, reason: string) => Promise<void>;

  // Filter Actions
  setEscrowStatusFilter: (filter: string) => void;
  setDateRangeFilter: (range: { start: string; end: string } | null) => void;
  resetFilters: () => void;

  // Computed
  filteredPayments: IPayment[];
  totalSpent: number;
  pendingAmount: number;
  escrowHeldAmount: number;
  upcomingAutoReleases: IPayment[];
}

export const usePaymentStore = create<PaymentState>()(
  devtools(
    (set, get) => ({
      // Initial state
      payments: [],
      stats: null,
      wallet: null,
      escrowPayments: [],
      stripeConnect: null,
      onboardingUrl: null,
      onboardingStatus: 'idle',
      autoReleaseSettings: {
        enabled: true,
        defaultDays: 7,
        minDays: 0.001,
        maxDays: 365
      },
      autoReleaseTimer: 0,
      autoReleaseInterval: null,
      webhooks: [],
      lastWebhookEvent: null,
      realTimeUpdates: true,
      withdrawalHistory: [],
      currentBalance: 0,
      disputedPayments: [],
      refundRequests: [],
      isLoading: false,
      error: null,
      selectedPayment: null,
      paymentIntent: null,
      statusFilter: 'all',
      escrowStatusFilter: 'all',
      projectFilter: 'all',
      dateRangeFilter: null,

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

      // New Stripe Connect Actions
      setStripeConnect: (stripeConnect) => set({ stripeConnect }),
      setOnboardingUrl: (onboardingUrl) => set({ onboardingUrl }),
      setOnboardingStatus: (onboardingStatus) => set({ onboardingStatus }),

      createStripeAccount: async () => {
        try {
          set({ isLoading: true, error: null });
          const data = await paymentsService.createStripeAccount();
          set({
            stripeConnect: data,
            onboardingUrl: data.onboardingUrl,
            onboardingStatus: 'success'
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', onboardingStatus: 'error' });
        } finally {
          set({ isLoading: false });
        }
      },

      checkStripeStatus: async () => {
        const { stripeConnect } = get();
        if (!stripeConnect?.accountId) return;

        try {
          const data = await paymentsService.getStripeAccountStatus(stripeConnect.accountId);
          set({ stripeConnect: { ...stripeConnect, ...data } });
        } catch (error) {
          console.error('Failed to check Stripe status:', error);
        }
      },

      // Auto-Release Actions
      setAutoReleaseSettings: (autoReleaseSettings) => set({ autoReleaseSettings }),

      startAutoReleaseTimer: (paymentId: string, endTime: string) => {
        const end = new Date(endTime).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((end - now) / 1000));

        set({ autoReleaseTimer: remaining });

        const interval = setInterval(() => {
          const current = get().autoReleaseTimer;
          if (current <= 1) {
            get().processAutoRelease(paymentId);
            clearInterval(interval);
            set({ autoReleaseTimer: 0, autoReleaseInterval: null });
          } else {
            set({ autoReleaseTimer: current - 1 });
          }
        }, 1000);

        set({ autoReleaseInterval: interval });
      },

      stopAutoReleaseTimer: () => {
        const { autoReleaseInterval } = get();
        if (autoReleaseInterval) {
          clearInterval(autoReleaseInterval);
          set({ autoReleaseTimer: 0, autoReleaseInterval: null });
        }
      },

      processAutoRelease: async (paymentId: string) => {
        try {
          await paymentsService.releaseEscrowPayment(paymentId);
          // Update local state
          const payments = get().payments.map(p =>
            p.id === paymentId ? { ...p, escrowStatus: 'released' as const } : p
          );
          set({ payments });
        } catch (error) {
          console.error('Auto-release failed:', error);
        }
      },

      // Webhook Actions
      addWebhookEvent: (event) => set((state) => ({
        webhooks: [event, ...state.webhooks.slice(0, 49)], // Keep last 50 events
        lastWebhookEvent: event.type
      })),

      processWebhookEvent: (event) => {
        const { payments } = get();
        // Update payment status based on webhook
        const updatedPayments = payments.map(payment => {
          if (payment.stripePaymentIntentId === event.data.paymentIntentId) {
            return {
              ...payment,
              status: event.data.status,
              escrowStatus: event.data.escrowStatus
            };
          }
          return payment;
        });
        set({ payments: updatedPayments });
      },

      clearWebhookEvents: () => set({ webhooks: [], lastWebhookEvent: null }),

      // Withdrawal Actions
      setWithdrawalHistory: (withdrawalHistory) => set({ withdrawalHistory }),

      createWithdrawal: async (request) => {
        try {
          set({ isLoading: true, error: null });
          const data = await paymentsService.createWithdrawal(request);
          set((state) => ({
            withdrawalHistory: [data, ...state.withdrawalHistory]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create withdrawal' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Admin Actions
      getDisputedPayments: async () => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement admin payment disputes endpoint
          console.warn('Admin payment disputes endpoint not implemented');
          set({ disputedPayments: [] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch disputed payments' });
        } finally {
          set({ isLoading: false });
        }
      },

      getRefundRequests: async () => {
        try {
          set({ isLoading: true, error: null });
          const refunds = await paymentsService.getRefundHistory();
          set({ refundRequests: refunds });
        } catch (error) {
          console.warn('Refund history endpoint not available');
          set({ refundRequests: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      resolveDispute: async (paymentId: string, resolution: 'release' | 'refund') => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement admin dispute resolution endpoint
          console.warn('Admin dispute resolution endpoint not implemented');
          // For now, just remove from local state
          set((state) => ({
            disputedPayments: state.disputedPayments.filter(d => d.paymentId !== paymentId)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to resolve dispute' });
        } finally {
          set({ isLoading: false });
        }
      },

      processRefund: async (paymentId: string, approved: boolean) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement admin refund processing endpoint
          console.warn('Admin refund processing endpoint not implemented');
          // For now, just remove from local state
          set((state) => ({
            refundRequests: state.refundRequests.filter(r => r.paymentId !== paymentId)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to process refund' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Enhanced Payment Actions
      createPayment: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const result = await paymentsService.createPayment(data);
          set({ paymentIntent: result });
          return result;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create payment' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      confirmPayment: async (paymentId, paymentIntentId) => {
        try {
          set({ isLoading: true, error: null });
          await paymentsService.confirmPayment(paymentId, { paymentIntentId });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to confirm payment' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      releasePayment: async (paymentId) => {
        try {
          set({ isLoading: true, error: null });
          await paymentsService.releaseEscrowPayment(paymentId);
          // Update local payment status
          const payments = get().payments.map(p =>
            p.id === paymentId ? { ...p, escrowStatus: 'released' as const } : p
          );
          set({ payments });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to release payment' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      requestRefund: async (paymentId, reason) => {
        try {
          set({ isLoading: true, error: null });
          await paymentsService.requestRefund(paymentId, reason);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to request refund' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Filter Actions
      setEscrowStatusFilter: (escrowStatusFilter) => set({ escrowStatusFilter }),
      setDateRangeFilter: (dateRangeFilter) => set({ dateRangeFilter }),

      resetFilters: () => set({
        statusFilter: 'all',
        escrowStatusFilter: 'all',
        projectFilter: 'all',
        dateRangeFilter: null
      }),

      // Computed
      get filteredPayments() {
        const { payments, statusFilter, escrowStatusFilter, projectFilter, dateRangeFilter } = get();
        let filtered = payments;

        if (statusFilter !== 'all') {
          filtered = filtered.filter(payment => payment.status === statusFilter);
        }

        if (escrowStatusFilter !== 'all') {
          filtered = filtered.filter(payment => payment.escrowStatus === escrowStatusFilter);
        }

        if (projectFilter !== 'all') {
          filtered = filtered.filter(payment => payment.projectId === projectFilter);
        }

        if (dateRangeFilter) {
          filtered = filtered.filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            const start = new Date(dateRangeFilter.start);
            const end = new Date(dateRangeFilter.end);
            return paymentDate >= start && paymentDate <= end;
          });
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

      get escrowHeldAmount() {
        const { stats } = get();
        return stats?.heldInEscrow || 0;
      },

      get upcomingAutoReleases() {
        const { payments } = get();
        const now = new Date();
        return payments.filter(payment =>
          payment.escrowStatus === 'held' &&
          payment.autoReleaseDate &&
          new Date(payment.autoReleaseDate) > now
        );
      },
    }),
    {
      name: 'payment-store',
    }
  )
);
