import { Metadata } from 'next';
import FreelancerProjects from '@/components/projects/FreelancerProjects';

export const metadata: Metadata = {
  title: 'Find Projects - FreelanceHub',
  description: 'Browse and apply to projects that match your skills',
};

export default function FreelancerProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <FreelancerProjects />
    </div>
  );
}
