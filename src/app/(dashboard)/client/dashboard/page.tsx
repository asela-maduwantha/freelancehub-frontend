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
import PaymentStatsWidget from '../../../../components/features/payments/PaymentStatsWidget';
import { dashboardApi, type DashboardStats, type RecentJob, type RecentContract } from '../../../../lib/api/dashboard';
import { useUserDisplay, useAuth } from '../../../../lib/hooks/useAuth';

export default function ClientDashboard() {
  const { displayName } = useUserDisplay();
  const { user } = useAuth();
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
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-amber-600 bg-amber-100';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
            <p className="text-error mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary px-6 py-2 rounded-lg"
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {displayName}</h1>
              <p className="text-gray-600">Here's an overview of your projects and activities.</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Jobs"
            value={stats.activeJobs.toString()}
            change="Open positions"
            changeType="increase"
          />
          <StatsCard
            title="Active Contracts"
            value={stats.activeContracts.toString()}
            change="In progress"
            changeType="increase"
          />
          <StatsCard
            title="Pending Proposals"
            value={stats.pendingProposals.toString()}
            change="Awaiting review"
            changeType="increase"
          />
          <StatsCard
            title="Total Invested"
            value={`$${stats.totalSpent.toLocaleString()}`}
            change="All time"
            changeType="increase"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/client/jobs/create">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Plus size={18} />
                <span>Post New Job</span>
              </button>
            </Link>
            <Link href="/client/jobs">
              <button className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Eye size={18} />
                <span>Browse Freelancers</span>
              </button>
            </Link>
            <Link href="/client/messages">
              <button className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                <span>View Messages</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
              <Link href="/client/jobs">
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group">
                  <span>View All</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentJobs.map((job) => (
              <div key={job.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 truncate">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {job.proposalsCount} proposals
                      </span>
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span className="font-medium text-gray-900">
                        ${job.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(job.status)}`}>
                      <span className="capitalize">{job.status.replace('-', ' ')}</span>
                    </span>

                    <Link href={`/client/jobs/${job.id}`}>
                      <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium text-sm rounded-lg transition-colors">
                        View
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Contracts</h2>
              <Link href="/client/contracts">
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group">
                  <span>View All</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentContracts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Briefcase size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm">No active contracts</p>
              </div>
            ) : (
              recentContracts.map((contract) => (
                <div key={contract.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-2 truncate">
                        {contract.jobTitle}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {contract.freelancerName}
                        </span>
                        <span className="font-medium text-gray-900">
                          ${contract.contractValue.toLocaleString()}
                        </span>
                        <span>Started {new Date(contract.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(contract.status)}`}>
                        <span className="capitalize">{contract.status}</span>
                      </span>

                      <Link href={`/client/contracts/${contract.id}`}>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium text-sm rounded-lg transition-colors">
                          View
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Stats Widget */}
        {user && (
          <PaymentStatsWidget userId={user.id} userType="client" />
        )}

        {/* Getting Started Guide */}
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Post Your Job</h3>
                <p className="text-sm text-gray-600">Create a detailed job posting to attract qualified freelancers.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Review Proposals</h3>
                <p className="text-sm text-gray-600">Evaluate proposals and select the best freelancer for your project.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Track Progress</h3>
                <p className="text-sm text-gray-600">Collaborate and monitor project milestones in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}