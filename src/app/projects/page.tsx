import { Metadata } from 'next';
import ProjectsList from '@/components/projects/ProjectsList';

export const metadata: Metadata = {
  title: 'Browse Projects - FreelanceHub',
  description: 'Find the perfect project for your skills or hire talented freelancers',
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectsList />
    </div>
  );
}
