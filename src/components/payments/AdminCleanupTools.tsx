'use client';

import { useState, useEffect, memo } from 'react';
import { usePaymentStore } from '../../lib/stores/payment.store';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AdminCleanupToolsProps {
  className?: string;
}

export const AdminCleanupTools = memo(function AdminCleanupTools({ className }: AdminCleanupToolsProps) {
  const {
    getDisputedPayments,
    getRefundRequests,
    resolveDispute,
    processRefund,
    disputedPayments,
    refundRequests,
    isLoading,
    error
  } = usePaymentStore();

  const [activeTab, setActiveTab] = useState<'disputes' | 'refunds'>('disputes');

  useEffect(() => {
    if (activeTab === 'disputes') {
      getDisputedPayments();
    } else {
      getRefundRequests();
    }
  }, [activeTab, getDisputedPayments, getRefundRequests]);

  const handleResolveDispute = async (paymentId: string, resolution: 'release' | 'refund') => {
    try {
      await resolveDispute(paymentId, resolution);
      getDisputedPayments(); // Refresh the list
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    }
  };

  const handleProcessRefund = async (paymentId: string, approved: boolean) => {
    try {
      await processRefund(paymentId, approved);
      getRefundRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to process refund:', error);
    }
  };

  const tabs = [
    { id: 'disputes', label: 'Payment Disputes', count: disputedPayments?.length || 0 },
    { id: 'refunds', label: 'Refund Requests', count: refundRequests?.length || 0 }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Admin Cleanup Tools</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage payment disputes and refund requests
        </p>
      </div>

      <div className="border-b">
        <nav className="flex space-x-1 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-red-100 text-red-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">Payment Disputes</h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner className="w-6 h-6" />
              </div>
            ) : disputedPayments?.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No payment disputes at this time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {disputedPayments?.map((dispute) => (
                  <div key={dispute.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          Payment ID: {dispute.paymentId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: ${dispute.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Reason: {dispute.reason}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Disputed
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleResolveDispute(dispute.paymentId, 'release')}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        Release to Freelancer
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleResolveDispute(dispute.paymentId, 'refund')}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Refund to Client
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'refunds' && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">Refund Requests</h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner className="w-6 h-6" />
              </div>
            ) : refundRequests?.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No refund requests at this time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {refundRequests?.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          Payment ID: {request.paymentId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: ${request.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Reason: {request.reason}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                        Pending
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleProcessRefund(request.paymentId, true)}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        Approve Refund
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleProcessRefund(request.paymentId, false)}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Deny Refund
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
