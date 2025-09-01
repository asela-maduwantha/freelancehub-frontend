'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  Search, 
  Briefcase, 
  DollarSign, 
  Star, 
  Clock, 
  TrendingUp,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Plus,
  Eye,
  Calendar,
  FileText,
  Award,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  X,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { freelancerAPI, authAPI, projectAPI, contractAPI } from '@/lib/api';

interface DashboardStats {
  activeProjects: number;
  totalEarnings: number;
  completedProjects: number;
  averageRating: number;
  totalHours: number;
  pendingPayments: number;
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
  proposalCount: number;
  postedAt: string;
  skills: string[];
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  profile?: {
    bio?: string;
    hourlyRate?: number;
    skills?: string[];
    availability?: string;
    title?: string;
    experience?: string;
    languages?: string[];
    timezone?: string;
  };
  verification?: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
  };
  location?: {
    country?: string;
    city?: string;
  };
  phone?: string;
}

export default function FreelancerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [newOpportunities, setNewOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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
        const dashboardResponse = await freelancerAPI.getDashboard();
        setStats(dashboardResponse.data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Set default stats if API fails
        setStats({
          activeProjects: 0,
          totalEarnings: 0,
          completedProjects: 0,
          averageRating: 0,
          totalHours: 0,
          pendingPayments: 0
        });
      }

      // Load active projects (contracts)
      try {
        const contractsResponse = await contractAPI.getContracts({
          status: 'active',
          limit: 5
        });
        
        const projects = contractsResponse.contracts.map((contract: any) => ({
          id: contract.projectId,
          title: contract.terms.scope,
          status: contract.status,
          client: { name: 'Client', id: contract.clientId },
          budget: {
            amount: contract.terms.totalAmount,
            currency: contract.terms.currency
          },
          deadline: contract.terms.deadline
        }));
        setActiveProjects(projects);
      } catch (error) {
        console.error('Failed to load active projects:', error);
        setActiveProjects([]);
      }

      // Load new opportunities (public projects)
      try {
        const opportunitiesResponse = await projectAPI.getPublicProjects({
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        
        const opportunities = opportunitiesResponse.projects.map((project: any) => ({
          id: project._id,
          title: project.title,
          budget: project.budget,
          proposalCount: project.proposals?.length || 0,
          postedAt: project.postedAt,
          skills: project.requiredSkills?.map((skillObj: any) => skillObj.skill) || []
        }));
        setNewOpportunities(opportunities);
      } catch (error) {
        console.error('Failed to load opportunities:', error);
        setNewOpportunities([]);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                <Link href="/freelancer/dashboard" className="text-green-600 font-semibold">
                  Dashboard
                </Link>
                <Link href="/freelancer/projects" className="text-gray-600 hover:text-gray-900">
                  Find Work
                </Link>
                <Link href="/freelancer/proposals" className="text-gray-600 hover:text-gray-900">
                  My Proposals
                </Link>
                <Link href="/freelancer/contracts" className="text-gray-600 hover:text-gray-900">
                  Contracts
                </Link>
                <Link href="/freelancer/reviews" className="text-gray-600 hover:text-gray-900">
                  Reviews
                </Link>
                <Link href="/freelancer/payments" className="text-gray-600 hover:text-gray-900">
                  Payments
                </Link>
                <Link href="/freelancer/disputes" className="text-gray-600 hover:text-gray-900">
                  Disputes
                </Link>
                <Link href="/freelancer/messages" className="text-gray-600 hover:text-gray-900">
                  Messages
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                onClick={() => setShowProfileModal(true)}
              >
                <img src="/user.jpg" alt={user.firstName} className="h-8 w-8 rounded-full" />
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-gray-500">Freelancer</div>
                </div>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">
              Good morning, {user.firstName}!
            </h1>
            <p className="text-gray-600 font-inter">
              Ready to take on new challenges today?
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/freelancer/projects">
              <Button variant="premium" className="font-poppins">
                <Search className="h-4 w-4 mr-2" />
                Find New Projects
              </Button>
            </Link>
            <Link href="/freelancer/proposals">
              <Button variant="outline" className="font-inter">
                <FileText className="h-4 w-4 mr-2" />
                My Proposals
              </Button>
            </Link>
            <Link href="/freelancer/contracts">
              <Button variant="outline" className="font-inter">
                <FileText className="h-4 w-4 mr-2" />
                My Contracts
              </Button>
            </Link>
            <Link href="/freelancer/profile">
              <Button variant="outline" className="font-inter">
                <Settings className="h-4 w-4 mr-2" />
                Update Profile
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
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8 ${isRefreshing ? 'opacity-50' : ''}`}
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
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}★</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHours}</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingPayments)}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Projects */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 font-poppins">Active Projects</h2>
                  <Link href="/freelancer/projects" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {activeProjects.length > 0 ? (
                  <div className="space-y-4">
                    {activeProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 font-inter">{project.title}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Client: {project.client.name}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              In Progress
                            </span>
                            <span>{formatCurrency(project.budget.amount, project.budget.currency)}</span>
                            <span>Due: {formatDate(project.deadline)}</span>
                          </div>
                        </div>
                        <Link href={`/freelancer/projects/${project.id}`}>
                          <Button variant="outline" size="sm" className="font-inter">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active projects</h3>
                    <p className="text-gray-500 mb-4">Find new projects to work on</p>
                    <Link href="/freelancer/projects">
                      <Button variant="premium" className="font-poppins">
                        Browse Projects
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Contracts */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 font-poppins">Recent Contracts</h2>
                  <Link href="/freelancer/contracts" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {activeProjects.length > 0 ? (
                  <div className="space-y-4">
                    {activeProjects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 font-inter">{project.title}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Client: {project.client.name}</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Contract Active
                            </span>
                            <span>{formatCurrency(project.budget.amount, project.budget.currency)}</span>
                          </div>
                        </div>
                        <Link href={`/freelancer/contracts/${project.id}`}>
                          <Button variant="outline" size="sm" className="font-inter">
                            View Contract
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active contracts</h3>
                    <p className="text-gray-500 mb-4">Contracts will appear here once proposals are accepted</p>
                    <Link href="/freelancer/proposals">
                      <Button variant="premium" className="font-poppins">
                        View Proposals
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* New Opportunities & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* New Opportunities */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 font-poppins">New Opportunities</h2>
                  <Link href="/freelancer/projects" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {newOpportunities.length > 0 ? (
                  <div className="space-y-4">
                    {newOpportunities.map((opportunity) => (
                      <div key={opportunity.id} className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                        <h3 className="font-medium text-gray-900 mb-2 font-inter">{opportunity.title}</h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-semibold text-green-600">{formatCurrency(opportunity.budget.amount, opportunity.budget.currency)}</span>
                          <span className="text-sm text-gray-500">{opportunity.proposalCount} proposals</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {opportunity.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <Link href={`/freelancer/projects/${opportunity.id}`}>
                          <Button variant="outline" size="sm" className="w-full font-inter">
                            View Details
                          </Button>
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

            {/* Profile Completion */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3 font-poppins">Profile Strength</h3>
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
              <Link href="/freelancer/profile">
                <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-100 font-inter">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowProfileModal(false)}
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Profile Header */}
                <div className="text-center">
                  <img src="/user.jpg" alt={user.firstName} className="h-20 w-20 rounded-full mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                  <p className="text-gray-600">{user.profile?.title || 'Freelancer'}</p>
                  {user.profile?.hourlyRate && (
                    <p className="text-green-600 font-semibold mt-1">
                      {formatCurrency(user.profile.hourlyRate)}/hr
                    </p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{user.phone}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">
                          {user.location.city}, {user.location.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                {user.profile && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Profile Details</h4>
                    {user.profile.bio && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Bio</p>
                        <p className="text-gray-700 text-sm">{user.profile.bio}</p>
                      </div>
                    )}
                    {user.profile.skills && user.profile.skills.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {user.profile.skills.slice(0, 5).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                          {user.profile.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{user.profile.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {user.profile.experience && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Experience Level</p>
                        <p className="text-gray-700 text-sm capitalize">{user.profile.experience}</p>
                      </div>
                    )}
                    {user.profile.availability && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Availability</p>
                        <p className="text-gray-700 text-sm capitalize">{user.profile.availability}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Verification Status */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Verification Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email Verified</span>
                      <span className={`text-sm ${user.verification?.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {user.verification?.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone Verified</span>
                      <span className={`text-sm ${user.verification?.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {user.verification?.phoneVerified ? '✓ Verified' : '✗ Not Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Link href="/freelancer/profile" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/freelancer/portfolio" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Portfolio
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
