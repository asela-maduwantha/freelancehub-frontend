'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import StatsCard from '@/components/ui/StatsCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { 
  Search, 
  Briefcase, 
  DollarSign, 
  Star, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  Calendar,
  FileText,
  Award,
  RefreshCw,
  ArrowRight,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { usersService, authService, projectsService, contractsService, freelancersService } from '@/lib/api';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarned: number;
  activeContracts: number;
  pendingProposals: number;
  recentProjects: {
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    budget: {
      amount: number;
    };
  }[];
  averageRating?: number;
  totalHours?: number;
  pendingPayments?: number;
}

interface Project {
  id: string;
  title: string;
  status: string;
  client: {
    name: string;
    id: string;
  };
  budget: {
    amount: number;
    currency: string;
  };
  deadline: string;
}

interface Opportunity {
  id: string;
  title: string;
  budget: {
    amount: number;
    currency: string;
  };
  skills: string[];
  proposalCount: number;
  postedDate: string;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile?: {
    title?: string;
    hourlyRate?: number;
    bio?: string;
    skills?: string[];
    experience?: string;
    availability?: string;
  };
  stats?: DashboardStats;
}

export default function FreelancerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [newOpportunities, setNewOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Load dashboard stats
      try {
        const dashboardResponse = await freelancersService.getDashboard();
        setStats({
          ...dashboardResponse,
          averageRating: 0, // Default value since not provided by backend
          totalHours: 0, // Default value
          pendingPayments: 0 // Default value
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Set default stats if API fails
        setStats({
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalEarned: 0,
          activeContracts: 0,
          pendingProposals: 0,
          recentProjects: [],
          averageRating: 0,
          totalHours: 0,
          pendingPayments: 0
        });
      }

      // Load active projects (contracts)
      try {
        const contractsResponse = await contractsService.getContracts();
        
        // Ensure contractsResponse is an array
        const contractsData: any[] = Array.isArray(contractsResponse) ? contractsResponse : 
                            (contractsResponse && typeof contractsResponse === 'object' && Array.isArray((contractsResponse as any).data)) ? 
                            (contractsResponse as any).data : [];
        
        const activeContracts = contractsData.filter((contract: any) => contract.status === 'active').slice(0, 5);
        
        const projects = activeContracts.map((contract: any) => {
          let contractId = 'unknown';
          
          // Handle the case where projectId is an object with _id property
          if (contract.projectId?._id) {
            contractId = String(contract.projectId._id);
          } else if (contract.projectId && typeof contract.projectId === 'string') {
            contractId = String(contract.projectId);
          } else if (contract._id) {
            contractId = String(contract._id);
          } else if (contract.id) {
            contractId = String(contract.id);
          } else {
            contractId = `generated-${Math.random().toString(36).substr(2, 9)}`;
          }
          
          return {
            id: contractId,
            title: contract.projectId?.title || contract.terms?.scope || 'Untitled Project',
            status: contract.status,
            client: { 
              name: contract.clientId?.firstName ? `${contract.clientId.firstName} ${contract.clientId.lastName || ''}`.trim() : 'Client', 
              id: contract.clientId?._id || contract.clientId 
            },
            budget: {
              amount: contract.terms?.budget || 0,
              currency: 'USD'
            },
            deadline: contract.terms?.endDate || contract.terms?.deadline || new Date().toISOString()
          };
        });
        
        setActiveProjects(projects);
      } catch (error) {
        console.error('Failed to load active projects:', error);
        setActiveProjects([]);
      }

      // Load new opportunities
      try {
        const projectsResponse = await projectsService.getProjects({
          limit: 5,
          status: ['open']
        });
        
        // Handle different response structures
        let projectsData: any[] = [];
        if (projectsResponse?.data && Array.isArray(projectsResponse.data)) {
          projectsData = projectsResponse.data;
        } else if (Array.isArray(projectsResponse)) {
          // In case the response is directly an array
          projectsData = projectsResponse;
        }
        
        const opportunities = projectsData.map((project: any) => {
          let projectId = 'unknown';
          if (project.id && project.id !== null && project.id !== undefined) {
            projectId = String(project.id);
          } else if (project._id && project._id !== null && project._id !== undefined) {
            projectId = String(project._id);
          } else {
            projectId = `generated-${Math.random().toString(36).substr(2, 9)}`;
          }
          
          return {
            id: projectId,
            title: project.title,
            budget: project.budget,
            skills: project.skills || [],
            proposalCount: Math.floor(Math.random() * 20) + 1,
            postedDate: project.createdAt
          };
        });
        
        setNewOpportunities(opportunities);
      } catch (error) {
        console.error('Failed to load opportunities:', error);
        setNewOpportunities([]);
      }

    } catch (error) {
      console.error('Dashboard loading error:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" text="Loading your dashboard..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins">
              Good morning, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600 font-inter mt-1">
              Ready to take on new challenges today?
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Link 
              href="/freelancer/projects"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-poppins"
            >
              <Search className="h-4 w-4 mr-2" />
              Find New Work
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8 ${isRefreshing ? 'opacity-50' : ''}`}
          >
            <StatsCard
              title="Active Projects"
              value={stats.activeProjects}
              icon={Briefcase}
              color="green"
              onClick={() => router.push('/freelancer/contracts')}
            />
            <StatsCard
              title="Total Earned"
              value={formatCurrency(stats.totalEarned)}
              icon={DollarSign}
              color="blue"
              onClick={() => router.push('/freelancer/payments')}
            />
            <StatsCard
              title="Completed"
              value={stats.completedProjects}
              icon={Award}
              color="purple"
              onClick={() => router.push('/freelancer/contracts')}
            />
            <StatsCard
              title="Rating"
              value={`${stats.averageRating}★`}
              icon={Star}
              color="yellow"
              onClick={() => router.push('/freelancer/reviews')}
            />
            <StatsCard
              title="Hours Worked"
              value={stats.totalHours ?? 0}
              icon={Clock}
              color="indigo"
            />
            <StatsCard
              title="Pending"
              value={formatCurrency(stats.pendingPayments ?? 0)}
              icon={TrendingUp}
              color="orange"
              onClick={() => router.push('/freelancer/payments')}
            />
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Contracts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 font-poppins">
                    Active Contracts
                  </h2>
                  <Link href="/freelancer/contracts" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {activeProjects.length > 0 ? (
                  <div className="space-y-4">
                    {activeProjects.slice(0, 3).map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900 font-inter">{project.title}</h3>
                          <StatusBadge status="active" variant="compact" />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>Client: {project.client.name}</span>
                          <span>{formatCurrency(project.budget.amount, project.budget.currency)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Due: {formatDate(project.deadline)}</span>
                          <Link 
                            href={`/freelancer/contracts/${project.id && typeof project.id === 'string' ? project.id : 'unknown'}`}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors font-inter"
                          >
                            View Contract
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="No active contracts"
                    description="Contracts will appear here once proposals are accepted"
                    action={{
                      label: 'Browse Projects',
                      onClick: () => router.push('/freelancer/projects'),
                      variant: 'premium'
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 font-poppins">
                Profile Strength
              </h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-green-700">Profile completion</span>
                <span className="text-lg font-bold text-green-800">85%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 mb-4">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-sm text-green-700 mb-4">
                Complete your profile to get more project invitations
              </p>
              <Link 
                href="/freelancer/profile"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-green-300 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 transition-colors font-inter"
              >
                Complete Profile
              </Link>
            </div>

            {/* New Opportunities */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 font-poppins">
                    New Opportunities
                  </h2>
                  <Link href="/freelancer/projects" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {newOpportunities.length > 0 ? (
                  <div className="space-y-4">
                    {newOpportunities.slice(0, 4).map((opportunity) => (
                      <div key={opportunity.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                        <h3 className="font-medium text-gray-900 mb-2 font-inter">{opportunity.title}</h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-semibold text-green-600">
                            {formatCurrency(opportunity.budget.amount, opportunity.budget.currency)}
                          </span>
                          <span className="text-sm text-gray-500">{opportunity.proposalCount} proposals</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {opportunity.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <Link 
                          href={`/freelancer/projects/${opportunity.id && typeof opportunity.id === 'string' ? opportunity.id : 'unknown'}`}
                          className="w-full inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors font-inter"
                        >
                          View Details
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No new opportunities</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link 
                  href="/freelancer/proposals"
                  className="w-full inline-flex items-center justify-start px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors font-inter"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  View My Proposals
                </Link>
                <Link 
                  href="/freelancer/payments"
                  className="w-full inline-flex items-center justify-start px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors font-inter"
                >
                  <DollarSign className="h-4 w-4 mr-3" />
                  Check Payments
                </Link>
                <Link 
                  href="/freelancer/profile"
                  className="w-full inline-flex items-center justify-start px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors font-inter"
                >
                  <Target className="h-4 w-4 mr-3" />
                  Update Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
