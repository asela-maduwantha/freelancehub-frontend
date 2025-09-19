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
  Award
} from 'lucide-react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import StatsCard from '../../../../components/features/dashboard/StatsCard';

interface FreelancerStats {
  totalProposals: number;
  activeContracts: number;
  completedProjects: number;
  totalEarnings: number;
  averageRating: number;
  successRate: number;
}

interface RecentProposal {
  id: string;
  jobTitle: string;
  clientName: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  budget: number;
}

export default function FreelancerDashboard() {
  const [stats, setStats] = useState<FreelancerStats>({
    totalProposals: 0,
    activeContracts: 0,
    completedProjects: 0,
    totalEarnings: 0,
    averageRating: 0,
    successRate: 0
  });

  const [recentProposals, setRecentProposals] = useState<RecentProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, this would fetch from your API
        // For now, we'll use mock data
        setStats({
          totalProposals: 28,
          activeContracts: 2,
          completedProjects: 15,
          totalEarnings: 8750,
          averageRating: 4.8,
          successRate: 92
        });

        setRecentProposals([
          {
            id: '1',
            jobTitle: 'React Developer for E-commerce Platform',
            clientName: 'TechCorp Inc.',
            status: 'pending',
            submittedAt: '2025-09-12',
            budget: 2500
          },
          {
            id: '2',
            jobTitle: 'UI/UX Designer for Mobile App',
            clientName: 'StartupXYZ',
            status: 'accepted',
            submittedAt: '2025-09-10',
            budget: 1800
          },
          {
            id: '3',
            jobTitle: 'Backend API Development',
            clientName: 'DataFlow Ltd.',
            status: 'rejected',
            submittedAt: '2025-09-08',
            budget: 3200
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
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'accepted': return <CheckCircle size={16} />;
      case 'rejected': return <Clock size={16} />;
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

  return (
    <DashboardLayout userRole="freelancer" userName="Sarah Johnson">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card-default p-6">
          <h1 className="text-2xl font-bold text-primary mb-2">Welcome back, Sarah! 👋</h1>
          <p className="text-secondary">Here's your freelance performance overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Total Proposals"
            value={stats.totalProposals.toString()}
            change="+5 this week"
            changeType="increase"
          />
          <StatsCard
            title="Active Contracts"
            value={stats.activeContracts.toString()}
            change="2 in progress"
            changeType="increase"
          />
          <StatsCard
            title="Completed Projects"
            value={stats.completedProjects.toString()}
            change="3 this month"
            changeType="increase"
          />
          <StatsCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toLocaleString()}`}
            change="+$1,200 this month"
            changeType="increase"
          />
          <StatsCard
            title="Average Rating"
            value={stats.averageRating.toString()}
            change="4.8/5.0"
            changeType="increase"
          />
          <StatsCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            change="Top 8% of freelancers"
            changeType="increase"
          />
        </div>

        {/* Quick Actions */}
        <div className="card-default p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/browse-projects">
              <button className="btn-accent w-full flex items-center justify-center">
                <Search size={20} className="mr-2" />
                Browse Projects
              </button>
            </Link>
            <Link href="/proposals">
              <button className="btn-primary w-full flex items-center justify-center">
                <FileText size={20} className="mr-2" />
                My Proposals
              </button>
            </Link>
            <Link href="/messages">
              <button className="btn-secondary w-full flex items-center justify-center">
                <MessageSquare size={20} className="mr-2" />
                Messages
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="card-default">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">Recent Proposals</h2>
              <Link href="/proposals">
                <button className="text-emerald hover:text-emerald font-medium text-sm">
                  View All
                </button>
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentProposals.map((proposal) => (
              <div key={proposal.id} className="p-6 hover:bg-secondary transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-primary mb-1">
                      {proposal.jobTitle}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-muted mb-2">
                      <span className="flex items-center">
                        <Briefcase size={16} className="mr-1" />
                        {proposal.clientName}
                      </span>
                      <span>Submitted {new Date(proposal.submittedAt).toLocaleDateString()}</span>
                      <span className="flex items-center">
                        <DollarSign size={16} className="mr-1" />
                        ${proposal.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                      {getStatusIcon(proposal.status)}
                      <span className="ml-1 capitalize">{proposal.status}</span>
                    </span>

                    <Link href={`/proposals/${proposal.id}`}>
                      <button className="text-emerald hover:text-emerald font-medium text-sm">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Skills */}
          <div className="card-default p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Your Top Skills</h2>
            <div className="space-y-3">
              {[
                { skill: 'React Development', level: 95, projects: 12 },
                { skill: 'Node.js', level: 88, projects: 8 },
                { skill: 'UI/UX Design', level: 82, projects: 6 },
                { skill: 'TypeScript', level: 90, projects: 10 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary">{item.skill}</span>
                      <span className="text-sm text-muted">{item.level}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{ width: `${item.level}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted mt-1">{item.projects} projects completed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="card-default p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Recent Achievements</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Top Rated Freelancer</p>
                  <p className="text-sm text-muted">Achieved 4.8+ star rating</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Rising Star</p>
                  <p className="text-sm text-muted">15 projects completed this quarter</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Star className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Client Favorite</p>
                  <p className="text-sm text-muted">92% client satisfaction rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-emerald rounded-lg p-6 border border-emerald">
          <h2 className="text-xl font-semibold text-primary mb-4">Boost Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-lighter rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h3 className="font-medium text-primary mb-1">Complete Your Profile</h3>
              <p className="text-sm text-secondary">Add your portfolio, skills, and experience to attract more clients.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-lighter rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <h3 className="font-medium text-primary mb-1">Submit Quality Proposals</h3>
              <p className="text-sm text-secondary">Write personalized proposals that showcase your understanding of client needs.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-lighter rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <h3 className="font-medium text-primary mb-1">Deliver Excellence</h3>
              <p className="text-sm text-secondary">Complete projects on time and maintain high communication standards.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}