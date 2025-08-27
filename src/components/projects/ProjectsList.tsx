'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign,
  Star,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { getAllProjects } from '@/api/services/projects';
import { Project } from '@/types/project';

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [projectType, setProjectType] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getAllProjects({
          search: searchTerm,
          category,
          budgetRange,
          type: projectType,
        });
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [searchTerm, category, budgetRange, projectType]);

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Data Science',
    'Other'
  ];

  const budgetRanges = [
    { value: '0-1000', label: 'Under $1,000' },
    { value: '1000-5000', label: '$1,000 - $5,000' },
    { value: '5000-10000', label: '$5,000 - $10,000' },
    { value: '10000+', label: 'Over $10,000' },
  ];

  const projectTypes = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'hourly', label: 'Hourly Rate' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
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
                Browse Projects
              </h1>
              <p className="mt-2 text-gray-600">
                Find the perfect project for your skills
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={budgetRange} onValueChange={setBudgetRange}>
              <SelectTrigger>
                <SelectValue placeholder="Budget Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Budgets</SelectItem>
                {budgetRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger>
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {projectTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCategory('');
                setBudgetRange('');
                setProjectType('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/projects/${project._id}`}>
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
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Budget</span>
                        <span className="font-medium">{formatBudget(project.budget)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Category</span>
                        <span className="text-sm">{project.category}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {project.requiredSkills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {project.requiredSkills.length > 2 && (
                            <span className="text-xs text-gray-500">+{project.requiredSkills.length - 2}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{project.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
