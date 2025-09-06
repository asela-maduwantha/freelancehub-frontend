'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Briefcase, 
  Users, 
  DollarSign, 
  Clock, 
  Star, 
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  FileText,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  Target,
  Zap,
  Award,
  BarChart3,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { clientsService } from '@/lib/api';
import { IProject, IDashboardProposal, DashboardStats } from '@/lib/types';
import { PaymentDashboard } from '@/components/payments';

const ProjectCard: React.FC<{ project: IProject }> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'active': return <TrendingUp className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
            {project.title}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="ml-1 capitalize">{project.status}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-3">
          <span>Budget: ${project.budget?.toLocaleString()} {project.currency}</span>
        </div>
        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: any;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  gradient: string;
}> = ({ title, value, icon: Icon, change, changeType = 'neutral', gradient }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${gradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

const ProposalCard: React.FC<{ proposal: IDashboardProposal }> = ({ proposal }) => {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center space-x-4">
        <img
          src="/user.jpg"
          alt={`${proposal.freelancerId.name}`}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {proposal.freelancerId.name}
            </h4>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">4.5</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 truncate mb-2">{proposal.projectId.title}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-green-600">
              ${proposal.proposedBudget.amount.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(proposal.submittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<IProject[]>([]);
  const [recentProposals, setRecentProposals] = useState<IDashboardProposal[]>([]);
  const [latestProposals, setLatestProposals] = useState<IDashboardProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadDashboardData();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const dashboardData = await clientsService.getDashboard();
      console.log('Dashboard Data:', dashboardData);
      
      setStats({
        totalProjects: dashboardData.totalProjects || 0,
        projectsByStatus: dashboardData.projectsByStatus || {
          open: 0,
          'in-progress': 0,
          completed: 0,
          cancelled: 0,
          disputed: 0
        },
        totalProposals: dashboardData.totalProposals || 0
      });
      setRecentProjects(dashboardData.recentProjects || []);
      setLatestProposals(dashboardData.latestProposals || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      // Set empty state instead of mock data
      setStats({
        totalProjects: 0,
        projectsByStatus: {
          open: 0,
          'in-progress': 0,
          completed: 0,
          cancelled: 0,
          disputed: 0
        },
        totalProposals: 0
      });
      setRecentProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your projects today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects || 0}
          icon={Briefcase}
          change={`${stats?.projectsByStatus?.open || 0} open`}
          changeType="positive"
          gradient="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="In Progress"
          value={stats?.projectsByStatus?.['in-progress'] || 0}
          icon={Activity}
          change="Active projects"
          changeType="neutral"
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Completed"
          value={stats?.projectsByStatus?.completed || 0}
          icon={CheckCircle}
          change="Successfully finished"
          changeType="positive"
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Open Projects"
          value={stats?.projectsByStatus?.open || 0}
          icon={Clock}
          change="Awaiting proposals"
          changeType="neutral"
          gradient="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        <StatCard
          title="Total Proposals"
          value={stats?.totalProposals || 0}
          icon={MessageSquare}
          change="Received so far"
          changeType="positive"
          gradient="bg-gradient-to-r from-indigo-500 to-indigo-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-50 to-indigo-50 rounded-xl p-6 border border-green-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/client/projects/new">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg p-4 border border-green-200 hover:border-green-300 cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Post a Project</h3>
                  <p className="text-sm text-gray-600">Find the perfect freelancer</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/client/freelancers">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg p-4 border border-green-200 hover:border-green-300 cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Browse Talent</h3>
                  <p className="text-sm text-gray-600">Discover top freelancers</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/client/proposals">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg p-4 border border-purple-200 hover:border-purple-300 cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Review Proposals</h3>
                  <p className="text-sm text-gray-600">Check new submissions</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <Link href="/client/projects">
              <Button variant="ghost" className="text-green-600 hover:text-green-700">
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Start by posting your first project to find talented freelancers.</p>
                <Link href="/client/projects/new">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Project
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Latest Proposals</h2>
            <Link href="/client/proposals">
              <Button variant="ghost" className="text-green-600 hover:text-green-700">
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {latestProposals.length > 0 ? (
              latestProposals.map((proposal) => (
                <ProposalCard key={proposal._id} proposal={proposal} />
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals yet</h3>
                <p className="text-gray-600 mb-4">Proposals from freelancers will appear here once you post projects.</p>
                <Link href="/client/projects">
                  <Button variant="outline">
                    View Your Projects
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <Button variant="ghost" className="text-green-600 hover:text-green-700">
            View All
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Project "Mobile App UI Design" was completed</p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
              View
            </Button>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New message from John Developer</p>
              <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
            </div>
            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
              Reply
            </Button>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">3 new proposals received for "E-commerce Website"</p>
              <p className="text-xs text-gray-500 mt-1">1 day ago</p>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
              Review
            </Button>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Sarah Tech left a 5-star review</p>
              <p className="text-xs text-gray-500 mt-1">2 days ago</p>
            </div>
            <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700">
              View
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Dashboard */}
      <PaymentDashboard userType="client" />
    </div>
  );
}
