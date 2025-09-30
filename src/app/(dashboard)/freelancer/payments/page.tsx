'use client';

import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import TransactionHistory from '../../../../components/features/payments/PaymentHistory';

export default function FreelancerPaymentsPage() {
  return (
    <DashboardLayout userRole="freelancer">
      <TransactionHistory userType="freelancer" />
    </DashboardLayout>
  );
}