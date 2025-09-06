'use client';

import { PaymentDashboard } from '@/components/payments';

export default function ClientPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">
          Manage your payments, view transaction history, and handle billing
        </p>
      </div>

      <PaymentDashboard userType="client" />
    </div>
  );
}
