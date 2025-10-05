import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

// Types for client API
export interface UpdateClientProfileRequest {
  companyName: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  industry: string;
  logo?: string;
}

export interface CreateSetupIntentResponse {
  clientSecret: string;
  setupIntentId: string;
}

export interface SavePaymentMethodRequest {
  paymentMethodId: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: string;
}

export const clientApi = {
  /**
   * Update client profile information
   */
  updateProfile: async (data: UpdateClientProfileRequest) => {
    return apiClient.put(API_ENDPOINTS.CLIENT.UPDATE_PROFILE, data);
  },

  /**
   * Create a setup intent for adding a payment method
   */
  createSetupIntent: async () => {
    return apiClient.post(API_ENDPOINTS.PAYMENT_METHODS.CREATE_SETUP_INTENT);
  },

  /**
   * Save a payment method after Stripe confirmation
   */
  savePaymentMethod: async (data: SavePaymentMethodRequest) => {
    return apiClient.post(API_ENDPOINTS.PAYMENT_METHODS.SAVE, data);
  },

  /**
   * Get all payment methods for the client
   */
  getPaymentMethods: async () => {
    return apiClient.get(API_ENDPOINTS.PAYMENT_METHODS.LIST);
  },

  /**
   * Set a payment method as default
   */
  setDefaultPaymentMethod: async (paymentMethodId: string) => {
    return apiClient.put(API_ENDPOINTS.PAYMENT_METHODS.SET_DEFAULT(paymentMethodId));
  },

  /**
   * Delete a payment method
   */
  deletePaymentMethod: async (paymentMethodId: string) => {
    return apiClient.delete(API_ENDPOINTS.PAYMENT_METHODS.DELETE(paymentMethodId));
  },
};
