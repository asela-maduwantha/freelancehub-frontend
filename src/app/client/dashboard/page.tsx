import { Metadata } from 'next';
import ClientDashboard from '@/components/dashboard/ClientDashboard';

export const metadata: Metadata = {
  title: 'Client Dashboard - FreelanceHub',
  description: 'Manage your projects, contracts, and freelancer relationships',
};

export default function ClientDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientDashboard />
    </div>
  );
}
