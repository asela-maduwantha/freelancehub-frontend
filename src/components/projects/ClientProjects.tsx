'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Plus, 
  Eye, 
  Users, 
  DollarSign,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { getClientProjects } from '@/api/services/projects';
import { Project } from '@/types/project';

export default function ClientProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getClientProjects();
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error('Failed to fetch client projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBudget = (budget: any) => {
    if (budget.type === 'fixed') {
      return `$${budget.amount.toLocaleString()}`;
    }
    return `$${budget.amount}/hr`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Projects
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your posted projects and track their progress
              </p>
            </div>
            <Link href="/client/projects/new">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Post New Project</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Plus className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by posting your first project.
            </p>
            <div className="mt-6">
              <Link href="/client/projects/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Project
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {project.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Budget</span>
                      <span className="font-medium">{formatBudget(project.budget)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Proposals</span>
                      <span className="text-sm">{project.proposals?.count || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Views</span>
                      <span className="text-sm">{project.views || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Link href={`/projects/${project._id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/client/projects/${project._id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
