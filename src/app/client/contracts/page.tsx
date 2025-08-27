import { Metadata } from 'next';
import ClientContracts from '@/components/contracts/ClientContracts';

export const metadata: Metadata = {
  title: 'My Contracts - FreelanceHub',
  description: 'Manage your active contracts and milestones',
};

export default function ClientContractsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientContracts />
    </div>
  );
}
