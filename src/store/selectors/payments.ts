import { RootState } from '../index';

// Payment selectors
export const selectPaymentMethods = (state: RootState) => state.payments.paymentMethods;
export const selectDefaultPaymentMethodId = (state: RootState) => state.payments.defaultPaymentMethodId;
export const selectDefaultPaymentMethod = (state: RootState) => {
  const methods = state.payments.paymentMethods;
  const defaultId = state.payments.defaultPaymentMethodId;
  return methods.find(method => method.id === defaultId) || null;
};
export const selectPaymentLoading = (state: RootState) => state.payments.loading;
export const selectPaymentError = (state: RootState) => state.payments.error;