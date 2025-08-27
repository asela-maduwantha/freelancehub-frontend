import { Metadata } from 'next';
import FreelancerContracts from '@/components/contracts/FreelancerContracts';

export const metadata: Metadata = {
  title: 'My Contracts - FreelanceHub',
  description: 'Manage your active contracts and milestones',
};

export default function FreelancerContractsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <FreelancerContracts />
    </div>
  );
}
