import { api } from '../api/api-client';
import type { StripeCustomerSetup, ConnectedAccountSetup, PaymentMethod, CreatePaymentIntentDto, PaymentIntentResult } from '../types/payments';

export const PaymentMethodsService = {
  setupCustomer: () => api.post<StripeCustomerSetup>('/payment-methods/setup-customer'),
  createConnectedAccount: () => api.post<ConnectedAccountSetup>('/payment-methods/create-connected-account'),
  add: (paymentMethodId: string, setAsDefault?: boolean) =>
    api.post<PaymentMethod>('/payment-methods/add', { paymentMethodId, setAsDefault }),
  list: () => api.get<PaymentMethod[]>('/payment-methods'),
  remove: (paymentMethodId: string) => api.delete<{ message: string }>(`/payment-methods/${paymentMethodId}`),
  setDefault: (paymentMethodId: string) => api.put<{ message: string }>(`/payment-methods/${paymentMethodId}/default`),
  createPaymentIntent: (body: CreatePaymentIntentDto) => api.post<PaymentIntentResult>('/payment-methods/create-payment-intent', body),
  debugStripe: () => api.get<{ userId: string; hasStripeCustomer: boolean; savedPaymentMethodsCount: number }>(
    '/payment-methods/debug-stripe'
  ),
};

export const PaymentsService = {
  listByUser: () => api.get<any>(`/payments/user`),
  getById: (id: string) => api.get<any>(`/payments/${id}`),
  debugAll: () => api.get<any>(`/payments/debug/all`),
};
