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

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  activeContracts: number;
  pendingProposals: number;
}

interface Project {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  budget: {
    amount: number;
  };
  proposalsCount?: number;
  deadline?: string;
}

interface Proposal {
  _id: string;
  freelancer: {
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
  };
  projectId: {
    title: string;
  };
  proposedBudget: number;
  createdAt: string;
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
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
          <span>Budget: ${project.budget.amount.toLocaleString()}</span>
          {project.proposalsCount !== undefined && (
            <span>{project.proposalsCount} proposals</span>
          )}
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

const ProposalCard: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center space-x-4">
        <img
          src={proposal.freelancer.avatar || '/user.jpg'}
          alt={`${proposal.freelancer.firstName} ${proposal.freelancer.lastName}`}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {proposal.freelancer.firstName} {proposal.freelancer.lastName}
            </h4>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">{proposal.freelancer.rating}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 truncate mb-2">{proposal.projectId.title}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-green-600">
              ${proposal.proposedBudget.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(proposal.createdAt).toLocaleDateString()}
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
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      // Try to load real data from API
      const dashboardData = await clientsService.getDashboard();
      if (dashboardData && dashboardData.totalProjects !== undefined) {
        setStats({
          totalProjects: dashboardData.totalProjects || 0,
          activeProjects: dashboardData.activeProjects || 0,
          completedProjects: dashboardData.completedProjects || 0,
          totalSpent: dashboardData.totalSpent || 0,
          activeContracts: dashboardData.activeContracts || 0,
          pendingProposals: dashboardData.pendingProposals || 0
        });
        setRecentProjects(dashboardData.recentProjects || []);
        setRecentProposals(dashboardData.recentProposals || []);
      } else {
        console.log('API returned empty or invalid data, using mock data');
        // Mock data for demonstration
        setStats({
          totalProjects: 12,
          activeProjects: 3,
          completedProjects: 9,
          totalSpent: 8500,
          activeContracts: 5,
          pendingProposals: 8
        });

        setRecentProjects([
          {
            _id: '1',
            title: 'Build E-commerce Website with Advanced Features',
            status: 'active',
            createdAt: '2024-01-15',
            budget: { amount: 2500 },
            proposalsCount: 12,
            deadline: '2024-02-15'
          },
          {
            _id: '2',
            title: 'Mobile App UI/UX Design',
            status: 'open',
            createdAt: '2024-01-10',
            budget: { amount: 1200 },
            proposalsCount: 8
          },
          {
            _id: '3',
            title: 'Content Writing for Blog',
            status: 'completed',
            createdAt: '2024-01-05',
            budget: { amount: 800 },
            proposalsCount: 15
          },
          {
            _id: '4',
            title: 'SEO Optimization & Marketing',
            status: 'active',
            createdAt: '2024-01-20',
            budget: { amount: 1500 },
            proposalsCount: 6
          }
        ]);

        setRecentProposals([
          {
            _id: '1',
            freelancer: {
              firstName: 'John',
              lastName: 'Developer',
              avatar: '/user.jpg',
              rating: 4.9
            },
            projectId: {
              title: 'Build E-commerce Website'
            },
            proposedBudget: 2200,
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            freelancer: {
              firstName: 'Sarah',
              lastName: 'Designer',
              avatar: '/user.jpg',
              rating: 4.8
            },
            projectId: {
              title: 'Mobile App UI/UX Design'
            },
            proposedBudget: 1100,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: '3',
            freelancer: {
              firstName: 'Michael',
              lastName: 'Writer',
              avatar: '/user.jpg',
              rating: 4.7
            },
            projectId: {
              title: 'Content Writing for Blog'
            },
            proposedBudget: 750,
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data
      setStats({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalSpent: 0,
        activeContracts: 0,
        pendingProposals: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <Link href="/client/freelancers">
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Browse Talent</span>
            </Button>
          </Link>
          <Link href="/client/projects/new">
            <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              <span>Post New Project</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects || 0}
          icon={Briefcase}
          change="+2 this month"
          changeType="positive"
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects || 0}
          icon={Activity}
          change={`${stats?.activeProjects || 0} ongoing`}
          changeType="neutral"
          gradient="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Total Spent"
          value={`$${(stats?.totalSpent || 0).toLocaleString()}`}
          icon={DollarSign}
          change="+15% vs last month"
          changeType="positive"
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Active Contracts"
          value={stats?.activeContracts || 0}
          icon={FileText}
          change="5 in progress"
          changeType="neutral"
          gradient="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        <StatCard
          title="Pending Proposals"
          value={stats?.pendingProposals || 0}
          icon={Clock}
          change="Awaiting review"
          changeType="neutral"
          gradient="bg-gradient-to-r from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Success Rate"
          value="94%"
          icon={Award}
          change="+2% improvement"
          changeType="positive"
          gradient="bg-gradient-to-r from-indigo-500 to-indigo-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/client/projects/new">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-300 cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-5 w-5 text-blue-600" />
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
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Latest Proposals</h2>
            <Link href="/client/proposals">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentProposals.map((proposal) => (
              <ProposalCard key={proposal._id} proposal={proposal} />
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Project "Mobile App UI Design" was completed</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New message from John Developer</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">3 new proposals received for "E-commerce Website"</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
