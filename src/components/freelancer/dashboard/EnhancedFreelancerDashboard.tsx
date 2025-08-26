'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Briefcase, 
  Star, 
  TrendingUp, 
  Eye,
  Clock,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Search,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { freelancerApi } from '@/lib/api/freelancerApi';
import { proposalApi } from '@/lib/api/proposals';
import { contractApi } from '@/lib/api/contracts';
import { messageApi } from '@/lib/api/messages';
import { notificationApi } from '@/lib/api/notifications';
import { toast } from '@/context/toast-context';
import Link from 'next/link';

interface DashboardStats {
  activeProjects: number;
  totalEarnings: number;
  profileViews: number;
  averageRating: number;
  completedProjects: number;
  pendingProposals: number;
  unreadMessages: number;
  availabilityStatus: boolean;
}

interface RecentActivity {
  id: string;
  type: 'proposal_submitted' | 'proposal_accepted' | 'proposal_rejected' | 'milestone_completed' | 'payment_received' | 'message_received';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

export function EnhancedFreelancerDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    totalEarnings: 0,
    profileViews: 0,
    averageRating: 0,
    completedProjects: 0,
    pendingProposals: 0,
    unreadMessages: 0,
    availabilityStatus: true
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [earningsChart, setEarningsChart] = useState<{ date: string; amount: number; }[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState([
    { id: 'browse-projects', title: 'Browse Projects', icon: Search, href: '/freelancer/projects' },
    { id: 'view-proposals', title: 'My Proposals', icon: FileText, href: '/freelancer/proposals' },
    { id: 'messages', title: 'Messages', icon: MessageSquare, href: '/freelancer/messages' },
    { id: 'analytics', title: 'Analytics', icon: TrendingUp, href: '/freelancer/analytics' }
  ]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadRecentActivity(),
        loadEarningsChart(),
        loadUpcomingDeadlines()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Use Promise.allSettled to handle individual API failures gracefully
      const [
        profileResult,
        proposalsResult,
        contractsResult
      ] = await Promise.allSettled([
        freelancerApi.getMyProfile(),
        proposalApi.getMyProposals({ status: 'pending', limit: 100 }),
        contractApi.getMyContracts({ status: 'active' })
      ]);

      // Extract values with fallbacks for failed calls
      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
      const proposalsResponse = proposalsResult.status === 'fulfilled' ? proposalsResult.value : null;
      const contractsResponse = contractsResult.status === 'fulfilled' ? contractsResult.value : null;

      // Log any failures for debugging
      if (profileResult.status === 'rejected') {
        console.error('Failed to load profile:', profileResult.reason);
      }
      if (proposalsResult.status === 'rejected') {
        console.error('Failed to load proposals:', proposalsResult.reason);
      }
      if (contractsResult.status === 'rejected') {
        console.error('Failed to load contracts:', contractsResult.reason);
      }

      setStats({
        activeProjects: contractsResponse?.contracts?.length || 0,
        totalEarnings: 0, // TODO: Get from payments API
        profileViews: 0, // TODO: Get from analytics API
        averageRating: profile?.user?.rating || 0,
        completedProjects: profile?.completedProjects || 0,
        pendingProposals: proposalsResponse?.proposals?.length || 0,
        unreadMessages: 0, // TODO: Get from messages API
        availabilityStatus: profile?.isAvailable || false
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Use Promise.allSettled to handle individual API failures gracefully
      const [proposalsResult, contractsResult] = await Promise.allSettled([
        proposalApi.getMyProposals({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        contractApi.getMyContracts({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      // Extract values with fallbacks for failed calls
      const proposals = proposalsResult.status === 'fulfilled' ? proposalsResult.value : null;
      const contracts = contractsResult.status === 'fulfilled' ? contractsResult.value : null;

      // Log any failures for debugging
      if (proposalsResult.status === 'rejected') {
        console.error('Failed to load proposals for recent activity:', proposalsResult.reason);
      }
      if (contractsResult.status === 'rejected') {
        console.error('Failed to load contracts for recent activity:', contractsResult.reason);
      }

      const activities: RecentActivity[] = [];

      // Add proposal activities
      proposals?.proposals?.forEach(proposal => {
        activities.push({
          id: `proposal-${proposal._id}`,
          type: proposal.status === 'accepted' ? 'proposal_accepted' : 
                proposal.status === 'rejected' ? 'proposal_rejected' : 'proposal_submitted',
          title: `Proposal ${proposal.status}`,
          description: proposal.project?.title || 'Project title not available',
          timestamp: new Date(proposal.updatedAt),
          metadata: { proposalId: proposal._id, projectId: proposal.projectId }
        });
      });

      // Add contract activities
      contracts?.contracts?.forEach((contract: any) => {
        activities.push({
          id: `contract-${contract._id}`,
          type: 'milestone_completed',
          title: 'Contract updated',
          description: contract.title,
          timestamp: new Date(contract.updatedAt),
          metadata: { contractId: contract._id }
        });
      });

      // Sort by timestamp and take latest 10
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setRecentActivity(sortedActivities);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  };

  const loadEarningsChart = async () => {
    try {
      // TODO: Implement earnings chart data from analytics API
      // For now, using mock data
      const mockData = [
        { date: '2024-01', amount: 2500 },
        { date: '2024-02', amount: 3200 },
        { date: '2024-03', amount: 2800 },
        { date: '2024-04', amount: 4100 },
        { date: '2024-05', amount: 3600 },
        { date: '2024-06', amount: 4500 }
      ];
      setEarningsChart(mockData);
    } catch (error) {
      console.error('Failed to load earnings chart:', error);
    }
  };

  const loadUpcomingDeadlines = async () => {
    try {
      const contracts = await contractApi.getMyContracts({ status: 'active' });
      const deadlines = contracts.contracts?.flatMap((contract: any) => 
        contract.milestones
          ?.filter((milestone: any) => milestone.status !== 'completed' && new Date(milestone.dueDate) > new Date())
          .map((milestone: any) => ({
            id: milestone._id,
            title: milestone.title,
            dueDate: milestone.dueDate,
            contractTitle: contract.title,
            contractId: contract._id
          }))
      ) || [];

      const sortedDeadlines = deadlines
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

      setUpcomingDeadlines(sortedDeadlines);
    } catch (error) {
      console.error('Failed to load upcoming deadlines:', error);
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      const newStatus = !stats.availabilityStatus;
      await freelancerApi.updateMyAvailability(newStatus);
      setStats(prev => ({ ...prev, availabilityStatus: newStatus }));
      toast.success(`Availability ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        toast.success('Logged out successfully');
      } catch (error) {
        console.error('Logout error:', error);
        toast.error('Failed to logout');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'proposal_submitted': return <FileText className="w-4 h-4" />;
      case 'proposal_accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'proposal_rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'milestone_completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'payment_received': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'message_received': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 h-32 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {(user as any)?.firstName || user?.name || 'Freelancer'}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your freelance business</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Available for work</span>
            <button
              onClick={handleAvailabilityToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                stats.availabilityStatus ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  stats.availabilityStatus ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.totalEarnings)}
          </div>
          <div className="text-gray-600 text-sm">Total Earnings</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center text-blue-600 text-sm">
              <span>{stats.activeProjects} active</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.completedProjects}
          </div>
          <div className="text-gray-600 text-sm">Projects Completed</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex items-center text-yellow-600 text-sm">
              <Star className="w-3 h-3" />
              <span>{stats.averageRating.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.pendingProposals}
          </div>
          <div className="text-gray-600 text-sm">Pending Proposals</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center text-purple-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+8%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.profileViews}
          </div>
          <div className="text-gray-600 text-sm">Profile Views</div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Earnings Overview</h3>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {earningsChart.map((data, index) => {
                    const maxAmount = Math.max(...earningsChart.map(d => d.amount));
                    const height = (data.amount / maxAmount) * 200;
                    
                    return (
                      <div key={data.date} className="flex flex-col items-center">
                        <div className="text-xs text-gray-600 mb-2">
                          {formatCurrency(data.amount)}
                        </div>
                        <div
                          className="w-8 bg-green-500 rounded-t transition-all duration-1000 delay-500"
                          style={{ height: `${height}px` }}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          {data.date.split('-')[1]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.id} href={action.href}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Icon className="w-4 h-4 mr-3" />
                          {action.title}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No upcoming deadlines
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="border-l-4 border-yellow-400 pl-3">
                        <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                        <p className="text-xs text-gray-600">{deadline.contractTitle}</p>
                        <div className="flex items-center gap-1 text-xs text-yellow-600">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(deadline.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Messages Preview */}
          {stats.unreadMessages > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Messages</h3>
                    <Badge variant="warning">{stats.unreadMessages} unread</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href="/freelancer/messages">
                    <Button className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View All Messages
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
