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
import { dashboardApi, type DashboardStats, type RecentJob, type RecentContract } from '../../../../lib/api/dashboard';
import { useUserDisplay } from '../../../../lib/hooks/useAuth';

export default function ClientDashboard() {
  const { displayName } = useUserDisplay();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    activeContracts: 0,
    totalSpent: 0,
    pendingProposals: 0,
    ongoingProjects: 0
  });

  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentContracts, setRecentContracts] = useState<RecentContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load dashboard data from API
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const dashboardData = await dashboardApi.getClientDashboard();
        
        setStats(dashboardData.stats);
        setRecentJobs(dashboardData.recentJobs);
        setRecentContracts(dashboardData.recentContracts);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
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
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} />;
      case 'in-progress': return <Clock size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'active': return <Clock size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
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

  if (error) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {displayName}! 👋</h1>
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
            change="Currently open"
            changeType="increase"
          />
          <StatsCard
            title="Completed Jobs"
            value={stats.completedJobs.toString()}
            change="Successfully finished"
            changeType="increase"
          />
          <StatsCard
            title="Active Contracts"
            value={stats.activeContracts.toString()}
            change="Currently active"
            changeType="increase"
          />
          <StatsCard
            title="Pending Proposals"
            value={stats.pendingProposals.toString()}
            change="Awaiting review"
            changeType="increase"
          />
          <StatsCard
            title="Total Spent"
            value={`$${stats.totalSpent.toLocaleString()}`}
            change="Project investments"
            changeType="increase"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/client/jobs/create">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200">
                <Plus size={20} className="mr-2" />
                Post New Job
              </button>
            </Link>
            <Link href="/client/jobs">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
                <Eye size={20} className="mr-2" />
                Browse Freelancers
              </button>
            </Link>
            <Link href="/client/messages">
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
              <Link href="/client/jobs">
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
                        {job.proposalsCount} proposals
                      </span>
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center">
                        <TrendingUp size={16} className="mr-1" />
                        ${job.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1 capitalize">{job.status.replace('-', ' ')}</span>
                    </span>

                    <Link href={`/client/jobs/${job.id}`}>
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

        {/* Recent Contracts */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Contracts</h2>
              <Link href="/client/contracts">
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                  View All
                </button>
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentContracts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Briefcase size={24} className="mx-auto mb-2" />
                <p>No recent contracts found</p>
              </div>
            ) : (
              recentContracts.map((contract) => (
                <div key={contract.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {contract.jobTitle}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users size={16} className="mr-1" />
                          {contract.freelancerName}
                        </span>
                        <span className="flex items-center">
                          <TrendingUp size={16} className="mr-1" />
                          ${contract.contractValue.toLocaleString()}
                        </span>
                        <span>Started {new Date(contract.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        <span className="ml-1 capitalize">{contract.status}</span>
                      </span>

                      <Link href={`/client/contracts/${contract.id}`}>
                        <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
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