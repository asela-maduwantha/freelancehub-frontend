import { Metadata } from 'next';
import ProjectDetail from '@/components/projects/ProjectDetail';

export const metadata: Metadata = {
  title: 'Project Details - FreelanceHub',
  description: 'View project details and submit proposals',
};

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectDetail projectId={params.id} />
    </div>
  );
}
