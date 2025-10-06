'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { Card, CardBody } from '../../../../../components/ui/Card';
import { Spinner } from '../../../../../components/ui/Feedback';
import Button from '../../../../../components/ui/Button';
import { RootState } from '../../../../../store';
import { fetchPaymentMethods, setSelectedPaymentMethod } from '../../../../../store/slices/payments';
import { AppDispatch } from '../../../../../store';

export default function SelectPaymentMethodPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { paymentMethods, loading, contractCreationFlow, defaultPaymentMethodId } = useSelector(
    (state: RootState) => state.payments
  );

  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('SelectPaymentMethodPage - Redux state:', {
      paymentMethods,
      loading,
      defaultPaymentMethodId,
      paymentMethodsLength: paymentMethods?.length,
      paymentMethodsType: typeof paymentMethods,
      isArray: Array.isArray(paymentMethods)
    });
  }, [paymentMethods, loading, defaultPaymentMethodId]);

  // Fetch payment methods on mount
  useEffect(() => {
    console.log('SelectPaymentMethodPage - Dispatching fetchPaymentMethods');
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  // Auto-select default payment method
  useEffect(() => {
    if (defaultPaymentMethodId) {
      setSelectedMethodId(defaultPaymentMethodId);
    } else if (paymentMethods.length > 0) {
      setSelectedMethodId(paymentMethods[0].id);
    }
  }, [defaultPaymentMethodId, paymentMethods]);

  // Redirect if no contract creation flow
  useEffect(() => {
    if (!loading && !contractCreationFlow) {
      router.push('/client/dashboard');
    }
  }, [contractCreationFlow, loading, router]);

  const handleAddNewCard = () => {
    router.push('/client/payment-methods/add');
  };

  const handleContinue = () => {
    if (selectedMethodId) {
      dispatch(setSelectedPaymentMethod(selectedMethodId));
      router.push('/client/payment-methods/process');
    }
  };

  const handleCancel = () => {
    if (contractCreationFlow?.returnUrl) {
      router.push(contractCreationFlow.returnUrl);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Select Payment Method</h1>
          <p className="text-secondary">
            Choose a payment method to complete your contract creation
          </p>
        </div>

        {/* No Payment Methods */}
        {(() => {
          console.log('Render check - paymentMethods:', paymentMethods, 'length:', paymentMethods?.length);
          return null;
        })()}
        {paymentMethods.length === 0 && (
          <Card variant="default" className="mb-6">
            <CardBody>
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary bg-opacity-10 mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  No Payment Methods Added
                </h3>
                <p className="text-secondary mb-6 max-w-md mx-auto">
                  You need to add a payment method before you can create a contract and make payments.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddNewCard}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Payment Method
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Payment Methods List */}
        {paymentMethods.length > 0 && (
          <>
            <Card variant="default" className="mb-6">
              <CardBody>
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Saved Payment Methods
                </h3>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={`
                        relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${
                          selectedMethodId === method.id
                            ? 'border-primary bg-primary bg-opacity-5'
                            : 'border-light hover:border-primary hover:border-opacity-50'
                        }
                      `}
                    >
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-12 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary capitalize">
                            {method.card.brand}
                          </span>
                          <span className="text-secondary">••••</span>
                          <span className="font-medium text-primary">
                            {method.card.last4}
                          </span>
                          {method.id === defaultPaymentMethodId && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-accent text-white rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-secondary mt-1">
                          Expires {method.card.expMonth}/{method.card.expYear}
                        </p>
                      </div>
                      {selectedMethodId === method.id && (
                        <div className="flex-shrink-0 ml-4">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-light">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleAddNewCard}
                    className="w-full"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add New Payment Method
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
                disabled={!selectedMethodId}
                className="flex-1"
              >
                Continue to Payment
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
