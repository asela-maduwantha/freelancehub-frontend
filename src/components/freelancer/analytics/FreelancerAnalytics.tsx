'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  Star, 
  Users, 
  Calendar,
  Award,
  Target,
  Eye,
  MessageSquare,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsStats {
  totalEarnings: number;
  monthlyEarnings: number;
  earningsChange: number;
  activeProjects: number;
  completedProjects: number;
  projectsChange: number;
  averageRating: number;
  ratingChange: number;
  profileViews: number;
  viewsChange: number;
  proposalAcceptanceRate: number;
  averageResponseTime: number;
  repeatClients: number;
  topSkills: { name: string; earnings: number; projects: number }[];
}

interface EarningsData {
  month: string;
  earnings: number;
  projects: number;
}

interface ProjectData {
  name: string;
  value: number;
  color: string;
}

export function FreelancerAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats>({
    totalEarnings: 45250,
    monthlyEarnings: 8500,
    earningsChange: 12.5,
    activeProjects: 3,
    completedProjects: 28,
    projectsChange: 8.2,
    averageRating: 4.9,
    ratingChange: 0.2,
    profileViews: 342,
    viewsChange: 15.3,
    proposalAcceptanceRate: 65,
    averageResponseTime: 2.5,
    repeatClients: 12,
    topSkills: [
      { name: 'React Development', earnings: 18500, projects: 12 },
      { name: 'UI/UX Design', earnings: 15200, projects: 8 },
      { name: 'Node.js', earnings: 11550, projects: 8 }
    ]
  });

  const [earningsData, setEarningsData] = useState<EarningsData[]>([
    { month: 'Jan', earnings: 4200, projects: 3 },
    { month: 'Feb', earnings: 5800, projects: 4 },
    { month: 'Mar', earnings: 7200, projects: 5 },
    { month: 'Apr', earnings: 6800, projects: 4 },
    { month: 'May', earnings: 8500, projects: 6 },
    { month: 'Jun', earnings: 9200, projects: 7 },
  ]);

  const [projectCategories, setProjectCategories] = useState<ProjectData[]>([
    { name: 'Web Development', value: 45, color: '#10B981' },
    { name: 'Mobile Apps', value: 25, color: '#3B82F6' },
    { name: 'UI/UX Design', value: 20, color: '#8B5CF6' },
    { name: 'Consulting', value: 10, color: '#F59E0B' },
  ]);

  const [selectedTimeFrame, setSelectedTimeFrame] = useState('6months');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color, 
    prefix = '',
    suffix = '' 
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    color: string;
    prefix?: string;
    suffix?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {prefix}{value}{suffix}
      </div>
      <div className="text-gray-600 text-sm">{title}</div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats.totalEarnings)}
          change={stats.earningsChange}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Completed Projects"
          value={stats.completedProjects}
          change={stats.projectsChange}
          icon={Briefcase}
          color="bg-blue-500"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          change={stats.ratingChange}
          icon={Star}
          color="bg-yellow-500"
        />
        <StatCard
          title="Profile Views"
          value={stats.profileViews}
          change={stats.viewsChange}
          icon={Eye}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Earnings Trend</h3>
              <Badge variant="success">{formatCurrency(stats.monthlyEarnings)} this month</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {earningsData.map((data, index) => {
                const maxEarnings = Math.max(...earningsData.map(d => d.earnings));
                const height = (data.earnings / maxEarnings) * 200;
                
                return (
                  <div key={data.month} className="flex flex-col items-center flex-1">
                    <div className="text-xs text-gray-600 mb-2">
                      {formatCurrency(data.earnings)}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-1000"
                      style={{ height: `${height}px` }}
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Project Categories */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Project Categories</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${category.value}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{category.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Key Performance Indicators */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold">Key Performance Indicators</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.proposalAcceptanceRate}%
                </div>
                <div className="text-sm text-gray-600">Proposal Acceptance Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.averageResponseTime}h
                </div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.repeatClients}
                </div>
                <div className="text-sm text-gray-600">Repeat Clients</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats.activeProjects}
                </div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Top Earning Skills</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSkills.map((skill, index) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{skill.name}</div>
                    <div className="text-xs text-gray-600">{skill.projects} projects</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{formatCurrency(skill.earnings)}</div>
                    <div className="text-xs text-gray-600">earned</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-500" />
              Monthly Goals
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Earnings Goal</span>
                  <span>{formatCurrency(stats.monthlyEarnings)} / {formatCurrency(10000)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.monthlyEarnings / 10000) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Projects Goal</span>
                  <span>{stats.activeProjects} / 5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.activeProjects / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Rating Goal</span>
                  <span>{stats.averageRating} / 5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.averageRating / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-500" />
              Recommendations
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-900">Increase your rates</div>
                  <div className="text-xs text-green-700">
                    Your acceptance rate is strong. Consider raising your hourly rate by 15%.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Improve response time</div>
                  <div className="text-xs text-blue-700">
                    Respond to client messages within 1 hour to boost your profile ranking.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-purple-900">Focus on repeat clients</div>
                  <div className="text-xs text-purple-700">
                    Nurture relationships with existing clients for steady income.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
