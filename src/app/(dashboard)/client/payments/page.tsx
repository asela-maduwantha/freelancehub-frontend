'use client';

import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import TransactionHistory from '../../../../components/features/payments/PaymentHistory';

export default function ClientPaymentsPage() {
  return (
    <DashboardLayout userRole="client">
      <TransactionHistory userType="client" />
    </DashboardLayout>
  );
}