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
  Bell,
  Settings,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { clientAPI } from '@/lib/api';

interface DashboardStats {
  activeProjects: number;
  totalProjects: number;
  totalSpent: number;
  activeFreelancers: number;
  pendingProposals: number;
  completedProjects: number;
}

interface Project {
  id: string;
  title: string;
  status: string;
  proposalCount: number;
  budget: {
    amount: number;
    currency: string;
  };
  createdAt: string;
}

interface Proposal {
  id: string;
  freelancer: {
    name: string;
    avatar: string;
    rating: number;
  };
  project: {
    title: string;
  };
  pricing: {
    amount: number;
    currency: string;
  };
  submittedAt: string;
}

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
      try {
        const dashboardData = await clientAPI.getDashboard();
        setStats(dashboardData.stats);
        setRecentProjects(dashboardData.recentProjects || []);
        setRecentProposals(dashboardData.recentApplications || []);
      } catch (apiError) {
        console.log('API not available, using mock data');
        // Fallback to mock data for demonstration
        setStats({
          activeProjects: 3,
          totalProjects: 12,
          totalSpent: 8500,
          activeFreelancers: 5,
          pendingProposals: 8,
          completedProjects: 9
        });

        setRecentProjects([
        {
          id: '1',
          title: 'Build E-commerce Website',
          status: 'active',
          proposalCount: 12,
          budget: { amount: 2500, currency: 'USD' },
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Mobile App UI Design',
          status: 'open',
          proposalCount: 8,
          budget: { amount: 1200, currency: 'USD' },
          createdAt: '2024-01-10'
        },
        {
          id: '3',
          title: 'Content Writing for Blog',
          status: 'completed',
          proposalCount: 15,
          budget: { amount: 800, currency: 'USD' },
          createdAt: '2024-01-05'
        }
      ]);

      setRecentProposals([
        {
          id: '1',
          freelancer: {
            name: 'John Developer',
            avatar: '/user.jpg',
            rating: 4.9
          },
          project: {
            title: 'Build E-commerce Website'
          },
          pricing: {
            amount: 2200,
            currency: 'USD'
          },
          submittedAt: '2024-01-16'
        },
        {
          id: '2',
          freelancer: {
            name: 'Sarah Designer',
            avatar: '/user.jpg',
            rating: 4.8
          },
          project: {
            title: 'Mobile App UI Design'
          },
          pricing: {
            amount: 1100,
            currency: 'USD'
          },
          submittedAt: '2024-01-15'
        }
        ]);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
                <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
              </Link>
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <Link href="/client/dashboard" className="text-green-600 font-semibold">
                  Dashboard
                </Link>
                <Link href="/client/projects" className="text-gray-600 hover:text-gray-900">
                  Projects
                </Link>
                <Link href="/client/freelancers" className="text-gray-600 hover:text-gray-900">
                  Find Talent
                </Link>
                <Link href="/client/contracts" className="text-gray-600 hover:text-gray-900">
                  Contracts
                </Link>
                <Link href="/client/payments" className="text-gray-600 hover:text-gray-900">
                  Payments
                </Link>
                <Link href="/client/reviews" className="text-gray-600 hover:text-gray-900">
                  Reviews
                </Link>
                <Link href="/client/disputes" className="text-gray-600 hover:text-gray-900">
                  Disputes
                </Link>
                <Link href="/client/files" className="text-gray-600 hover:text-gray-900">
                  Files
                </Link>
                <Link href="/client/profile" className="text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
                <Link href="/client/messages" className="text-gray-600 hover:text-gray-900">
                  Messages
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                {stats && stats.pendingProposals > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingProposals}
                  </span>
                )}
              </Button>
              <div className="flex items-center space-x-2">
                <img src="/user.jpg" alt={user.firstName} className="h-8 w-8 rounded-full" />
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-gray-500">Client</div>
                </div>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 font-inter">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/client/projects/new">
              <Button variant="premium" className="font-poppins">
                <Plus className="h-4 w-4 mr-2" />
                Post a Project
              </Button>
            </Link>
            <Link href="/client/freelancers">
              <Button variant="outline" className="font-inter">
                <Search className="h-4 w-4 mr-2" />
                Find Freelancers
              </Button>
            </Link>
            <Link href="/client/contracts">
              <Button variant="outline" className="font-inter">
                <FileText className="h-4 w-4 mr-2" />
                View Contracts
              </Button>
            </Link>
            <Link href="/client/payments">
              <Button variant="outline" className="font-inter">
                <DollarSign className="h-4 w-4 mr-2" />
                View Payments
              </Button>
            </Link>
            <Link href="/client/reviews">
              <Button variant="outline" className="font-inter">
                <Star className="h-4 w-4 mr-2" />
                Leave Reviews
              </Button>
            </Link>
            <Link href="/client/disputes">
              <Button variant="outline" className="font-inter">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Manage Disputes
              </Button>
            </Link>
            <Link href="/client/messages">
              <Button variant="outline" className="font-inter">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Freelancers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeFreelancers}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Proposals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingProposals}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 font-poppins">Recent Projects</h2>
                  <Link href="/client/projects" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentProjects.length > 0 ? (
                  <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 font-inter">{project.title}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === 'active' ? 'bg-green-100 text-green-800' :
                              project.status === 'open' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {project.proposalCount} proposals
                            </span>
                            <span>${project.budget.amount}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="font-inter">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-4">Start by posting your first project</p>
                    <Link href="/client/projects/new">
                      <Button variant="premium" className="font-poppins">
                        Post a Project
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Proposals & Quick Stats */}
          <div className="space-y-8">
            {/* Recent Proposals */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 font-poppins">Recent Proposals</h2>
                  <Link href="/client/proposals" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentProposals.length > 0 ? (
                  <div className="space-y-4">
                    {recentProposals.map((proposal) => (
                      <div key={proposal.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                        <img 
                          src={proposal.freelancer.avatar} 
                          alt={proposal.freelancer.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {proposal.freelancer.name}
                            </p>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500 ml-1">{proposal.freelancer.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{proposal.project.title}</p>
                          <p className="text-sm font-medium text-green-600">${proposal.pricing.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No proposals yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/client/projects/new" className="block">
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Plus className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Post New Project</p>
                      <p className="text-sm text-gray-500">Get proposals from freelancers</p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/client/freelancers" className="block">
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Search className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Browse Freelancers</p>
                      <p className="text-sm text-gray-500">Find and invite talent</p>
                    </div>
                  </div>
                </Link>

                <Link href="/client/profile" className="block">
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Update Profile</p>
                      <p className="text-sm text-gray-500">Complete your company profile</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
