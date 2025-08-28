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
  Award
} from 'lucide-react';
import Link from 'next/link';

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

export default function FreelancerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [newOpportunities, setNewOpportunities] = useState<Opportunity[]>([]);
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
      // Mock data for demonstration - replace with actual API calls
      setStats({
        activeProjects: 3,
        totalEarnings: 8500,
        completedProjects: 12,
        averageRating: 4.8,
        totalHours: 320,
        pendingPayments: 1200
      });

      setActiveProjects([
        {
          id: '1',
          title: 'E-commerce Website Development',
          status: 'in_progress',
          client: { name: 'TechCorp Inc.' },
          budget: { amount: 2500, currency: 'USD' },
          deadline: '2024-02-15'
        },
        {
          id: '2',
          title: 'Mobile App UI Design',
          status: 'in_progress',
          client: { name: 'StartupXYZ' },
          budget: { amount: 1200, currency: 'USD' },
          deadline: '2024-02-10'
        }
      ]);

      setNewOpportunities([
        {
          id: '1',
          title: 'React Developer for SaaS Platform',
          budget: { amount: 3000, currency: 'USD' },
          proposalCount: 8,
          postedAt: '2024-01-16',
          skills: ['React', 'Node.js', 'TypeScript']
        },
        {
          id: '2',
          title: 'Content Writer for Tech Blog',
          budget: { amount: 800, currency: 'USD' },
          proposalCount: 15,
          postedAt: '2024-01-15',
          skills: ['Content Writing', 'SEO', 'Tech Writing']
        }
      ]);

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
                <Link href="/freelancer/dashboard" className="text-green-600 font-semibold">
                  Dashboard
                </Link>
                <Link href="/freelancer/projects" className="text-gray-600 hover:text-gray-900">
                  My Projects
                </Link>
                <Link href="/freelancer/browse" className="text-gray-600 hover:text-gray-900">
                  Find Work
                </Link>
                <Link href="/freelancer/proposals" className="text-gray-600 hover:text-gray-900">
                  Proposals
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
              <div className="flex items-center space-x-2">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            Good morning, {user.firstName}!
          </h1>
          <p className="text-gray-600 font-inter">
            Ready to take on new challenges today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/freelancer/browse">
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8"
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
                  <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-gray-900">${stats.pendingPayments}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2">
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
                            <span>${project.budget.amount}</span>
                            <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active projects</h3>
                    <p className="text-gray-500 mb-4">Find new projects to work on</p>
                    <Link href="/freelancer/browse">
                      <Button variant="premium" className="font-poppins">
                        Browse Projects
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* New Opportunities & Quick Actions */}
          <div className="space-y-8">
            {/* New Opportunities */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 font-poppins">New Opportunities</h2>
                  <Link href="/freelancer/browse" className="text-green-600 hover:text-green-700 text-sm font-medium">
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
                          <span className="text-lg font-semibold text-green-600">${opportunity.budget.amount}</span>
                          <span className="text-sm text-gray-500">{opportunity.proposalCount} proposals</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {opportunity.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" className="w-full font-inter">
                          View Details
                        </Button>
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
    </div>
  );
}
