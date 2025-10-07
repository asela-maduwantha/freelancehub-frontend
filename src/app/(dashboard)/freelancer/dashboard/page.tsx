'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  FileText,
  TrendingUp,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  Search,
  MessageSquare,
  Award,
  AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Breadcrumb from '../../../../components/common/Breadcrumb';
import StatsCard from '../../../../components/features/dashboard/StatsCard';
import { dashboardApi, type FreelancerStats, type FreelancerProposal, type ActiveContract } from '../../../../lib/api/dashboard';
import { useUserDisplay } from '../../../../lib/hooks/useAuth';

export default function FreelancerDashboard() {
  const { displayName } = useUserDisplay();
  const [stats, setStats] = useState<FreelancerStats>({
    totalProposals: 0,
    activeProposals: 0,
    activeContracts: 0,
    completedProjects: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalReviews: 0
  });

  const [recentProposals, setRecentProposals] = useState<FreelancerProposal[]>([]);
  const [activeContracts, setActiveContracts] = useState<ActiveContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load dashboard data from API
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const dashboardData = await dashboardApi.getFreelancerDashboard();
        
        setStats(dashboardData.stats);
        setRecentProposals(dashboardData.recentProposals);
        setActiveContracts(dashboardData.activeContracts);
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
      case 'pending': return 'text-amber-600 bg-amber-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'accepted': return <CheckCircle size={16} />;
      case 'rejected': return <AlertCircle size={16} />;
      case 'active': return <Clock size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', icon: <LayoutDashboard size={16} /> }
          ]}
        />

        {/* Welcome Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {displayName}</h1>
              <p className="text-gray-600">Here's your freelance performance overview.</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Proposals"
            value={stats.activeProposals.toString()}
            change="Awaiting response"
            changeType="increase"
          />
          <StatsCard
            title="Active Contracts"
            value={stats.activeContracts.toString()}
            change="In progress"
            changeType="increase"
          />
          <StatsCard
            title="Completed Projects"
            value={stats.completedProjects.toString()}
            change="All time"
            changeType="increase"
          />
          <StatsCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toLocaleString()}`}
            change="All time"
            changeType="increase"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/freelancer/jobs">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Search size={18} />
                <span>Browse Projects</span>
              </button>
            </Link>
            <Link href="/freelancer/proposals">
              <button className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <FileText size={18} />
                <span>My Proposals</span>
              </button>
            </Link>
            <Link href="/freelancer/messages">
              <button className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                <span>Messages</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Proposals</h2>
              <Link href="/freelancer/proposals">
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
            {recentProposals.map((proposal) => (
              <div key={proposal.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 truncate">
                      {proposal.jobTitle}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} />
                        {proposal.clientName}
                      </span>
                      <span>Submitted {new Date(proposal.submittedAt).toLocaleDateString()}</span>
                      <span className="font-medium text-gray-900">
                        ${proposal.proposedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(proposal.status)}`}>
                      <span className="capitalize">{proposal.status}</span>
                    </span>

                    <Link href={`/freelancer/proposals/${proposal.id}`}>
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

        {/* Active Contracts */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Contracts</h2>
              <Link href="/freelancer/contracts">
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
            {activeContracts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Briefcase size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm">No active contracts</p>
              </div>
            ) : (
              activeContracts.map((contract) => (
                <div key={contract.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-2 truncate">
                        {contract.jobTitle}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {contract.clientName}
                        </span>
                        <span className="font-medium text-gray-900">
                          ${contract.contractValue.toLocaleString()}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${contract.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 flex-shrink-0">{contract.progress}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(contract.status)}`}>
                        <span className="capitalize">{contract.status}</span>
                      </span>

                      <Link href={`/freelancer/contracts/${contract.id}`}>
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

        {/* Skills & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Skills */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Top Skills</h2>
            <div className="space-y-4">
              {[
                { skill: 'React Development', level: 95, projects: 12 },
                { skill: 'Node.js', level: 88, projects: 8 },
                { skill: 'UI/UX Design', level: 82, projects: 6 },
                { skill: 'TypeScript', level: 90, projects: 10 }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.skill}</span>
                    <span className="text-sm text-gray-600">{item.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.level}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.projects} projects completed</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Top Rated Freelancer</p>
                  <p className="text-sm text-gray-600">Achieved 4.8+ star rating</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Rising Star</p>
                  <p className="text-sm text-gray-600">15 projects completed this quarter</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Client Favorite</p>
                  <p className="text-sm text-gray-600">92% client satisfaction rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Boost Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Complete Your Profile</h3>
                <p className="text-sm text-gray-600">Add your portfolio, skills, and experience to attract more clients.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Submit Quality Proposals</h3>
                <p className="text-sm text-gray-600">Write personalized proposals that showcase your understanding of client needs.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Deliver Excellence</h3>
                <p className="text-sm text-gray-600">Complete projects on time and maintain high communication standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}