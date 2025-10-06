'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api/client';
import { contractService, PayContractRequest } from '@/lib/api/contracts';
import { loadStripe } from '@stripe/stripe-js';
import { formatCurrency } from '@/lib/utils/formatting';
import {
  CreditCard,
  Shield,
  DollarSign,
  FileText,
  X
} from 'lucide-react';

interface PaymentMethod {
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

interface ContractPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: {
    _id: string;
    title: string;
    totalAmount: number;
    currency: string;
    freelancerId: {
      fullName: string;
    };
  };
  onPaymentSuccess: (payment: any) => void;
  onPaymentError: (error: string) => void;
}

const ContractPaymentModal: React.FC<ContractPaymentModalProps> = ({
  isOpen,
  onClose,
  contract,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    setIsLoadingMethods(true);
    setError(null);
    
    try {
      console.log('[ContractPaymentModal] Fetching payment methods...');
      
      // Call API directly to avoid any service layer issues
      const data = await apiClient.get('/payment-methods');
      
      console.log('[ContractPaymentModal] Response received:', data);
      console.log('[ContractPaymentModal] Response type:', typeof data);
      
      if (!isMountedRef.current) {
        console.log('[ContractPaymentModal] Component unmounted, skipping state update');
        return;
      }
      
      if (!data || typeof data !== 'object') {
        console.error('[ContractPaymentModal] Invalid response:', data);
        setError('Failed to load payment methods: Invalid response');
        return;
      }
      
      if (!Array.isArray(data.paymentMethods)) {
        console.error('[ContractPaymentModal] paymentMethods is not an array:', data.paymentMethods);
        setPaymentMethods([]);
        return;
      }
      
      console.log('[ContractPaymentModal] Setting payment methods:', data.paymentMethods.length);
      setPaymentMethods(data.paymentMethods);
      
      // Auto-select default or first payment method
      const defaultMethod = data.paymentMethods.find((method: PaymentMethod) => method.isDefault);
      if (defaultMethod) {
        console.log('[ContractPaymentModal] Auto-selecting default method:', defaultMethod.id);
        setSelectedPaymentMethodId(defaultMethod.id);
      } else if (data.paymentMethods.length > 0) {
        console.log('[ContractPaymentModal] Auto-selecting first method:', data.paymentMethods[0].id);
        setSelectedPaymentMethodId(data.paymentMethods[0].id);
      }
      
    } catch (err: any) {
      console.error('[ContractPaymentModal] Error fetching payment methods:', err);
      if (isMountedRef.current) {
        setError(`Failed to load payment methods: ${err?.message || 'Unknown error'}`);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingMethods(false);
      }
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethodId) {
      setError('Please select a payment method');
      return;
    }

    setIsProcessingPayment(true);
    setError(null);

    try {
      const payRequest: PayContractRequest = {
        paymentMethodId: selectedPaymentMethodId
      };

      const response = await contractService.payContract(contract._id, payRequest);

      if (!response.success) {
        throw new Error(response.message || 'Payment initiation failed');
      }

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        response.data.clientSecret,
        {
          payment_method: selectedPaymentMethodId
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment confirmation failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess({
          id: response.data.paymentId,
          status: 'succeeded',
          paymentIntentId: paymentIntent.id
        });
        onClose();
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        throw new Error('Payment requires additional authentication. Please try a different payment method.');
      } else {
        throw new Error('Payment could not be completed');
      }

    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during payment';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleClose = () => {
    if (!isProcessingPayment) {
      setError(null);
      setSelectedPaymentMethodId('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Complete Contract Payment</h2>
            <button
              onClick={handleClose}
              disabled={isProcessingPayment}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Contract Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{contract.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Freelancer: {contract.freelancerId.fullName}
                  </p>
                  <p className="text-sm font-medium text-green-600 mt-2">
                    Amount: {formatCurrency(contract.totalAmount, contract.currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Select Payment Method</h4>

              {isLoadingMethods ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No payment methods available</p>
                  <p className="text-sm text-gray-500">
                    Please add a payment method in your account settings first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`cursor-pointer transition-all border-2 rounded-lg p-4 ${
                        selectedPaymentMethodId === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPaymentMethodId(method.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 capitalize">
                              {method.card.brand}
                            </span>
                            <span className="text-gray-500">••••</span>
                            <span className="font-medium text-gray-900">{method.card.last4}</span>
                            {method.isDefault && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Expires {method.card.expMonth}/{method.card.expYear}
                          </p>
                        </div>
                        {selectedPaymentMethodId === method.id && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessingPayment}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={!selectedPaymentMethodId || isProcessingPayment || paymentMethods.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4" />
                    Pay {formatCurrency(contract.totalAmount, contract.currency)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPaymentModal;