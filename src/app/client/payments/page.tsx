'use client';

import { useState } from 'react';
import { PaymentDashboard, SubmittedMilestones } from '@/components/payments';

export default function ClientPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'milestones'>('payments');

  const tabs = [
    { id: 'payments', label: 'All Payments', description: 'View transaction history and manage payments' },
    { id: 'milestones', label: 'Submitted Milestones', description: 'Review and approve freelancer work' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">
          Manage your payments, view transaction history, and handle billing
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'payments' | 'milestones')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'payments' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
              <p className="text-sm text-gray-600">{tabs[0].description}</p>
            </div>
            <PaymentDashboard userType="client" />
          </div>
        )}

        {activeTab === 'milestones' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">Milestone Approvals</h2>
              <p className="text-sm text-gray-600">{tabs[1].description}</p>
            </div>
            <SubmittedMilestones />
          </div>
        )}
      </div>
    </div>
  );
}
