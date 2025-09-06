'use client';

import { useState, useEffect, memo } from 'react';
import { usePaymentStore } from '../../lib/stores/payment.store';
import { paymentsService } from '../../lib/api/payments.service';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { DollarSign, Clock, CheckCircle, XCircle, Download, AlertCircle } from 'lucide-react';

export const WithdrawalManager = memo(function WithdrawalManager() {
  const {
    currentBalance,
    withdrawalHistory,
    createWithdrawal,
    setWithdrawalHistory,
    isLoading,
    error
  } = usePaymentStore();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadWithdrawalHistory();
  }, []);

  const loadWithdrawalHistory = async () => {
    try {
      const history = await paymentsService.getWithdrawalHistory();
      setWithdrawalHistory(history);
    } catch (error) {
      console.error('Failed to load withdrawal history:', error);
    }
  };

  const handleWithdrawal = async () => {
    const withdrawalAmount = parseFloat(amount);
    if (!withdrawalAmount || withdrawalAmount <= 0) {
      return;
    }

    if (withdrawalAmount > currentBalance) {
      alert('Insufficient balance');
      return;
    }

    try {
      await createWithdrawal({
        amount: withdrawalAmount,
        currency: 'USD',
        description: description || 'Manual withdrawal'
      });

      setAmount('');
      setDescription('');
      loadWithdrawalHistory(); // Refresh history
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const minWithdrawal = 10; // Minimum withdrawal amount
  const maxWithdrawal = currentBalance;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Available Balance</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ${currentBalance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Minimum withdrawal: ${minWithdrawal}
            </p>
          </div>
          <DollarSign className="w-12 h-12 text-green-500" />
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Withdrawal</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                min={minWithdrawal}
                max={maxWithdrawal}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            {amount && parseFloat(amount) < minWithdrawal && (
              <p className="text-sm text-red-600 mt-1">
                Minimum withdrawal amount is ${minWithdrawal}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Monthly withdrawal"
            />
          </div>

          <Button
            onClick={handleWithdrawal}
            disabled={
              isLoading ||
              !amount ||
              parseFloat(amount) < minWithdrawal ||
              parseFloat(amount) > maxWithdrawal
            }
            className="w-full"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Processing...
              </>
            ) : (
              `Withdraw $${amount || '0.00'}`
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Withdrawal History</h3>
        </div>

        <div className="p-6">
          {withdrawalHistory.length === 0 ? (
            <div className="text-center py-8">
              <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No withdrawals yet</h4>
              <p className="text-gray-600">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawalHistory.map((withdrawal) => (
                <div key={withdrawal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(withdrawal.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          ${withdrawal.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {withdrawal.description || 'Withdrawal'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {withdrawal.failureReason && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-700">{withdrawal.failureReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
