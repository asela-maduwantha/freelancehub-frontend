'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, STRIPE_CONFIG } from '@/lib/stripe';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { StripePaymentForm } from '@/components/features/payments/StripePaymentForm';
import { PaymentBreakdown } from '@/components/features/payments/PaymentBreakdown';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';
import { contractService, ContractResponse } from '@/lib/api/contracts';
import Button from '@/components/ui/Button';
import { ArrowLeft, FileText, CreditCard, CheckCircle, ChevronDown, ChevronUp, Shield, Lock, Award, DollarSign, Clock, HelpCircle, AlertCircle, X, Users, Star, Loader } from 'lucide-react';

const ContractPaymentPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const { paymentMethods, isLoading: methodsLoading } = usePaymentMethods();
  const [contract, setContract] = useState<ContractResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; actionText?: string; actionHandler?: () => void } | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  
  // New state for enhanced payment experience
  const [currentStep, setCurrentStep] = useState<'review' | 'payment' | 'processing'>('review');
  const [contractExpanded, setContractExpanded] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showPromoSection, setShowPromoSection] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'saved' | 'new'>('saved');
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  // Fetch contract from API
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch contract data from backend
        const contractData = await contractService.getContract(contractId);
        
        // Verify contract is in a payable state
        if (contractData.status === 'completed' || contractData.status === 'cancelled') {
          setError({ message: 'This contract is no longer available for payment' });
          return;
        }
        
        setContract(contractData);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err.message || 'Failed to load contract details';
        setError({ message: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  const handlePaymentSuccess = (paymentId: string) => {
    // Redirect to success page with backend payment ID for verification
    // Success page will poll backend to verify webhook has completed
    router.push(`/client/payments/success?payment_id=${paymentId}&contract_id=${contractId}`);
  };

  const handlePaymentError = (error: string) => {
    let userFriendlyMessage = 'An unexpected error occurred. Please try again.';
    let actionText = 'Try Again';
    let actionHandler = () => setError(null);
    
    // Map technical errors to user-friendly messages with recovery actions
    if (error.includes('card_declined')) {
      userFriendlyMessage = 'Your card was declined. Please check with your bank or try a different payment method.';
      actionText = 'Try Different Card';
      actionHandler = () => {
        setError(null);
        setSelectedMethod(null);
      };
    } else if (error.includes('insufficient_funds')) {
      userFriendlyMessage = 'Insufficient funds on your card. Please try a different payment method or contact your bank.';
      actionText = 'Try Different Card';
      actionHandler = () => {
        setError(null);
        setSelectedMethod(null);
      };
    } else if (error.includes('expired_card')) {
      userFriendlyMessage = 'Your card has expired. Please update your payment information.';
      actionText = 'Update Card';
      actionHandler = () => {
        setError(null);
        setSelectedMethod(null);
      };
    } else if (error.includes('incorrect_cvc')) {
      userFriendlyMessage = 'The security code (CVC) is incorrect. Please check and try again.';
      actionText = 'Try Again';
      actionHandler = () => setError(null);
    } else if (error.includes('processing_error')) {
      userFriendlyMessage = 'There was an issue processing your payment. Please try again in a few moments.';
      actionText = 'Retry Payment';
      actionHandler = () => setError(null);
    } else if (error.includes('network')) {
      userFriendlyMessage = 'Network error. Please check your connection and try again.';
      actionText = 'Retry';
      actionHandler = () => setError(null);
    }
    
    setError({ message: userFriendlyMessage, actionText, actionHandler });
    setCurrentStep('payment'); // Reset to payment step on error
    setProcessingPayment(false);
  };

  const handleCancel = () => {
    router.push(`/client/contracts/${contractId}`);
  };

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!contract || !termsAgreed) return;

    setProcessingPayment(true);
    setCurrentStep('processing');

    try {
      // Here you would integrate with your Stripe payment processing
      // For now, we'll simulate the payment process
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

      // On success, redirect to success page
      router.push(`/client/payments/success?payment_id=simulated&contract_id=${contractId}`);
    } catch (error) {
      handlePaymentError('Payment processing failed');
    } finally {
      setProcessingPayment(false);
      setShowConfirmationModal(false);
    }
  };

  // Payment progress steps component
  const PaymentProgressSteps = () => {
    const steps = [
      { id: 'review', label: 'Review Contract', icon: FileText },
      { id: 'payment', label: 'Enter Payment', icon: CreditCard },
      { id: 'processing', label: 'Processing', icon: CheckCircle }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Confirmation Modal Component
  const ConfirmationModal = () => {
    if (!showConfirmationModal || !contract) return null;

    const finalAmount = contract ? ((contract.totalAmount / 100) + ((contract.totalAmount * contract.platformFeePercentage) / 10000) - promoDiscount) : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Payment</h3>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Contract Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Contract Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Project:</span> {contract?.title || 'N/A'}</p>
                  <p><span className="font-medium">Freelancer:</span> {contract?.freelancerId?.fullName || 'N/A'}</p>
                  <p><span className="font-medium">Amount:</span> ${(contract?.totalAmount ? (contract.totalAmount / 100).toFixed(2) : '0.00')}</p>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Payment Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Contract Amount:</span>
                    <span>${(contract?.totalAmount ? (contract.totalAmount / 100).toFixed(2) : '0.00')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    <span>${(contract?.totalAmount && contract?.platformFeePercentage ? ((contract.totalAmount * contract.platformFeePercentage) / 10000).toFixed(2) : '0.00')}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount:</span>
                      <span>-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                {selectedMethod ? (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">•••• •••• •••• {selectedMethod.last4}</p>
                      <p className="text-xs text-gray-600">Expires {selectedMethod.expMonth}/{selectedMethod.expYear}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">New payment method</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="text-sm">
                    <p className="text-gray-900">
                      I agree to the{' '}
                      <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
                        Privacy Policy
                      </a>
                    </p>
                    <p className="text-gray-600 mt-1">
                      Funds will be held in escrow until work is completed and approved.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Secure Payment</p>
                    <p className="text-green-800">
                      Your payment is processed securely with 256-bit SSL encryption. You can request a refund if work isn't delivered.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmationModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={!termsAgreed || processingPayment}
                className="flex-1"
              >
                {processingPayment ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced contract review section
  const ContractReviewSection = () => {
    if (!contract) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contract Review</h3>
          <button
            onClick={() => setContractExpanded(!contractExpanded)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {contractExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{contract.title}</h4>
              <p className="text-sm text-gray-600">Contract #{contract._id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${(contract.totalAmount / 100).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">{contract.currency}</p>
            </div>
          </div>

          {contractExpanded && (
            <div className="border-t pt-4 space-y-4">
              {/* Freelancer Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-gray-900">Freelancer Name</h5>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Professional freelancer</p>
                  <button className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                    View Profile →
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h6 className="font-medium text-gray-900 mb-2">Terms & Conditions</h6>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Payment will be held in escrow until work is completed</p>
                  <p>• Funds will be released upon milestone approval</p>
                  <p>• Dispute resolution available if issues arise</p>
                  <p>• Platform fee covers transaction processing and support</p>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="terms-agreement"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms-agreement" className="text-sm text-gray-700">
                  I agree to the terms and conditions and authorize this payment. I understand that funds will be held securely until work is completed.
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading || methodsLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Loading payment details...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error?.message || 'Contract not found'}
            </h2>
            <Button onClick={() => router.push('/contracts')}>
              Back to Contracts
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-all mb-4"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Contract</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Secure Payment</h1>
            <p className="mt-2 text-gray-600">
              Complete your payment for: {contract.title}
            </p>
          </div>
        </div>

        {/* Payment Progress Steps */}
        <PaymentProgressSteps />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contract Review & Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Review Section */}
            <ContractReviewSection />

            {/* Payment Method Selection */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              
              {/* Saved Payment Methods */}
              {paymentMethods && paymentMethods.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h4 className="font-medium text-gray-700">Saved Cards</h4>
                  {paymentMethods.map((method: any, index: number) => (
                    <div
                      key={method.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMethod?.id === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMethod(method)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            •••• •••• •••• {method.last4}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires {method.expMonth}/{method.expYear}
                          </p>
                        </div>
                      </div>
                      {index === 0 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Form */}
              <Elements stripe={stripePromise} options={STRIPE_CONFIG.elementsOptions}>
                <StripePaymentForm
                  contractId={contract._id}
                  amount={contract.totalAmount}
                  currency={contract.currency}
                  description={`Payment for contract: ${contract.title}`}
                  savedMethods={paymentMethods}
                  selectedMethod={selectedMethod}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handleCancel}
                />
              </Elements>
            </div>
          </div>

          {/* Right Column - Payment Breakdown & Trust */}
          <div className="space-y-6">
            {/* Enhanced Payment Breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Contract Amount</span>
                  <span className="font-medium">${(contract.totalAmount / 100).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Platform Fee</span>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="font-medium text-gray-900">
                    ${((contract.totalAmount * contract.platformFeePercentage) / 10000).toFixed(2)}
                  </span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 text-green-600">
                    <span>Promo Discount</span>
                    <span>-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-3 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total to Pay</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${((contract.totalAmount / 100) + ((contract.totalAmount * contract.platformFeePercentage) / 10000) - promoDiscount).toFixed(2)}
                  </span>
                </div>
                
                <div className="text-center text-sm text-gray-500 pt-2">
                  Freelancer receives: ${((contract.totalAmount - (contract.totalAmount * contract.platformFeePercentage / 100)) / 100).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <button
                onClick={() => setShowPromoSection(!showPromoSection)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-medium text-gray-900">Have a promo code?</span>
                {showPromoSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {showPromoSection && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button variant="secondary" size="sm">
                      Apply
                    </Button>
                  </div>
                  {promoDiscount > 0 && (
                    <p className="text-sm text-green-600">Promo code applied! You saved ${promoDiscount.toFixed(2)}</p>
                  )}
                </div>
              )}
            </div>

            {/* Trust & Security Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Trust & Security</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment Processing</p>
                    <p className="text-sm text-gray-600">256-bit SSL encryption powered by Stripe</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Escrow Protection</p>
                    <p className="text-sm text-gray-600">Funds held securely until work is completed</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Money-Back Guarantee</p>
                    <p className="text-sm text-gray-600">100% refund if work isn't delivered</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-600 text-center">
                  Need help? <a href="#" className="text-blue-600 hover:text-blue-800">Contact Support</a>
                </p>
              </div>
            </div>

            {/* Payment Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Processed</p>
                    <p className="text-sm text-gray-600">Instant confirmation via email</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Funds Held in Escrow</p>
                    <p className="text-sm text-gray-600">Secure until milestones are completed</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Work Begins</p>
                    <p className="text-sm text-gray-600">Freelancer starts working on your project</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Released</p>
                    <p className="text-sm text-gray-600">Upon milestone approval</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800">{(error as any).message}</p>
                  {(error as any).actionText && (error as any).actionHandler && (
                    <button
                      onClick={(error as any).actionHandler}
                      className="mt-2 text-sm font-medium text-red-700 hover:text-red-800 underline"
                    >
                      {(error as any).actionText}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 ml-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContractPaymentPage;