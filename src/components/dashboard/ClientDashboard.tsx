'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Plus, 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { getClientStats } from '@/api/services/platform';

interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  activeContracts: number;
  pendingProposals: number;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    activeContracts: 0,
    pendingProposals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getClientStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch client stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Completed',
      value: stats.completedProjects,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Spent',
      value: `$${stats.totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Active Contracts',
      value: stats.activeContracts,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Pending Proposals',
      value: stats.pendingProposals,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
                Welcome back, {user?.profile?.firstName || 'Client'}!
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your projects and track your progress
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/client/projects/new">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Post Project</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Recent Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Website Redesign</p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Mobile App Development</p>
                    <p className="text-sm text-gray-600">Reviewing Proposals</p>
                  </div>
                  <Badge variant="outline">Open</Badge>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/client/projects">
                  <Button variant="outline" className="w-full">
                    View All Projects
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Active Contracts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Active Contracts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-600">Website Redesign</p>
                  </div>
                  <Badge variant="secondary">Milestone 2</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-gray-600">Logo Design</p>
                  </div>
                  <Badge variant="outline">Review</Badge>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/client/contracts">
                  <Button variant="outline" className="w-full">
                    View All Contracts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
