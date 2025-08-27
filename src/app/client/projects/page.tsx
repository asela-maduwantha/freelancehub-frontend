import { Metadata } from 'next';
import ClientProjects from '@/components/projects/ClientProjects';

export const metadata: Metadata = {
  title: 'My Projects - FreelanceHub',
  description: 'Manage your posted projects and proposals',
};

export default function ClientProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientProjects />
    </div>
  );
}
