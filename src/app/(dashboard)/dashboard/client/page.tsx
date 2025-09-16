'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import StatsCard from '../../../../components/features/dashboard/StatsCard';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalProposals: number;
  hiredFreelancers: number;
  completedProjects: number;
  totalSpent: number;
}

interface RecentJob {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'completed';
  proposals: number;
  createdAt: string;
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalProposals: 0,
    hiredFreelancers: 0,
    completedProjects: 0,
    totalSpent: 0
  });

  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, this would fetch from your API
        // For now, we'll use mock data
        setStats({
          totalJobs: 12,
          activeJobs: 3,
          totalProposals: 45,
          hiredFreelancers: 8,
          completedProjects: 7,
          totalSpent: 12500
        });

        setRecentJobs([
          {
            id: '1',
            title: 'React Developer for E-commerce Platform',
            status: 'open',
            proposals: 12,
            createdAt: '2025-09-10'
          },
          {
            id: '2',
            title: 'UI/UX Designer for Mobile App',
            status: 'in-progress',
            proposals: 8,
            createdAt: '2025-09-08'
          },
          {
            id: '3',
            title: 'Backend API Development',
            status: 'completed',
            proposals: 15,
            createdAt: '2025-09-05'
          }
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} />;
      case 'in-progress': return <Clock size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client" userName="John Doe">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, John! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Total Jobs Posted"
            value={stats.totalJobs.toString()}
            change="+12%"
            changeType="increase"
          />
          <StatsCard
            title="Active Jobs"
            value={stats.activeJobs.toString()}
            change="3 in progress"
            changeType="increase"
          />
          <StatsCard
            title="Total Proposals"
            value={stats.totalProposals.toString()}
            change="+8 this week"
            changeType="increase"
          />
          <StatsCard
            title="Hired Freelancers"
            value={stats.hiredFreelancers.toString()}
            change="2 this month"
            changeType="increase"
          />
          <StatsCard
            title="Completed Projects"
            value={stats.completedProjects.toString()}
            change="87% success rate"
            changeType="increase"
          />
          <StatsCard
            title="Total Spent"
            value={`$${stats.totalSpent.toLocaleString()}`}
            change="+$2,500 this month"
            changeType="increase"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/jobs/create">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200">
                <Plus size={20} className="mr-2" />
                Post New Job
              </button>
            </Link>
            <Link href="/jobs">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
                <Eye size={20} className="mr-2" />
                Browse Freelancers
              </button>
            </Link>
            <Link href="/messages">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200">
                <MessageSquare size={20} className="mr-2" />
                View Messages
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Jobs</h2>
              <Link href="/jobs/my-jobs">
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                  View All
                </button>
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentJobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FileText size={16} className="mr-1" />
                        {job.proposals} proposals
                      </span>
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1 capitalize">{job.status.replace('-', ' ')}</span>
                    </span>

                    <Link href={`/jobs/${job.id}`}>
                      <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Post Your Job</h3>
              <p className="text-sm text-gray-600">Create a detailed job posting to attract the right freelancers.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Review Proposals</h3>
              <p className="text-sm text-gray-600">Evaluate freelancer proposals and portfolios to find the best match.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Start Working</h3>
              <p className="text-sm text-gray-600">Collaborate with your chosen freelancer and track project progress.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}