"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PaymentDashboard } from "@/components/client/payments/PaymentDashboard";
import { PaymentFilters } from "@/components/client/payments/PaymentFilters";
import { PaymentStats } from "@/components/client/payments/PaymentStats";
import apiClient from "@/api/axios-instance";

interface Payment {
  id: string;
  contractId: string;
  milestoneId?: string;
  amount: number;
  status: string;
  type: string;
  paymentMethod: string;
  createdAt: string;
  processedAt?: string;
  projectTitle: string;
  freelancerName: string;
}

interface PaymentFilters {
  search: string;
  status: string[];
  type: string[];
  paymentMethod: string[];
  dateRange: {
    from: string;
    to: string;
  };
  amountRange: {
    min: number;
    max: number;
  };
}

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentFilters>({
    search: "",
    status: [],
    type: [],
    paymentMethod: [],
    dateRange: {
      from: "",
      to: "",
    },
    amountRange: {
      min: 0,
      max: 10000,
    },
  });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      // Convert filters to API format
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status.length > 0) queryParams.append('status', filters.status.join(','));
      if (filters.type.length > 0) queryParams.append('type', filters.type.join(','));
      if (filters.paymentMethod.length > 0) queryParams.append('payment_method', filters.paymentMethod.join(','));
      if (filters.dateRange.from) queryParams.append('date_from', filters.dateRange.from);
      if (filters.dateRange.to) queryParams.append('date_to', filters.dateRange.to);
      if (filters.amountRange.min > 0) queryParams.append('amount_min', filters.amountRange.min.toString());
      if (filters.amountRange.max < 10000) queryParams.append('amount_max', filters.amountRange.max.toString());

      const response = await apiClient.get(`/payments?${queryParams.toString()}`);
      const data = response.data as any;
      setPayments(data?.payments || data || []);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      // Fallback to simulated data on error
      const fallbackData: Payment[] = [
        {
          id: "pay1",
          contractId: "contract1",
          milestoneId: "m1",
          amount: 1500,
          status: "PROCESSED",
          type: "milestone_payment",
          paymentMethod: "credit_card",
          createdAt: "2025-08-20T10:00:00Z",
          processedAt: "2025-08-20T10:05:00Z",
          projectTitle: "E-commerce Website Development",
          freelancerName: "John Doe"
        },
        {
          id: "pay2",
          contractId: "contract1",
          milestoneId: "m2",
          amount: 2500,
          status: "PENDING",
          type: "milestone_payment",
          paymentMethod: "credit_card",
          createdAt: "2025-08-25T14:30:00Z",
          projectTitle: "E-commerce Website Development",
          freelancerName: "John Doe"
        }
      ];
      setPayments(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: PaymentFilters) => {
    setFilters(newFilters);
  };

  const calculateStats = (payments: Payment[]) => {
    const stats = {
      totalSpent: 0,
      pendingPayments: 0,
      escrowBalance: 0,
      monthlySpending: 0,
      paymentMethodStats: {
        credit_card: 0,
        paypal: 0,
        bank_transfer: 0,
      },
      statusStats: {
        processed: 0,
        pending: 0,
        failed: 0,
        refunded: 0,
        escrow: 0,
      },
      monthlyTrend: {
        current: 0,
        previous: 0,
        percentage: 0,
      },
    };

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    payments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      const paymentMonth = paymentDate.getMonth();
      const paymentYear = paymentDate.getFullYear();

      // Total spent
      if (payment.status === 'PROCESSED') {
        stats.totalSpent += payment.amount;
      }

      // Pending payments
      if (payment.status === 'PENDING') {
        stats.pendingPayments += payment.amount;
      }

      // Escrow balance
      if (payment.status === 'ESCROW') {
        stats.escrowBalance += payment.amount;
      }

      // Monthly spending
      if (paymentMonth === currentMonth && paymentYear === currentYear && payment.status === 'PROCESSED') {
        stats.monthlySpending += payment.amount;
      }

      // Payment method stats
      if (payment.status === 'PROCESSED') {
        if (payment.paymentMethod === 'credit_card') stats.paymentMethodStats.credit_card += payment.amount;
        if (payment.paymentMethod === 'paypal') stats.paymentMethodStats.paypal += payment.amount;
        if (payment.paymentMethod === 'bank_transfer') stats.paymentMethodStats.bank_transfer += payment.amount;
      }

      // Status stats
      if (payment.status === 'PROCESSED') stats.statusStats.processed += payment.amount;
      if (payment.status === 'PENDING') stats.statusStats.pending += payment.amount;
      if (payment.status === 'FAILED') stats.statusStats.failed += payment.amount;
      if (payment.status === 'REFUNDED') stats.statusStats.refunded += payment.amount;
      if (payment.status === 'ESCROW') stats.statusStats.escrow += payment.amount;
    });

    return stats;
  };

  const handlePaymentAction = async (paymentId: string, action: string, data?: any) => {
    try {
      await apiClient.post(`/payments/${paymentId}/actions`, { action, ...data });
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${action} payment:`, error);
    }
  };

  const handleEscrowRelease = async (contractId: string, milestoneId: string, amount: number) => {
    try {
      await apiClient.post('/payments/escrow/release', {
        contractId,
        milestoneId,
        amount
      });
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error("Failed to release escrow payment:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6 space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Manage your payments and financial transactions</p>
      </div>

      {/* Stats */}
      <PaymentStats 
        stats={calculateStats(payments)} 
        isLoading={isLoading}
      />

      {/* Filters */}
      <PaymentFilters 
        filters={filters}
        onFiltersChange={handleFilterChange}
      />

      {/* Payment Dashboard */}
      <PaymentDashboard 
        payments={payments}
        isLoading={isLoading}
        onPaymentAction={handlePaymentAction}
        onEscrowRelease={handleEscrowRelease}
        onPaymentUpdate={fetchPayments}
      />
    </motion.div>
  );
}
