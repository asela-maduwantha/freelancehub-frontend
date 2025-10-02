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
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {displayName}! 👋</h1>
            <p className="text-blue-100 text-lg">Here's what's happening with your projects today.</p>
          </div>
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
            title="Total Invested"
            value={`$${stats.totalSpent.toLocaleString()}`}
            change="Upfront payments made"
            changeType="increase"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/client/jobs/create">
              <button className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-4 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
                <Plus size={20} />
                <span>Post New Job</span>
              </button>
            </Link>
            <Link href="/client/jobs">
              <button className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
                <Eye size={20} />
                <span>Browse Freelancers</span>
              </button>
            </Link>
            <Link href="/client/messages">
              <button className="w-full group relative overflow-hidden bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 px-6 py-4 rounded-xl font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2">
                <MessageSquare size={20} />
                <span>View Messages</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Jobs</h2>
              <Link href="/client/jobs">
                <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group">
                  <span>View All</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {recentJobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                      <button className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-sm rounded-lg transition-colors">
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Contracts</h2>
              <Link href="/client/contracts">
                <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group">
                  <span>View All</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {recentContracts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No recent contracts found</p>
              </div>
            ) : (
              recentContracts.map((contract) => (
                <div key={contract.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {contract.jobTitle}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                        <button className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-sm rounded-lg transition-colors">
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

        {/* Payment Stats Widget */}
        {user && (
          <PaymentStatsWidget userId={user.id} userType="client" />
        )}

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-amber-50 rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Post Your Job</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Create a detailed job posting to attract the right freelancers.</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Review Proposals</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Evaluate freelancer proposals and portfolios to find the best match.</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Start Working</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Collaborate with your chosen freelancer and track project progress.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}