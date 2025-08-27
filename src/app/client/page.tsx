import { Metadata } from 'next';
import ClientDashboard from '@/components/dashboard/ClientDashboard';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Client Dashboard - FreelanceHub',
  description: 'Manage your projects, contracts, and freelancer relationships',
};

export default async function ClientPage() {
  // TODO: Add proper session check
  // const session = await getServerSession();
  // if (!session) {
  //   redirect('/auth/login');
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientDashboard />
    </div>
  );
}
